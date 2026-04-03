/**
 * useFirebaseUpload — React hook for uploading files to Firebase Storage
 * via the server-side proxy route at POST /api/upload/presigned-url.
 *
 * Files go: Browser → Firebase Storage directly!
 * This avoids any Next.js size limits or 413 File Too Large errors.
 *
 * Usage:
 *   const { uploadFile, uploading, progress } = useFirebaseUpload()
 *
 *   const { key, publicUrl } = await uploadFile({
 *     file,
 *     designId: 'design-uuid',
 *     fileType: 'rvt',   // or 'preview-0', 'dwg', etc.
 *   })
 */

'use client'

import { useState, useCallback } from 'react'

interface UploadOptions {
  file: File
  designId: string
  /** e.g. "rvt", "pln", "dwg", "pdf", "skp", "electrical", "mechanical", "structural", "preview-0" */
  fileType: string
  /** optional progress callback (0–100) */
  onProgress?: (pct: number) => void
}

interface UploadResult {
  key: string
  publicUrl: string
}

export function useFirebaseUpload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async ({ file, designId, fileType, onProgress }: UploadOptions): Promise<UploadResult> => {
      setError(null)
      setUploading(true)
      setProgress(0)

      try {
        // 1. Get Presigned URL
        const presignedRes = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId,
            fileType,
            originalName: file.name,
            contentType: file.type || 'application/octet-stream'
          })
        })

        if (!presignedRes.ok) {
          const errData = await presignedRes.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to get upload URL')
        }

        const { uploadUrl, key, publicUrl } = await presignedRes.json()

        // 2. Upload directly to Firebase Storage using XHR for progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl)
          // Essential for Firebase Storage / S3 signed URLs
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100)
              setProgress(pct)
              onProgress?.(pct)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Direct upload failed (HTTP ${xhr.status})`))
            }
          }

          xhr.onerror = () => reject(new Error('Network error — check your internet connection'))
          xhr.send(file)
        })

        setProgress(100)
        return { key, publicUrl }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        throw err
      } finally {
        setUploading(false)
      }
    },
    []
  )

  /** Upload multiple files (e.g. preview images) sequentially */
  const uploadFiles = useCallback(
    async (
      files: File[],
      designId: string,
      fileTypePrefix: string // "preview" → "preview-0", "preview-1", …
    ): Promise<UploadResult[]> => {
      const results: UploadResult[] = []
      for (let i = 0; i < files.length; i++) {
        const result = await uploadFile({
          file: files[i],
          designId,
          fileType: `${fileTypePrefix}-${i}`,
        })
        results.push(result)
      }
      return results
    },
    [uploadFile]
  )

  return { uploadFile, uploadFiles, uploading, progress, error }
}

/**
 * Trigger a secure download of a purchased design file.
 * Calls /api/download/presigned-url which verifies the purchase
 * and returns a short-lived Firebase signed download URL.
 */
export async function downloadDesignFile(designId: string, fileType: string): Promise<void> {
  const res = await fetch('/api/download/presigned-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ designId, fileType }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Download failed' }))
    throw new Error(err.error || 'Failed to get download URL')
  }

  const { downloadUrl } = await res.json()
  window.location.href = downloadUrl
}
