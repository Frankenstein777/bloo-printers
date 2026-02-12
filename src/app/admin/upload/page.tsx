'use client'

import { useActionState, useState } from 'react'
import { uploadDesignAction } from '@/app/actions'
import { FootprintEditor, EditorVertex } from '@/components/admin/FootprintEditor'

const initialState = {
    error: '',
    success: false
}

export default function AdminUploadPage() {
    const [state, formAction, isPending] = useActionState(uploadDesignAction, initialState)
    const [footprintVertices, setFootprintVertices] = useState<EditorVertex[]>([])

    const generateSvgPath = (vertices: any[]) => {
        if (vertices.length === 0) return ""

        // 1. Center vertices first
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        vertices.forEach(v => {
            minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x)
            minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y)
        })
        const centerX = (minX + maxX) / 2
        const centerY = (minY + maxY) / 2

        const centered = vertices.map(v => ({
            ...v,
            x: v.x - centerX,
            y: v.y - centerY
        }))

        // 2. Build SVG Path
        let path = `M ${centered[0].x.toFixed(2)} ${centered[0].y.toFixed(2)}`

        for (let i = 0; i < centered.length; i++) {
            const v1 = centered[i]
            const nextIdx = (i + 1) % centered.length
            const v2 = centered[nextIdx]

            // If the polyline is not closed and we are at the last vertex, skip
            if (nextIdx === 0 && i === centered.length - 1) break

            const bulge = v1.bulge || 0
            if (bulge === 0) {
                path += ` L ${v2.x.toFixed(2)} ${v2.y.toFixed(2)}`
            } else {
                const dx = v2.x - v1.x
                const dy = v2.y - v1.y
                const L = Math.sqrt(dx * dx + dy * dy)
                const r = (L / 2) * (1 + bulge * bulge) / (2 * Math.abs(bulge))
                const largeArc = Math.abs(bulge) > 1 ? 1 : 0
                const sweep = bulge < 0 ? 1 : 0
                path += ` A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} ${sweep} ${v2.x.toFixed(2)} ${v2.y.toFixed(2)}`
            }
        }
        return path + " Z"
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

        } catch (err) {
            console.error("DXF Parse Error:", err)
            alert("Failed to parse DXF. Ensure it is a valid ASCII DXF file.")
        }
    }

    return (
        <div className="min-h-screen bg-transparent py-12 px-4 sm:px-6 lg:px-8 transition-colors">
            <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Upload New Design</h1>

                {state.error && (
                    <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <strong className="font-bold">Error: </strong>
                        <span className="block sm:inline">{state.error}</span>
                    </div>
                )}

                < form action={formAction} className="space-y-4" >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
                        <input name="title" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea name="description" required className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Floors</label>
                            <input type="number" name="floors" required className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                            <input type="number" name="bedrooms" required className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
                            <input type="number" name="bathrooms" required defaultValue="0" className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Toilets</label>
                            <input type="number" name="toilets" required defaultValue="0" className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Living Rms</label>
                            <input type="number" name="livingRooms" required defaultValue="1" className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Stairs</label>
                            <input type="number" name="stairs" required defaultValue="0" className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exits</label>
                            <input type="number" name="exits" required defaultValue="2" className="mt-1 block w-full rounded-md border p-2 bg-white dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</label>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasFamilyLounge" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Family Lounge</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasPenthouse" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Penthouse</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasStudy" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Study / Office</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasAnteRoom" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Ante Room</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasLaundry" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Laundry</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasStore" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>Store</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" name="hasBQ" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>BQ (Boys Quarters)</span>
                            </label>
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

                                    // Set Vertices for Editor
                                    setFootprintVertices([
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
                        disabled={isPending}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isPending ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                        {isPending ? 'Uploading...' : 'Upload Design'}
                    </button>
                </form >
            </div >
        </div >
    )
}
