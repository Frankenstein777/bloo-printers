'use client'

import React from 'react'
import DesignImage from '@/components/DesignImage'
import { WatermarkOverlay } from './WatermarkOverlay'

interface ProtectedImageProps {
    src: string
    alt: string
    showBlur: boolean
    objectFit?: 'cover' | 'contain'
}

export function ProtectedImage({ src, alt, showBlur, objectFit = 'cover' }: ProtectedImageProps) {
    return (
        <div
            className="w-full h-full relative select-none animate-in fade-in duration-300"
            onContextMenu={(e) => e.preventDefault()}
        >
            <WatermarkOverlay />
            <DesignImage
                src={src}
                alt={alt}
                fill
                className={`pointer-events-none select-none ${showBlur ? 'blur-md' : ''}`}
                style={{ objectFit }}
            />
            {showBlur && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
                    <div className="text-center bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Premium Design</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Subscribe or purchase to view detailed plans.</p>
                    </div>
                </div>
            )}
            {/* Invisibile Overlay to prevent selection/save-as on Firefox etc */}
            <div className="absolute inset-0 z-40 bg-transparent" />
        </div>
    )
}
