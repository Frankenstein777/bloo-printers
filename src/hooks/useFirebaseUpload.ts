/**
 * useFirebaseUpload — React hook for uploading files to Firebase Storage
 * via the server-side proxy route at POST /api/upload/file.
 *
 * Files go: Browser → Next.js server → Firebase Storage Admin SDK
 * This avoids any CORS issues (no browser→Firebase direct connection needed).
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
        const body = new FormData()
        body.append('file', file)
        body.append('designId', designId)
        body.append('fileType', fileType)

        // Use XHR so we can track upload progress
        const result = await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', '/api/upload/file')

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const pct = Math.round((event.loaded / event.total) * 100)
              setProgress(pct)
              onProgress?.(pct)
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText)
                if (data.error) reject(new Error(data.error))
                else resolve(data as UploadResult)
              } catch {
                reject(new Error('Invalid server response'))
              }
            } else {
              let msg = `Upload failed (HTTP ${xhr.status})`
              try { msg = JSON.parse(xhr.responseText).error || msg } catch { /* keep msg */ }
              reject(new Error(msg))
            }
          }

          xhr.onerror = () => reject(new Error('Network error — check your internet connection'))
          xhr.send(body)
        })

        setProgress(100)
        return result
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
