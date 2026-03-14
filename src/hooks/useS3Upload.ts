/**
 * useS3Upload — React hook for uploading files directly to S3 via presigned URLs.
 *
 * Usage:
 *   const { uploadFile, uploading, progress } = useS3Upload()
 *
 *   const s3Key = await uploadFile({
 *     file,
 *     designId: 'design-123',
 *     fileType: 'rvt',     // or 'preview-0', 'dwg', etc.
 *   })
 *
 *   // Store s3Key in your form state → sent to the server action
 *
 * The hook:
 *  1. Calls POST /api/upload/presigned-url to get a PUT URL from the server
 *  2. Puts the file directly to S3 using the presigned URL (no server proxy)
 *  3. Returns the S3 key (store this in Prisma, not the full URL)
 */

'use client'

import { useState, useCallback } from 'react'

interface UploadOptions {
  file: File
  designId: string
  /** e.g. "rvt", "pln", "dwg", "pdf", "skp", "electrical", "mechanical", "structural", "preview-0" */
  fileType: string
}

interface UploadResult {
  key: string
  publicUrl: string
}

export function useS3Upload() {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = useCallback(
    async ({ file, designId, fileType }: UploadOptions): Promise<UploadResult> => {
      setError(null)
      setUploading(true)
      setProgress(0)

      try {
        // Step 1: Get presigned URL from our API
        const res = await fetch('/api/upload/presigned-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            designId,
            fileType,
            originalName: file.name,
            contentType: file.type || 'application/octet-stream',
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(err.error || 'Failed to get upload URL')
        }

        const { uploadUrl, key, publicUrl } = await res.json()

        // Step 2: Upload directly to S3 using XMLHttpRequest (so we can track progress)
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('PUT', uploadUrl)
          xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              setProgress(Math.round((event.loaded / event.total) * 100))
            }
          }

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              setProgress(100)
              resolve()
            } else {
              reject(new Error(`S3 upload failed with status ${xhr.status}`))
            }
          }

          xhr.onerror = () => reject(new Error('Network error during S3 upload'))
          xhr.send(file)
        })

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

  /**
   * Upload multiple files (e.g. preview images) sequentially.
   * Returns an array of S3 keys in the same order as the input files.
   */
  const uploadFiles = useCallback(
    async (
      files: File[],
      designId: string,
      fileTypePrefix: string // e.g. "preview" → produces "preview-0", "preview-1", …
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
 * Trigger a download of a purchased design file.
 * Calls the presigned download API then immediately navigates to the URL.
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
  // Open in the same tab — browser will treat it as a download because of Content-Disposition
  window.location.href = downloadUrl
}
