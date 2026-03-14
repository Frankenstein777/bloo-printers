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
  const key = fileType.startsWith('preview-')
    ? previewImageKey(designId, parseInt(fileType.replace('preview-', ''), 10), file.name)
    : designFileKey(designId, fileType, file.name)

  // ── Stream file to Firebase Storage ──────────────────────────
  try {
    const bucket = adminStorage.bucket()
    const storageFile = bucket.file(key)

    const contentType = file.type || 'application/octet-stream'
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
