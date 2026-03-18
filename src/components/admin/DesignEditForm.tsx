'use client'

import { useState, useTransition, useRef } from 'react'
import { Design } from '@prisma/client'
import { updateDesignAction, deleteDesignAction } from '@/app/actions'
import { FootprintEditor, EditorVertex } from '@/components/admin/FootprintEditor'
import { useRouter } from 'next/navigation'
import { useFirebaseUpload } from '@/hooks/useFirebaseUpload'

interface DesignEditFormProps {
    design: Design
}

export default function DesignEditForm({ design }: DesignEditFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const { uploadFile } = useFirebaseUpload()

    // Parse initial footprint
    const initialFootprint = typeof design.buildingFootprint === 'string'
        ? JSON.parse(design.buildingFootprint)
        : design.buildingFootprint as any

    const [footprintVertices, setFootprintVertices] = useState<EditorVertex[]>(
        initialFootprint?.vertices || []
    )

    const handleSubmit = async (formData: FormData) => {
        setError('')
        setSuccess('')
        setIsUploading(true)

        startTransition(async () => {
            try {
                // Upload any new preview images to Firebase first
                const fileInput = document.getElementById('newPreviewImagesInput') as HTMLInputElement
                const files = fileInput?.files ? Array.from(fileInput.files) : []

                if (files.length > 0) {
                    const uploadedUrls: string[] = []
                    const nextIndex = design.previewImages.length

                    for (let i = 0; i < files.length; i++) {
                        const { publicUrl } = await uploadFile({
                            file: files[i],
                            designId: design.id,
                            fileType: `preview-${nextIndex + i}`,
                        })
                        uploadedUrls.push(publicUrl)
                    }

                    // Pass uploaded URLs via a hidden field the server action can read
                    formData.set('uploadedPreviewUrls', JSON.stringify(uploadedUrls))
                }

                // Clear the file input so the server action doesn't try to save them locally
                formData.delete('newPreviewImages')

                const res = await updateDesignAction(design.id, formData)
                if (res.error) {
                    setError(res.error)
                } else {
                    setSuccess('Design updated successfully')
                    router.refresh()
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Upload failed')
            } finally {
                setIsUploading(false)
            }
        })
    }

    const handleDelete = async () => {
        if (!confirm('Are you absolutely sure? This action cannot be undone.')) return

        startTransition(async () => {
            const res = await deleteDesignAction(design.id)
            if (res.error) {
                setError(res.error)
                setIsDeleteModalOpen(false)
            } else {
                router.push('/admin/designs')
            }
        })
    }

    return (
        <div className="bg-white dark:bg-slate-900 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-800">
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            {success && (
                <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                    <strong className="font-bold">Success: </strong>
                    <span className="block sm:inline">{success}</span>
                </div>
            )}

            <form action={handleSubmit} className="space-y-6">
                <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Info</h2>
                    <div className="flex gap-2">
                        {design.isFeatured && <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full font-bold">Featured</span>}
                        <span className={`px-2 py-1 text-xs rounded-full font-bold ${design.tier === 'FREE' ? 'bg-green-100 text-green-800' :
                            design.tier === 'PREMIUM' ? 'bg-blue-100 text-blue-800' :
                                'bg-purple-100 text-purple-800'
                            }`}>
                            {design.tier}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                        <input name="title" defaultValue={design.title} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tier</label>
                        <select name="tier" defaultValue={design.tier} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800">
                            <option value="FREE">Free</option>
                            <option value="PREMIUM">Premium</option>
                            <option value="EXCLUSIVE">Exclusive</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
                    <textarea name="description" defaultValue={design.description} rows={4} required className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800" />
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Specs</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Floors', name: 'floors' },
                            { label: 'Bedrooms', name: 'bedrooms' },
                            { label: 'Bathrooms', name: 'bathrooms' },
                            { label: 'Toilets', name: 'toilets' },
                            { label: 'Living Rms', name: 'livingRooms' },
                            { label: 'Stairs', name: 'stairs' },
                            { label: 'Exits', name: 'exits' },
                        ].map(field => (
                            <div key={field.name}>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{field.label}</label>
                                <input type="number" name={field.name} defaultValue={(design as any)[field.name]} className="block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Features</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Family Lounge', name: 'hasFamilyLounge' },
                            { label: 'Penthouse', name: 'hasPenthouse' },
                            { label: 'Study / Office', name: 'hasStudy' },
                            { label: 'Laundry', name: 'hasLaundry' },
                            { label: 'Store', name: 'hasStore' },
                            { label: 'Ante Room', name: 'hasAnteRoom' },
                            { label: 'BQ', name: 'hasBQ' },
                            { label: 'Featured Project', name: 'isFeatured' },
                            // New Amenities
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
                            <label key={field.name} className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
                                <input type="checkbox" name={field.name} defaultChecked={(design as any)[field.name]} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
                                <span>{field.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Pricing (NGN)</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { label: 'Renderings', name: 'priceRender', def: 10000 },
                            { label: 'DWG Files', name: 'priceDwg', def: 70000 },
                            { label: 'PDF Design', name: 'pricePdf', def: 40000 },
                            { label: 'Electrical', name: 'priceElec', def: 10000 },
                            { label: 'Mechanical', name: 'priceMech', def: 10000 },
                            { label: 'Structural', name: 'priceStruct', def: 30000 },
                        ].map(field => (
                            <div key={field.name}>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{field.label}</label>
                                <input type="number" name={field.name} defaultValue={Number((design as any)[field.name]) || field.def} className="block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800 text-sm" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Software Compatibility</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm text-slate-700 dark:text-slate-300">
                        {['REVIT', 'ARCHICAD', 'SKETCHUP', 'AUTOCAD', 'PDF'].map(soft => (
                            <label key={soft} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name={`software_${soft}`}
                                    defaultChecked={design.fileTypes.includes(soft)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <span>{soft === 'AUTOCAD' ? 'AutoCAD (.dwg)' : soft === 'REVIT' ? 'Revit (.rvt)' : soft === 'ARCHICAD' ? 'ArchiCAD (.pln)' : soft === 'SKETCHUP' ? 'SketchUp (.skp)' : 'PDF'}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Project Files (URLs/Uploads)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { label: 'Revit File (.rvt)', name: 'rvtUrl', val: design.rvtUrl },
                            { label: 'ArchiCAD File (.pln)', name: 'plnUrl', val: design.plnUrl },
                            { label: 'SketchUp File (.skp)', name: 'skpUrl', val: design.skpUrl },
                            { label: 'Complete PDF (.pdf)', name: 'pdfUrl', val: design.pdfUrl },
                            { label: 'AutoCAD/DWG (.dwg)', name: 'dwgUrl', val: design.dwgUrl },
                        ].map(file => (
                            <div key={file.name}>
                                <label className="block text-xs font-medium text-slate-500 mb-1">{file.label}</label>
                                <div className="space-y-2">
                                    <input
                                        name={file.name}
                                        defaultValue={file.val || ''}
                                        placeholder="https://..."
                                        className="block w-full text-xs rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2"
                                    />
                                    {/* Future: Add file input for re-upload if needed */}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Engineering Drawings (ZIP/PDF URLs)</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { label: 'Electrical', name: 'electricalUrl', val: design.electricalUrl },
                                { label: 'Mechanical', name: 'mechanicalUrl', val: design.mechanicalUrl },
                                { label: 'Structural', name: 'structuralUrl', val: design.structuralUrl },
                            ].map(file => (
                                <div key={file.name}>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">{file.label}</label>
                                    <input
                                        name={file.name}
                                        defaultValue={file.val || ''}
                                        placeholder="https://..."
                                        className="block w-full text-xs rounded border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Preview Images</h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {design.previewImages.map((img, idx) => (
                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group">
                                <img src={img} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            // Image removal: edit URLs directly below
                                            // (full gallery management is a pending feature)
                                            const el = document.getElementById('imageUrls')
                                            if (el) { el.scrollIntoView({ behavior: 'smooth' }); el.focus() }
                                        }}
                                        className="text-white text-xs bg-red-600 px-2 py-1 rounded"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Update Preview Images (Add New)</label>
                        <input
                            id="newPreviewImagesInput"
                            type="file"
                            name="newPreviewImages"
                            accept="image/*"
                            multiple
                            className="mt-1 block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-slate-700 dark:file:text-white"
                        />
                        <p className="text-xs text-slate-500 mt-2">To strictly manage order, you can currently edit the DB directly, but adding new ones here appends them.</p>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Plot & Footprint</h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Plot Size (Text)</label>
                        <input name="plotSize" defaultValue={design.plotSize} className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800" />
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                        <label className="block text-xs font-medium text-slate-500 mb-2">Building Footprint Editor</label>
                        <input type="hidden" name="buildingFootprint" id="footprintInput" defaultValue={JSON.stringify(initialFootprint)} />

                        <FootprintEditor
                            initialVertices={footprintVertices}
                            onChange={(json) => {
                                const el = document.getElementById('footprintInput') as HTMLInputElement
                                if (el) el.value = json
                            }}
                        />
                    </div>
                </div>

                <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <button
                        type="submit"
                        disabled={isPending}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded shadow disabled:opacity-50 transition-colors"
                    >
                        {isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200 dark:border-red-900 font-bold py-2 px-4 rounded transition-colors"
                    >
                        Delete Design
                    </button>
                </div>
            </form>

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Delete Design?</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                            This will permanently delete "{design.title}" and all associated data (purchases, likes, comments). This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded shadow"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
