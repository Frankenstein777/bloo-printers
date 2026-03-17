'use client'

import { useState } from 'react'
import { downloadDesignFile } from '@/hooks/useFirebaseUpload'

interface DownloadButtonsProps {
    designId: string
    files: { type: string, label: string }[]
}

export function DownloadButtons({ designId, files }: DownloadButtonsProps) {
    const [downloading, setDownloading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleDownload = async (fileType: string) => {
        setDownloading(fileType)
        setError(null)
        try {
            await downloadDesignFile(designId, fileType)
        } catch (err: any) {
            setError(err.message || 'Failed to download file')
        } finally {
            setDownloading(null)
        }
    }

    if (files.length === 0) {
        return <p className="text-sm text-gray-500">No downloadable files available.</p>
    }

    return (
        <div className="space-y-3">
            {error && (
                <div className="p-3 bg-red-100 text-red-700 text-sm rounded-md border border-red-300">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((f) => (
                    <button
                        key={f.type}
                        onClick={() => handleDownload(f.type)}
                        disabled={downloading !== null}
                        className="w-full bg-indigo-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                    >
                        {downloading === f.type ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Preparing...
                            </span>
                        ) : (
                            `Download ${f.label}`
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}
