/**
 * POST /api/download/presigned-url
 *
 * Authenticated users who have purchased a design can call this to get
 * a short-lived Firebase Storage signed GET URL to download one of the
 * design's files.
 *
 * Request body (JSON):
 * { designId: string, fileType: string }
 *
 * Response:
 * { downloadUrl: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getPresignedDownloadUrl } from '@/lib/firebase-storage'
import { prisma } from '@/lib/prisma'

const FILE_TYPE_TO_FIELD: Record<string, string> = {
  rvt:        'rvtUrl',
  pln:        'plnUrl',
  skp:        'skpUrl',
  pdf:        'pdfUrl',
  dwg:        'dwgUrl',
  electrical: 'electricalUrl',
  mechanical: 'mechanicalUrl',
  structural: 'structuralUrl',
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { designId: string; fileType: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { designId, fileType } = body

  if (!designId || !fileType) {
    return NextResponse.json({ error: 'designId and fileType are required' }, { status: 400 })
  }

  const dbField = FILE_TYPE_TO_FIELD[fileType]
  if (!dbField) {
    return NextResponse.json({ error: `Unknown fileType: ${fileType}` }, { status: 400 })
  }

  const design = await prisma.design.findUnique({
    where: { id: designId },
    select: {
      title: true,
      tier: true,
      rvtUrl: true, plnUrl: true, skpUrl: true, pdfUrl: true, dwgUrl: true,
      electricalUrl: true, mechanicalUrl: true, structuralUrl: true,
      previewImages: true,
    },
  })

  if (!design) {
    return NextResponse.json({ error: 'Design not found' }, { status: 404 })
  }

  // Admins can always download; regular users need a successful purchase unless design is free
  if (session.user.role !== 'ADMIN' && design.tier !== 'FREE') {
    const purchase = await prisma.purchase.findFirst({
      where: { designId, userId: session.user.id, status: 'succeeded' },
    })
    if (!purchase) {
      return NextResponse.json(
        { error: 'You have not purchased this design' },
        { status: 403 }
      )
    }
  }

  let s3Key = (design as Record<string, unknown>)[dbField] as string | null | undefined

  if (!s3Key && fileType.startsWith('clean-preview-')) {
    const index = parseInt(fileType.replace('clean-preview-', ''), 10)
    const url = design.previewImages[index]
    if (url) {
      const ext = url.split('?')[0].split('.').pop() || 'jpg'
      s3Key = `designs/${designId}/clean-preview-${index}.${ext}`
    }
  }

  if (!s3Key) {
    return NextResponse.json(
      { error: `${fileType.toUpperCase()} file is not available for this design` },
      { status: 404 }
    )
  }

  try {
    const safeTitle = design.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const ext  = s3Key.split('.').pop() ?? fileType
    const filename = `octoplans_${safeTitle}_${fileType}.${ext}`

    const downloadUrl = await getPresignedDownloadUrl(s3Key, filename, 600)

    // Record download for analytics (non-critical)
    try {
      await prisma.download.create({ data: { userId: session.user.id, designId } })
    } catch { /* ignore */ }

    return NextResponse.json({ downloadUrl })
  } catch (err) {
    console.error('[Firebase Storage signed download error]', err)
    return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 })
  }
}
