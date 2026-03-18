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
    const [selectedFile, setSelectedFile] = useState<string>(files[0]?.type || '')

    const handleDownload = async () => {
        if (!selectedFile) return
        setDownloading(selectedFile)
        setError(null)
        try {
            await downloadDesignFile(designId, selectedFile)
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
            <div className="flex gap-2">
                <select
                    value={selectedFile}
                    onChange={(e) => setSelectedFile(e.target.value)}
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
                >
                    {files.map((f) => (
                        <option key={f.type} value={f.type}>{f.label}</option>
                    ))}
                </select>
                <button
                    onClick={handleDownload}
                    disabled={downloading !== null || !selectedFile}
                    className="w-1/3 bg-indigo-600 border border-transparent rounded-md py-3 px-4 flex items-center justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                >
                    {downloading ? (
                        <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Wait...
                        </span>
                    ) : (
                        'Download'
                    )}
                </button>
            </div>
        </div>
    )
}
