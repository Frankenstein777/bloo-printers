/**
 * POST /api/admin/upload
 *
 * Admin-only. Accepts a JSON payload containing design metadata and S3 keys
 * (the files themselves have already been uploaded directly to S3 by the browser
 * via presigned PUTs — see /api/upload/presigned-url).
 *
 * This route only writes the Design record to the database. No file handling here.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'
import { DesignTier } from '@prisma/client'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userRole = (session.user as any).role
  if (userRole !== 'ADMIN' && userRole !== 'ARCHITECT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()

    // ── Metadata ────────────────────────────────────────────────
    const title        = body.title as string
    const description  = body.description as string
    const tier         = body.tier as DesignTier

    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
    if (urlRegex.test(title) || urlRegex.test(description)) {
      return NextResponse.json({ error: 'URL links are not permitted in titles or descriptions.' }, { status: 400 })
    }

    let priceRender  = parseFloat(body.priceRender)  || 0
    let priceDwg     = parseFloat(body.priceDwg)     || 0
    let pricePdf     = parseFloat(body.pricePdf)     || 0
    let priceElec    = parseFloat(body.priceElec)    || 0
    let priceMech    = parseFloat(body.priceMech)    || 0
    let priceStruct  = parseFloat(body.priceStruct)  || 0
    let price        = priceRender  // legacy field

    if (tier === 'FREE') {
        priceRender = 0
        priceDwg = 0
        pricePdf = 0
        priceElec = 0
        priceMech = 0
        priceStruct = 0
        price = 0
    }

    const floors       = parseInt(body.floors)      || 0
    const bedrooms     = parseInt(body.bedrooms)    || 0
    const bathrooms    = parseInt(body.bathrooms)   || 0
    const toilets      = parseInt(body.toilets)     || 0
    const livingRooms  = parseInt(body.livingRooms) || 1
    const stairs       = parseInt(body.stairs)      || 0
    const exits        = parseInt(body.exits)       || 0

    const plotSize     = body.plotSize as string
    const plotArea     = parseFloat(body.plotArea)  || 0

    // ── Booleans ────────────────────────────────────────────────
    const boolFields = [
      'hasFamilyLounge', 'hasPenthouse', 'hasStudy', 'hasLaundry', 'hasStore',
      'hasAnteRoom', 'hasBQ', 'hasCinema', 'hasGym', 'hasGameRoom', 'hasBar',
      'hasRooftop', 'hasReadingRoom', 'hasSpa', 'hasIndoorPool', 'hasCourtyard',
      'hasAtrium', 'hasLoggia', 'hasPetRoom', 'hasBasement', 'hasGarage', 'hasPool',
      'hasGatehouse', 'hasColdRoom', 'hasPantry', 'hasPanicRoom', 'hasMusicRoom', 'hasStudio',
    ]
    const boolData: Record<string, boolean> = {}
    boolFields.forEach(f => { boolData[f] = Boolean(body[f]) })

    // ── Software / file types ────────────────────────────────────
    const fileTypes: string[] = []
    if (body.software_REVIT)    fileTypes.push('REVIT')
    if (body.software_ARCHICAD) fileTypes.push('ARCHICAD')
    if (body.software_SKETCHUP) fileTypes.push('SKETCHUP')
    if (body.software_AUTOCAD)  fileTypes.push('AUTOCAD')
    if (body.software_PDF)      fileTypes.push('PDF')

    // ── Building footprint ────────────────────────────────────────
    let buildingFootprint: any = []
    try {
      buildingFootprint = typeof body.buildingFootprint === 'string'
        ? JSON.parse(body.buildingFootprint)
        : body.buildingFootprint || []
    } catch { /* keep [] */ }

    // ── S3 keys (sent by the client after direct S3 uploads) ──────
    const previewImages   = Array.isArray(body.previewImages)  ? body.previewImages  : []
    const cleanPreviewImages = Array.isArray(body.cleanPreviewImages) ? body.cleanPreviewImages : []
    const floorPlanImages = Array.isArray(body.floorPlanImages)? body.floorPlanImages: []
    const cleanFloorPlanImages = Array.isArray(body.cleanFloorPlanImages) ? body.cleanFloorPlanImages : []
    const rvtUrl          = body.rvtUrl          || null
    const plnUrl          = body.plnUrl          || null
    const skpUrl          = body.skpUrl          || null
    const pdfUrl          = body.pdfUrl          || null
    const dwgUrl          = body.dwgUrl          || ''
    const electricalUrl   = body.electricalUrl   || null
    const mechanicalUrl   = body.mechanicalUrl   || null
    const structuralUrl   = body.structuralUrl   || null

    if (!previewImages.length) {
      return NextResponse.json({ error: 'At least one preview image is required' }, { status: 400 })
    }

    // ── Create Design record ─────────────────────────────────────
    // If the client pre-generated a designId, use upsert so we never create duplicates.
    const designId = body.designId as string | undefined

    const data = {
      title, description, tier, price,
      priceRender, priceDwg, pricePdf, priceElec, priceMech, priceStruct,
      floors, bedrooms, bathrooms, toilets, livingRooms, stairs, exits,
      plotSize, plotArea,
      buildingFootprint,
      fileTypes,
      rvtUrl, plnUrl, skpUrl, pdfUrl, dwgUrl,
      electricalUrl, mechanicalUrl, structuralUrl,
      previewImages,
      cleanPreviewImages,
      floorPlanImages,
      cleanFloorPlanImages,
      ...boolData,
    } as any

    if (userRole === 'ARCHITECT') {
      data.authorId = session.user.id
    }

    let design
    if (designId) {
      design = await prisma.design.upsert({
        where: { id: designId },
        create: { id: designId, ...data },
        update: data,
      })
    } else {
      design = await prisma.design.create({ data })
    }

    return NextResponse.json({ success: true, id: design.id })

  } catch (e) {
    console.error('Upload API Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
