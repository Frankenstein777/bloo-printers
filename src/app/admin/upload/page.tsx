'use client'

import { useState } from 'react'
import { FootprintEditor, EditorVertex } from '@/components/admin/FootprintEditor'
import { useRouter } from 'next/navigation'

export default function AdminUploadPage() {
    const router = useRouter()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [footprintVertices, setFootprintVertices] = useState<EditorVertex[]>([])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setIsUploading(true)
        setUploadProgress(0)

        const formData = new FormData(e.currentTarget)

        // Append footprint if not already there (it should be in the hidden input, but ensuring)
        const footprintInput = document.getElementById('footprintInput') as HTMLInputElement
        if (footprintInput) {
            formData.set('buildingFootprint', footprintInput.value)
        }

        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/admin/upload')

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percent = Math.round((event.loaded / event.total) * 100)
                setUploadProgress(percent)
            }
        }

        xhr.onload = () => {
            setIsUploading(false)
            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText)
                if (response.success) {
                    setSuccess(true)
                    // Reset form or redirect
                    if (confirm('Upload Successful! Redirect to home?')) {
                        router.push('/')
                    } else {
                        // Optional: Reset form
                        (e.target as HTMLFormElement).reset()
                        setUploadProgress(0)
                        setFootprintVertices([])
                    }
                } else {
                    setError(response.error || 'Upload failed')
                }
            } else {
                setError('Upload failed. Server responded with ' + xhr.status)
            }
        }

        xhr.onerror = () => {
            setIsUploading(false)
            setError('Upload failed due to network error')
        }

        xhr.send(formData)
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
                alert("Failed to parse DXF or no entities found.")
                return
            }

            const polylines = dxf.entities.filter(e => e.type === 'LWPOLYLINE' || e.type === 'POLYLINE')

            if (polylines.length === 0) {
                alert("No polylines found in DXF. Please ensure the footprint is a closed polyline.")
                return
            }

            // Sort by vertex count to find the main perimeter
            // @ts-ignore
            polylines.sort((a, b) => (b.vertices?.length || 0) - (a.vertices?.length || 0))

            const mainPoly = polylines[0]
            // @ts-ignore
            const rawVertices = mainPoly.vertices || []

            if (rawVertices.length === 0) return

            // Center Vertices
            let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
            // @ts-ignore
            rawVertices.forEach(v => {
                minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x)
                minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y)
            })
            const centerX = (minX + maxX) / 2
            const centerY = (minY + maxY) / 2

            // @ts-ignore
            const centered = rawVertices.map(v => ({
                x: v.x - centerX,
                y: v.y - centerY,
                bulge: v.bulge || 0
            }))

            setFootprintVertices(centered)
            const footprintInput = document.getElementById('footprintInput') as HTMLInputElement
            if (footprintInput) footprintInput.value = JSON.stringify(centered)


        } catch (err) {
            console.error("DXF Parse Error:", err)
            alert("Failed to parse DXF. Ensure it is a valid ASCII DXF file.")
        }
    }

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden md:max-w-2xl p-8 border border-gray-100 dark:border-gray-700">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Upload New Design</span>
                    {isUploading && <span className="text-xs font-normal px-2 py-1 bg-blue-100 text-blue-700 rounded-full animate-pulse">Uploading... {uploadProgress}%</span>}
                </h1>

                {/* Progress Bar */}
                {isUploading && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Success! </strong>
                        <span className="block sm:inline">Design uploaded successfully.</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea name="description" required rows={3} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Floors</label>
                            <input type="number" name="floors" required className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Bedrooms</label>
                            <input type="number" name="bedrooms" required className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Bathrooms</label>
                            <input type="number" name="bathrooms" required defaultValue="0" className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Toilets</label>
                            <input type="number" name="toilets" required defaultValue="0" className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Living Rms</label>
                            <input type="number" name="livingRooms" required defaultValue="1" className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Stairs</label>
                            <input type="number" name="stairs" required defaultValue="0" className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Exits</label>
                            <input type="number" name="exits" required defaultValue="2" className="block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600 text-sm" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm text-gray-700 dark:text-gray-300">
                            {[
                                { label: 'Family Lounge', name: 'hasFamilyLounge' },
                                { label: 'Penthouse', name: 'hasPenthouse' },
                                { label: 'Study / Office', name: 'hasStudy' },
                                { label: 'Laundry', name: 'hasLaundry' },
                                { label: 'Store', name: 'hasStore' },
                                { label: 'Ante Room', name: 'hasAnteRoom' },
                                { label: 'BQ (Boys Quarters)', name: 'hasBQ' },
                                // Amenities
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

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Plot Size</label>
                        <input name="plotSize" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tier</label>
                        <select name="tier" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            <option value="FREE">Free</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="EXCLUSIVE">Exclusive</option>
                        </select>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Modular Pricing (NGN)</label>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500">Renderings</label>
                                <input type="number" name="priceRender" defaultValue="10000" className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">DWG Files</label>
                                <input type="number" name="priceDwg" defaultValue="70000" className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">PDF Design</label>
                                <input type="number" name="pricePdf" defaultValue="40000" className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Electrical</label>
                                <input type="number" name="priceElec" defaultValue="10000" className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Mechanical</label>
                                <input type="number" name="priceMech" defaultValue="10000" className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500">Structural</label>
                                <input type="number" name="priceStruct" defaultValue="30000" className="mt-1 block w-full rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 p-2" />
                            </div>
                        </div>
                    </div>


                    {/* Plot Fitter Data */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Building Footprint</label>

                        {/* DXF Upload Helper */}
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded p-4 mb-4">
                            <label className="block text-sm font-medium text-indigo-700 dark:text-indigo-300 mb-2">
                                ✨ Auto-Fill from DXF
                            </label>
                            <input
                                type="file"
                                accept=".dxf"
                                onChange={handleDxfUpload}
                                className="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
                            />
                            <p className="text-[10px] text-gray-500 mt-1">Upload a DXF with a single closed polyline. We'll extract coordinates and center them for you.</p>
                        </div>

                        <label className="block text-xs font-medium text-gray-500 mb-1">Building Footprint Editor</label>

                        {/* Hidden input for form submission */}
                        <input type="hidden" name="buildingFootprint" id="footprintInput" />

                        <FootprintEditor
                            initialVertices={footprintVertices}
                            onChange={(json) => {
                                const el = document.getElementById('footprintInput') as HTMLInputElement
                                if (el) el.value = json
                            }}
                        />

                        {/* Helper to generate rectangle */}
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded text-xs space-y-2 mt-2">
                            <span className="font-bold block text-gray-700 dark:text-gray-300">Start with Rectangle</span>
                            <div className="flex gap-2">
                                <input type="number" id="genWidth" placeholder="Width (mm)" className="w-24 p-1 border rounded" />
                                <input type="number" id="genLength" placeholder="Length (mm)" className="w-24 p-1 border rounded" />
                                <button type="button" onClick={() => {
                                    const w = parseFloat((document.getElementById('genWidth') as HTMLInputElement).value) || 0;
                                    const l = parseFloat((document.getElementById('genLength') as HTMLInputElement).value) || 0;
                                    const hw = w / 2;
                                    const hl = l / 2;

                                    setFootprintVertices([
                                        { x: -hw, y: -hl },
                                        { x: hw, y: -hl },
                                        { x: hw, y: hl },
                                        { x: -hw, y: hl }
                                    ])
                                    const footprintInput = document.getElementById('footprintInput') as HTMLInputElement
                                    if (footprintInput) footprintInput.value = JSON.stringify([
                                        { x: -hw, y: -hl },
                                        { x: hw, y: -hl },
                                        { x: hw, y: hl },
                                        { x: -hw, y: hl }
                                    ])
                                }} className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-2 py-1 rounded">Generate</button>
                            </div>
                        </div>
                    </div>

                    {/* Software Compatibility */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Software Compatibility</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="software_REVIT" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Revit (.rvt)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="software_ARCHICAD" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>ArchiCAD (.pln)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="software_SKETCHUP" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>SketchUp (.skp)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="software_AUTOCAD" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>AutoCAD (.dwg)</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="software_PDF" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>PDF</span>
                            </label>
                        </div>
                    </div>

                    {/* File Uploads */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">Project Files</label>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Revit File (.rvt)</label>
                                <input type="file" name="rvtFile" accept=".rvt" className="block w-full text-xs text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">ArchiCAD File (.pln)</label>
                                <input type="file" name="plnFile" accept=".pln,.pla" className="block w-full text-xs text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">SketchUp File (.skp)</label>
                                <input type="file" name="skpFile" accept=".skp" className="block w-full text-xs text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Complete PDF (.pdf)</label>
                                <input type="file" name="pdfFile" accept=".pdf" className="block w-full text-xs text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">AutoCAD/DWG (.dwg)</label>
                                <input type="file" name="dwgFile" accept=".dwg,.zip" className="block w-full text-xs text-gray-500" />
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Engineering Drawings (ZIP)</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Electrical</label>
                                    <input type="file" name="electricalFile" accept=".zip,.pdf" className="block w-full text-xs text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Mechanical</label>
                                    <input type="file" name="mechanicalFile" accept=".zip,.pdf" className="block w-full text-xs text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Structural</label>
                                    <input type="file" name="structuralFile" accept=".zip,.pdf" className="block w-full text-xs text-gray-500" />
                                </div>
                            </div>
                        </div>
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Preview Images (Max 6)</label>
                        <input
                            type="file"
                            name="previewImages"
                            accept="image/*"
                            multiple
                            required
                            className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-gray-700 dark:file:text-white"
                        />
                        <p className="text-xs text-gray-500 mt-1">Select multiple files (Ctrl+Click)</p>
                    </div>

                    <button
                        type="submit"
                        disabled={isUploading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isUploading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Design'}
                    </button>
                </form >
            </div >
        </div >
    )
}
