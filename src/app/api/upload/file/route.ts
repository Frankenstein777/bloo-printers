/**
 * POST /api/upload/file
 *
 * Admin-only. The browser sends a file as multipart/form-data.
 * This server streams it directly to Firebase Storage using the Admin SDK.
 * No CORS config needed — the upload goes browser → Next.js → Firebase.
 *
 * FormData fields:
 *   file        — the binary file
 *   designId    — Prisma Design ID (pre-generated UUID)
 *   fileType    — "rvt" | "pln" | "dwg" | "pdf" | "skp" |
 *                 "electrical" | "mechanical" | "structural" | "preview-0" | …
 *
 * Response:
 *   { key: string, publicUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { adminStorage } from '@/lib/firebase-admin'
import { designFileKey, previewImageKey, storagePublicUrl } from '@/lib/firebase-storage'
import { Readable } from 'stream'
import sharp from 'sharp'

export const runtime = 'nodejs'
// Allow up to 500 MB — large RVT/DWG files
export const maxDuration = 120

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Parse multipart ───────────────────────────────────────────
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  const designId = formData.get('designId') as string | null
  const fileType = formData.get('fileType') as string | null

  if (!file || !designId || !fileType) {
    return NextResponse.json(
      { error: 'file, designId, and fileType are required' },
      { status: 400 }
    )
  }

  // ── Build storage key ─────────────────────────────────────────
  const isPreview = fileType.startsWith('preview-')
  const index = isPreview ? parseInt(fileType.replace('preview-', ''), 10) : 0

  const key = isPreview
    ? previewImageKey(designId, index, file.name)
    : designFileKey(designId, fileType, file.name)

  // ── Upload ──────────────────────────────────────────
  try {
    const bucket = adminStorage.bucket()
    const contentType = file.type || 'application/octet-stream'

    if (isPreview) {
      const buffer = Buffer.from(await file.arrayBuffer())

      // 1. Process and upload clean image with EXIF metadata
      const cleanBuffer = await sharp(buffer)
        .withMetadata({
          exif: {
            IFD0: {
              Copyright: 'made by octoplans',
              Software: 'made by octoplans',
            }
          }
        })
        .toBuffer()
      
      const cleanKey = `designs/${designId}/clean-preview-${index}.${file.name.split('.').pop()?.toLowerCase() ?? 'jpg'}`
      const cleanFile = bucket.file(cleanKey)
      await cleanFile.save(cleanBuffer, {
        metadata: { contentType },
        resumable: false,
      })

      // 2. Process and upload watermarked image
      const path = await import('path')
      const watermarkPath = path.join(process.cwd(), 'public', 'made by octoplans.png')
      
      // Rotate the watermark and add transparent padding for spacing
      const processedWatermark = await sharp(watermarkPath)
        .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .extend({
          top: 150,
          bottom: 150,
          left: 150,
          right: 150,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toBuffer()

      const watermarkedBuffer = await sharp(buffer)
        .composite([{
          input: processedWatermark,
          tile: true,
          gravity: 'northwest'
        }])
        .toBuffer()

      const storageFile = bucket.file(key)
      await storageFile.save(watermarkedBuffer, {
        metadata: { contentType },
        resumable: false,
      })

      const publicUrl = storagePublicUrl(key)
      return NextResponse.json({ key, publicUrl })
    }

    // ── Stream file to Firebase Storage (for non-preview/watermarked files) ───
    const storageFile = bucket.file(key)
    const writeStream = storageFile.createWriteStream({
      metadata: { contentType },
      resumable: false, // disable for files < 5 MB threshold; fine for most
    })

    // Convert Web ReadableStream → Node Readable → pipe to GCS write stream
    const webStream = file.stream() as unknown as ReadableStream<Uint8Array>
    const nodeReadable = Readable.fromWeb(webStream as any)

    await new Promise<void>((resolve, reject) => {
      nodeReadable.pipe(writeStream)
      writeStream.on('finish', resolve)
      writeStream.on('error', reject)
      nodeReadable.on('error', reject)
    })

    const publicUrl = storagePublicUrl(key)
    return NextResponse.json({ key, publicUrl })
  } catch (err) {
    console.error('[Firebase upload error]', err)
    return NextResponse.json({ error: 'Upload to Firebase failed: ' + (err as Error).message }, { status: 500 })
  }
}
