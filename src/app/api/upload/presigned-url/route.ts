/**
 * POST /api/upload/presigned-url
 *
 * Admin-only. Returns a Firebase Storage signed PUT URL so the browser
 * can upload a file directly (no bytes routed through Next.js).
 *
 * Request body (JSON):
 * { designId, fileType, originalName, contentType }
 *
 * Response:
 * { uploadUrl, key, publicUrl }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import {
  getPresignedUploadUrl,
  designFileKey,
  previewImageKey,
  storagePublicUrl,
} from '@/lib/firebase-storage'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { designId: string; fileType: string; originalName: string; contentType: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { designId, fileType, originalName, contentType } = body

  if (!designId || !fileType || !originalName || !contentType) {
    return NextResponse.json(
      { error: 'designId, fileType, originalName, and contentType are required' },
      { status: 400 }
    )
  }

  const key = fileType.startsWith('preview-')
    ? previewImageKey(designId, parseInt(fileType.replace('preview-', ''), 10), originalName)
    : designFileKey(designId, fileType, originalName)

  try {
    const uploadUrl = await getPresignedUploadUrl(key, contentType, 300)
    const publicUrl = storagePublicUrl(key)
    return NextResponse.json({ uploadUrl, key, publicUrl })
  } catch (err) {
    console.error('[Firebase Storage signed upload error]', err)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
