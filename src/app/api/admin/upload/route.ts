
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-config'



export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await req.formData()

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        // Helper to save file
        const saveFile = async (file: File | null) => {
            if (!file || file.size === 0) return undefined
            const buffer = Buffer.from(await file.arrayBuffer())
            const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, '-')}`
            const filepath = path.join(uploadDir, filename)
            await writeFile(filepath, buffer)
            return `/uploads/${filename}`
        }

        // Extract Data
        const title = formData.get('title') as string
        const description = formData.get('description') as string
        const tier = formData.get('tier') as string
        const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null

        const priceRender = parseFloat(formData.get('priceRender') as string) || 0
        const priceDwg = parseFloat(formData.get('priceDwg') as string) || 0
        const pricePdf = parseFloat(formData.get('pricePdf') as string) || 0
        const priceElec = parseFloat(formData.get('priceElec') as string) || 0
        const priceMech = parseFloat(formData.get('priceMech') as string) || 0
        const priceStruct = parseFloat(formData.get('priceStruct') as string) || 0

        const floors = parseInt(formData.get('floors') as string) || 0
        const bedrooms = parseInt(formData.get('bedrooms') as string) || 0
        const bathrooms = parseInt(formData.get('bathrooms') as string) || 0
        const toilets = parseInt(formData.get('toilets') as string) || 0
        const livingRooms = parseInt(formData.get('livingRooms') as string) || 0
        const stairs = parseInt(formData.get('stairs') as string) || 0
        const exits = parseInt(formData.get('exits') as string) || 0

        const plotSize = formData.get('plotSize') as string
        const plotArea = parseFloat(formData.get('plotArea') as string) || 0

        // FILES
        const rvtUrl = await saveFile(formData.get('rvtFile') as File)
        const plnUrl = await saveFile(formData.get('plnFile') as File)
        const skpUrl = await saveFile(formData.get('skpFile') as File)
        const pdfUrl = await saveFile(formData.get('pdfFile') as File)
        const electricalUrl = await saveFile(formData.get('electricalFile') as File)
        const mechanicalUrl = await saveFile(formData.get('mechanicalFile') as File)
        const structuralUrl = await saveFile(formData.get('structuralFile') as File)
        const dwgUrl = await saveFile(formData.get('dwgFile') as File) || ''

        // Images
        const imageFiles = formData.getAll('previewImages') as File[]
        const previewImages = []
        for (const file of imageFiles) {
            const url = await saveFile(file)
            if (url) previewImages.push(url)
        }

        // Features
        const boolFields = [
            'isFeatured', 'hasFamilyLounge', 'hasPenthouse', 'hasStudy', 'hasLaundry', 'hasStore', 'hasAnteRoom', 'hasBQ',
            'hasCinema', 'hasGym', 'hasGameRoom', 'hasBar', 'hasRooftop', 'hasReadingRoom', 'hasSpa', 'hasIndoorPool',
            'hasCourtyard', 'hasAtrium', 'hasLoggia', 'hasPetRoom', 'hasBasement', 'hasGarage', 'hasPool', 'hasGatehouse',
            'hasColdRoom', 'hasPantry', 'hasPanicRoom', 'hasMusicRoom', 'hasStudio'
        ]
        const boolData: Record<string, boolean> = {}
        boolFields.forEach(f => {
            boolData[f] = formData.get(f) === 'true' || formData.get(f) === 'on'
        })

        // File Types
        const fileTypes = []
        if (formData.get('software_REVIT') === 'on') fileTypes.push('REVIT')
        if (formData.get('software_ARCHICAD') === 'on') fileTypes.push('ARCHICAD')
        if (formData.get('software_SKETCHUP') === 'on') fileTypes.push('SKETCHUP')
        if (formData.get('software_AUTOCAD') === 'on') fileTypes.push('AUTOCAD')
        if (formData.get('software_PDF') === 'on') fileTypes.push('PDF')

        // Footprint
        let buildingFootprint: any = []
        try {
            buildingFootprint = JSON.parse(formData.get('buildingFootprint') as string || '[]')
        } catch (e) { }

        const design = await prisma.design.create({
            data: {
                title, description, tier, price,
                priceRender, priceDwg, pricePdf, priceElec, priceMech, priceStruct,
                floors, bedrooms, bathrooms, toilets, livingRooms, stairs, exits,
                plotSize, plotArea,
                buildingFootprint,
                fileTypes,

                rvtUrl, plnUrl, skpUrl, pdfUrl, electricalUrl, mechanicalUrl, structuralUrl, dwgUrl,
                previewImages,

                ...boolData
            }
        })

        return NextResponse.json({ success: true, id: design.id })

    } catch (e) {
        console.error("Upload API Error:", e)
        return NextResponse.json({ error: (e as Error).message }, { status: 500 })
    }
}
