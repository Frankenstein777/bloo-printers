'use client'

import { useState } from 'react'
import { FootprintEditor, EditorVertex } from '@/components/admin/FootprintEditor'
import { useRouter } from 'next/navigation'
import { useFirebaseUpload } from '@/hooks/useFirebaseUpload'

// Design file inputs (fileType → input name → accept)
const DESIGN_FILE_INPUTS = [
  { fileType: 'rvt',        name: 'rvtFile',         label: 'Revit File (.rvt)',        accept: '.rvt' },
  { fileType: 'pln',        name: 'plnFile',         label: 'ArchiCAD File (.pln)',     accept: '.pln,.pla' },
  { fileType: 'skp',        name: 'skpFile',         label: 'SketchUp File (.skp)',     accept: '.skp' },
  { fileType: 'pdf',        name: 'pdfFile',         label: 'Complete PDF (.pdf)',      accept: '.pdf' },
  { fileType: 'dwg',        name: 'dwgFile',         label: 'AutoCAD/DWG (.dwg)',      accept: '.dwg,.zip' },
  { fileType: 'electrical', name: 'electricalFile',  label: 'Electrical (ZIP/PDF)',     accept: '.zip,.pdf' },
  { fileType: 'mechanical', name: 'mechanicalFile',  label: 'Mechanical (ZIP/PDF)',     accept: '.zip,.pdf' },
  { fileType: 'structural', name: 'structuralFile',  label: 'Structural (ZIP/PDF)',     accept: '.zip,.pdf' },
] as const

export default function ArchitectUploadPage() {
  const router = useRouter()
  const { uploadFile, uploadFiles } = useFirebaseUpload()

  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [footprintVertices, setFootprintVertices] = useState<EditorVertex[]>([])

  // ── File state (we track File objects; S3 keys come back after upload) ───────
  const [designFiles, setDesignFiles] = useState<Record<string, File | null>>({})
  const [previewFiles, setPreviewFiles] = useState<File[]>([])
  const [floorPlanFiles, setFloorPlanFiles] = useState<File[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsUploading(true)
    setUploadProgress(0)

    const form = e.currentTarget
    const formData = new FormData(form)

    // ── 1. Generate a temporary design ID for S3 key structure ────────────────
    // We use crypto.randomUUID(). The actual DB record will use this same ID via upsert.
    const tempDesignId = crypto.randomUUID()

    try {
      // ── 2. Upload preview images to S3 ─────────────────────────────────────
      if (previewFiles.length === 0) {
        setError('At least one preview image is required.')
        setIsUploading(false)
        return
      }

      const totalFiles = previewFiles.length + Object.values(designFiles).filter(Boolean).length
      let uploadedCount = 0

      const updateProgress = () => {
        uploadedCount++
        setUploadProgress(Math.round((uploadedCount / totalFiles) * 100))
      }

      setUploadStatus('Uploading preview images…')
      const previewUrls: string[] = []
      for (let i = 0; i < previewFiles.length; i++) {
        setUploadStatus(`Uploading preview image ${i + 1} of ${previewFiles.length}…`)
        const { publicUrl } = await uploadFile({ file: previewFiles[i], designId: tempDesignId, fileType: `preview-${i}` })
        previewUrls.push(publicUrl)
        updateProgress()
      }

      setUploadStatus('Uploading floor plan images…')
      const floorPlanUrls: string[] = []
      for (let i = 0; i < floorPlanFiles.length; i++) {
        setUploadStatus(`Uploading floor plan ${i + 1} of ${floorPlanFiles.length}…`)
        const { publicUrl } = await uploadFile({ file: floorPlanFiles[i], designId: tempDesignId, fileType: `floorplan-${i}` })
        floorPlanUrls.push(publicUrl)
        updateProgress()
      }

      // ── 3. Upload design files to S3 ───────────────────────────────────────
      const fileKeys: Record<string, string> = {}
      for (const { fileType, name } of DESIGN_FILE_INPUTS) {
        const file = designFiles[name]
        if (file) {
          setUploadStatus(`Uploading ${fileType.toUpperCase()} file…`)
          const { key } = await uploadFile({ file, designId: tempDesignId, fileType })
          fileKeys[fileType] = key
          updateProgress()
        }
      }

      setUploadStatus('Saving design metadata…')

      // ── 4. POST metadata (no files) to the server action route ─────────────
      const footprintEl = document.getElementById('footprintInput') as HTMLInputElement
      const payload = {
        designId: tempDesignId,
        title:        formData.get('title'),
        description:  formData.get('description'),
        tier:         formData.get('tier'),
        priceRender:  formData.get('priceRender'),
        priceDwg:     formData.get('priceDwg'),
        pricePdf:     formData.get('pricePdf'),
        priceElec:    formData.get('priceElec'),
        priceMech:    formData.get('priceMech'),
        priceStruct:  formData.get('priceStruct'),
        floors:       formData.get('floors'),
        bedrooms:     formData.get('bedrooms'),
        bathrooms:    formData.get('bathrooms'),
        toilets:      formData.get('toilets'),
        livingRooms:  formData.get('livingRooms'),
        stairs:       formData.get('stairs'),
        exits:        formData.get('exits'),
        plotSize:     formData.get('plotSize'),
        plotArea:     formData.get('plotArea'),
        buildingFootprint: footprintEl?.value || '[]',
        // Booleans
        hasFamilyLounge: formData.get('hasFamilyLounge') === 'on',
        hasPenthouse:    formData.get('hasPenthouse') === 'on',
        hasStudy:        formData.get('hasStudy') === 'on',
        hasLaundry:      formData.get('hasLaundry') === 'on',
        hasStore:        formData.get('hasStore') === 'on',
        hasAnteRoom:     formData.get('hasAnteRoom') === 'on',
        hasBQ:           formData.get('hasBQ') === 'on',
        hasCinema:       formData.get('hasCinema') === 'on',
        hasGym:          formData.get('hasGym') === 'on',
        hasGameRoom:     formData.get('hasGameRoom') === 'on',
        hasBar:          formData.get('hasBar') === 'on',
        hasRooftop:      formData.get('hasRooftop') === 'on',
        hasReadingRoom:  formData.get('hasReadingRoom') === 'on',
        hasSpa:          formData.get('hasSpa') === 'on',
        hasIndoorPool:   formData.get('hasIndoorPool') === 'on',
        hasCourtyard:    formData.get('hasCourtyard') === 'on',
        hasAtrium:       formData.get('hasAtrium') === 'on',
        hasLoggia:       formData.get('hasLoggia') === 'on',
        hasPetRoom:      formData.get('hasPetRoom') === 'on',
        hasBasement:     formData.get('hasBasement') === 'on',
        hasGarage:       formData.get('hasGarage') === 'on',
        hasPool:         formData.get('hasPool') === 'on',
        hasGatehouse:    formData.get('hasGatehouse') === 'on',
        hasColdRoom:     formData.get('hasColdRoom') === 'on',
        hasPantry:       formData.get('hasPantry') === 'on',
        hasPanicRoom:    formData.get('hasPanicRoom') === 'on',
        hasMusicRoom:    formData.get('hasMusicRoom') === 'on',
        hasStudio:       formData.get('hasStudio') === 'on',
        // Software types
        software_REVIT:    formData.get('software_REVIT') === 'on',
        software_ARCHICAD: formData.get('software_ARCHICAD') === 'on',
        software_SKETCHUP: formData.get('software_SKETCHUP') === 'on',
        software_AUTOCAD:  formData.get('software_AUTOCAD') === 'on',
        software_PDF:      formData.get('software_PDF') === 'on',
        // S3 keys (not file content)
        previewImages: previewUrls,
        floorPlanImages: floorPlanUrls,
        rvtUrl:         fileKeys['rvt']         ?? null,
        plnUrl:         fileKeys['pln']         ?? null,
        skpUrl:         fileKeys['skp']         ?? null,
        pdfUrl:         fileKeys['pdf']         ?? null,
        dwgUrl:         fileKeys['dwg']         ?? null,
        electricalUrl:  fileKeys['electrical']  ?? null,
        mechanicalUrl:  fileKeys['mechanical']  ?? null,
        structuralUrl:  fileKeys['structural']  ?? null,
      }

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save design metadata')
        return
      }

      setSuccess(true)
      setUploadStatus('Done!')
      setTimeout(() => router.push('/architect/dashboard'), 1200)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDxfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const DxfParser = (await import('dxf-parser')).default
      const parser = new DxfParser()
      const dxf = parser.parseSync(text)

      if (!dxf || !dxf.entities) {
        setError('Failed to parse DXF or no entities found.')
        return
      }

      const polylines = dxf.entities.filter(
        (e: any) => e.type === 'LWPOLYLINE' || e.type === 'POLYLINE'
      )

      if (polylines.length === 0) {
        setError('No polylines found in DXF. Please ensure the footprint is a closed polyline.')
        return
      }

      polylines.sort((a: any, b: any) => (b.vertices?.length || 0) - (a.vertices?.length || 0))

      const mainPoly = polylines[0]
      const rawVertices = (mainPoly as any).vertices || []
      if (rawVertices.length === 0) return

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      rawVertices.forEach((v: any) => {
        minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x)
        minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y)
      })

      const centered = rawVertices.map((v: any) => ({
        x: v.x - (minX + maxX) / 2,
        y: v.y - (minY + maxY) / 2,
        bulge: v.bulge || 0,
      }))

      setFootprintVertices(centered)
      const el = document.getElementById('footprintInput') as HTMLInputElement
      if (el) el.value = JSON.stringify(centered)
    } catch (err) {
      console.error('DXF Parse Error:', err)
      setError('Failed to parse DXF. Ensure it is a valid ASCII DXF file.')
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const labelCls = 'block text-sm font-medium text-gray-700 dark:text-gray-300'
  const inputCls = 'mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500'

  return (
    <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8 border border-gray-100 dark:border-gray-700">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
          <span>Upload New Design</span>
          {isUploading && (
            <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full animate-pulse">
              {uploadStatus} {uploadProgress}%
            </span>
          )}
        </h1>

        {/* Progress Bar */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded" role="alert">
            <strong className="font-bold">Success! </strong>
            <span className="block sm:inline">Design uploaded successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <label className={labelCls}>Title</label>
            <input name="title" required className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea name="description" required rows={3} className={inputCls} />
          </div>

          {/* Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Floors',     name: 'floors',      def: undefined },
              { label: 'Bedrooms',   name: 'bedrooms',    def: undefined },
              { label: 'Bathrooms',  name: 'bathrooms',   def: '0' },
              { label: 'Toilets',    name: 'toilets',     def: '0' },
              { label: 'Living Rms', name: 'livingRooms', def: '1' },
              { label: 'Stairs',     name: 'stairs',      def: '0' },
              { label: 'Exits',      name: 'exits',       def: '2' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">{f.label}</label>
                <input
                  type="number" name={f.name} required
                  defaultValue={f.def}
                  className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm text-gray-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          {/* Features */}
          <div>
            <label className={labelCls + ' mb-2'}>Features</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700 dark:text-gray-300">
              {[
                { label: 'Family Lounge', name: 'hasFamilyLounge' },
                { label: 'Penthouse', name: 'hasPenthouse' },
                { label: 'Study / Office', name: 'hasStudy' },
                { label: 'Laundry', name: 'hasLaundry' },
                { label: 'Store', name: 'hasStore' },
                { label: 'Ante Room', name: 'hasAnteRoom' },
                { label: 'BQ', name: 'hasBQ' },
                { label: 'Home Cinema', name: 'hasCinema' },
                { label: 'Gym', name: 'hasGym' },
                { label: 'Game Room', name: 'hasGameRoom' },
                { label: 'Bar', name: 'hasBar' },
                { label: 'Rooftop Lounge', name: 'hasRooftop' },
                { label: 'Reading Room', name: 'hasReadingRoom' },
                { label: 'Spa', name: 'hasSpa' },
                { label: 'Indoor Pool', name: 'hasIndoorPool' },
                { label: 'Courtyard', name: 'hasCourtyard' },
                { label: 'Atrium', name: 'hasAtrium' },
                { label: 'Loggia', name: 'hasLoggia' },
                { label: 'Pet Room', name: 'hasPetRoom' },
                { label: 'Basement', name: 'hasBasement' },
                { label: 'Garage', name: 'hasGarage' },
                { label: 'Swimming Pool', name: 'hasPool' },
                { label: 'Gatehouse', name: 'hasGatehouse' },
                { label: 'Cold Room', name: 'hasColdRoom' },
                { label: 'Pantry', name: 'hasPantry' },
                { label: 'Panic Room', name: 'hasPanicRoom' },
                { label: 'Music Room', name: 'hasMusicRoom' },
                { label: 'Studio', name: 'hasStudio' },
              ].map(field => (
                <label key={field.name} className="flex items-center space-x-2">
                  <input type="checkbox" name={field.name} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span>{field.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Plot & Tier */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Plot Size</label>
              <input name="plotSize" required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Plot Area (m²)</label>
              <input type="number" name="plotArea" className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls}>Tier</label>
            <select name="tier" className={inputCls}>
              <option value="FREE">Free</option>
              <option value="PREMIUM">Premium</option>
              <option value="EXCLUSIVE">Exclusive</option>
              <option value="ONETIME">One-Time Sale</option>
            </select>
          </div>

          {/* Pricing */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Modular Pricing (NGN)
            </label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Renderings',  name: 'priceRender', def: '10000' },
                { label: 'DWG Files',   name: 'priceDwg',    def: '70000' },
                { label: 'PDF Design',  name: 'pricePdf',    def: '40000' },
                { label: 'Electrical',  name: 'priceElec',   def: '10000' },
                { label: 'Mechanical',  name: 'priceMech',   def: '10000' },
                { label: 'Structural',  name: 'priceStruct', def: '30000' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400">{f.label}</label>
                  <input type="number" name={f.name} defaultValue={f.def}
                    className="mt-1 block w-full rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white p-2" />
                </div>
              ))}
            </div>
          </div>

          {/* Building Footprint */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Building Footprint
            </label>
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded p-4">
              <label className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">✨ Auto-Fill from DXF</label>
              <input type="file" accept=".dxf" onChange={handleDxfUpload}
                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700" />
              <p className="text-[10px] text-gray-500 mt-1">Upload a DXF with a single closed polyline.</p>
            </div>

            <input type="hidden" name="buildingFootprint" id="footprintInput" />
            <FootprintEditor
              initialVertices={footprintVertices}
              onChange={(json) => {
                const el = document.getElementById('footprintInput') as HTMLInputElement
                if (el) el.value = json
              }}
            />

            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs space-y-2">
              <span className="font-bold block text-gray-700 dark:text-gray-300">Start with Rectangle</span>
              <div className="flex gap-2">
                <input type="number" id="genWidth"  placeholder="Width (mm)"  className="w-24 p-1 border rounded dark:bg-gray-700 dark:text-white" />
                <input type="number" id="genLength" placeholder="Length (mm)" className="w-24 p-1 border rounded dark:bg-gray-700 dark:text-white" />
                <button type="button" onClick={() => {
                  const w  = parseFloat((document.getElementById('genWidth')  as HTMLInputElement).value) || 0
                  const l  = parseFloat((document.getElementById('genLength') as HTMLInputElement).value) || 0
                  const hw = w / 2; const hl = l / 2
                  const verts = [{ x: -hw, y: -hl }, { x: hw, y: -hl }, { x: hw, y: hl }, { x: -hw, y: hl }]
                  setFootprintVertices(verts)
                  const el = document.getElementById('footprintInput') as HTMLInputElement
                  if (el) el.value = JSON.stringify(verts)
                }} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-2 py-1 rounded">
                  Generate
                </button>
              </div>
            </div>
          </div>

          {/* Software Compatibility */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Software Compatibility</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
              {[
                { name: 'software_REVIT',    label: 'Revit (.rvt)' },
                { name: 'software_ARCHICAD', label: 'ArchiCAD (.pln)' },
                { name: 'software_SKETCHUP', label: 'SketchUp (.skp)' },
                { name: 'software_AUTOCAD',  label: 'AutoCAD (.dwg)' },
                { name: 'software_PDF',      label: 'PDF' },
              ].map(f => (
                <label key={f.name} className="flex items-center space-x-2">
                  <input type="checkbox" name={f.name} className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  <span>{f.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Files — collected as File objects, uploaded to S3 on submit */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Project Files <span className="text-xs font-normal text-gray-500">(uploaded directly to S3)</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DESIGN_FILE_INPUTS.map(({ name, label, accept }) => (
                <div key={name}>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="file"
                    accept={accept}
                    onChange={e => setDesignFiles(prev => ({ ...prev, [name]: e.target.files?.[0] ?? null }))}
                    className="block w-full text-sm text-gray-500 dark:text-gray-400 file:cursor-pointer file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-bold file:bg-[#00f2ff]/10 file:text-[#00a3ad] dark:file:text-[#00f2ff] hover:file:bg-[#00f2ff]/20 transition-all cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3 bg-white dark:bg-slate-800"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview Images */}
          <div>
            <label className={labelCls}>Preview Images (Max 6)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={e => setPreviewFiles(Array.from(e.target.files || []).slice(0, 6))}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Select multiple files (Ctrl+Click) — max 6</p>
            {previewFiles.length > 0 && (
              <p className="text-xs text-green-600 mt-1">✓ {previewFiles.length} image(s) selected</p>
            )}
          </div>

          {/* Floor Plan Images */}
          <div>
            <label className={labelCls}>Floor Plan Images</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={e => setFloorPlanFiles(Array.from(e.target.files || []).slice(0, 6))}
              className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 dark:file:bg-gray-700 dark:file:text-white"
            />
            <p className="text-xs text-gray-500 mt-1">Select multiple files (Ctrl+Click). Premium subscribers will see these.</p>
            {floorPlanFiles.length > 0 && (
              <p className="text-xs text-green-600 mt-1">✓ {floorPlanFiles.length} image(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {isUploading ? `${uploadStatus} (${uploadProgress}%)` : 'Upload Design'}
          </button>
        </form>
      </div>
    </div>
  )
}
