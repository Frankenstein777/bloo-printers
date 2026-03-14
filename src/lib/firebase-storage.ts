/**
 * firebase-storage.ts — Firebase Storage helpers for Octoplans
 *
 * Uses the Firebase Admin SDK (server-side only) to generate
 * signed upload and download URLs, delete files, etc.
 *
 * Presigned URL flow (identical to the previous S3 implementation):
 *  1. Admin calls POST /api/upload/presigned-url → gets a signed PUT URL
 *  2. Browser PUTs the file directly to that URL (no bytes through Next.js server)
 *  3. Server stores the storage key in the DB
 *
 *  4. User calls POST /api/download/presigned-url
 *  5. Server verifies purchase → returns a signed GET URL (10-min expiry)
 *  6. Browser navigates to the URL → file downloads directly from Firebase
 */

import { adminStorage } from './firebase-admin'

const BUCKET = () => adminStorage.bucket() // lazy — avoids calling before app is ready

// ─── Signed Upload URL ────────────────────────────────────────────────────────

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 300
): Promise<string> {
  const [url] = await BUCKET().file(key).getSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + expiresInSeconds * 1000,
    contentType,
  })
  return url
}

// ─── Signed Download URL ──────────────────────────────────────────────────────

export async function getPresignedDownloadUrl(
  key: string,
  filename?: string,
  expiresInSeconds = 600
): Promise<string> {
  const [url] = await BUCKET().file(key).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
    responseDisposition: filename
      ? `attachment; filename="${filename}"`
      : undefined,
  })
  return url
}

// ─── Delete File ─────────────────────────────────────────────────────────────

export async function deleteStorageFile(key: string): Promise<void> {
  await BUCKET().file(key).delete({ ignoreNotFound: true })
}

// ─── Public URL helper ────────────────────────────────────────────────────────

/**
 * Returns the direct Firebase Storage download URL for a file.
 * Note: the file must be public (or use getPresignedDownloadUrl for private files).
 */
export function storagePublicUrl(key: string): string {
  const bucket = process.env.FIREBASE_STORAGE_BUCKET!
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(key)}?alt=media`
}

// ─── Key Builders ─────────────────────────────────────────────────────────────

/**
 * Canonical storage key for a design file.
 * e.g. "designs/abc123/rvt.rvt"
 */
export function designFileKey(
  designId: string,
  fileType: string,
  originalName: string
): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'bin'
  return `designs/${designId}/${fileType}.${ext}`
}

/**
 * Canonical storage key for a preview image.
 * e.g. "designs/abc123/preview-0.jpg"
 */
export function previewImageKey(
  designId: string,
  index: number,
  originalName: string
): string {
  const ext = originalName.split('.').pop()?.toLowerCase() ?? 'jpg'
  return `designs/${designId}/preview-${index}.${ext}`
}
