'use client'

import { useState } from 'react'
import DesignImage from './DesignImage'
import { ProtectedImage } from './ProtectedImage'
import { WatermarkOverlay } from './WatermarkOverlay'
import { X, Maximize2 } from 'lucide-react'

interface ImageGalleryProps {
    images: string[]
    title: string
    showBlur?: boolean
}

export function ImageGallery({ images, title, showBlur = false }: ImageGalleryProps) {
    const [mainImage, setMainImage] = useState(images[0])
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    return (
        <div className="space-y-4">
            {/* Main Large Image */}
            <div
                className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 border border-slate-200 dark:border-slate-800 cursor-pointer shadow-lg"
                onClick={() => setIsLightboxOpen(true)}
            >
                <ProtectedImage
                    src={mainImage}
                    alt={title}
                    showBlur={showBlur}
                />

                {/* Hover Hint */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 z-50">
                    <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2 rounded-full shadow-xl">
                        <Maximize2 className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Thumbnails Grid */}
            {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                    {images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setMainImage(img)}
                            className={`
                                relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 transition-all
                                ${mainImage === img
                                    ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                                    : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}
                            `}
                        >
                            <WatermarkOverlay />
                            <DesignImage
                                src={img}
                                alt={`${title} view ${idx + 1}`}
                                fill
                                className="object-cover select-none pointer-events-none"
                                sizes="(max-width: 768px) 25vw, 15vw"
                            />
                        </button>
                    ))}
                </div>
            )}

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-10">
                    <button
                        onClick={() => setIsLightboxOpen(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full z-[110] transition-colors"
                    >
                        <X size={32} />
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center">
                        <ProtectedImage
                            src={mainImage}
                            alt={title}
                            showBlur={showBlur}
                            objectFit="contain" // Show full image in lightbox
                        />
                    </div>

                    {/* Simple Bottom Label */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-white/10">
                        <p className="text-white/60 text-xs font-mono uppercase tracking-widest">{title} - Full View</p>
                    </div>
                </div>
            )}
        </div>
    )
}
