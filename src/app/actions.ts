'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'

const prisma = new PrismaClient()

// Previous actions preserved
export async function loginAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.passwordHash !== password) return
  const cookieStore = await cookies()
  cookieStore.set('auth-token', user.role === 'ADMIN' ? 'admin' : user.subscriptionStatus === 'PREMIUM' ? 'subscriber' : 'user')
  cookieStore.set('auth-id', user.id) // <--- CRITICAL: Set Real ID
  redirect('/')
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
  cookieStore.delete('auth-id') // <--- Cleanup
  redirect('/login')
}

export async function signupAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return
  const newUser = await prisma.user.create({
    data: { email, passwordHash: password, role: 'USER', subscriptionStatus: 'FREE' },
  })
  const cookieStore = await cookies()
  cookieStore.set('auth-token', 'user')
  cookieStore.set('auth-id', newUser.id) // <--- CRITICAL: Set Real ID
  redirect('/')
}

export async function subscribeAction(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  if (!token) redirect('/login')
  cookieStore.set('auth-token', 'subscriber')
  revalidatePath('/')
}

export async function purchaseAction(designId: string): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')
  if (!token) redirect('/login')
  return
}

export type ActionState = {
  error?: string
  success?: boolean
}

export async function uploadDesignAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (session?.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tier = formData.get('tier') as 'FREE' | 'PREMIUM' | 'EXCLUSIVE'

  // Modular Pricing Extraction
  const getPrice = (key: string, def: number) => parseFloat(formData.get(key) as string) || def

  const priceRender = getPrice('priceRender', 10000)
  const priceDwg = getPrice('priceDwg', 70000)
  const pricePdf = getPrice('pricePdf', 40000)
  const priceElec = getPrice('priceElec', 10000)
  const priceMech = getPrice('priceMech', 10000)
  const priceStruct = getPrice('priceStruct', 30000)

  // Legacy price field (for compatibility, set to Render price)
  const price = priceRender
  // Residential Details
  const floors = parseInt(formData.get('floors') as string) || 0
  const bedrooms = parseInt(formData.get('bedrooms') as string) || 0
  const bathrooms = parseInt(formData.get('bathrooms') as string) || 0
  const toilets = parseInt(formData.get('toilets') as string) || 0
  const livingRooms = parseInt(formData.get('livingRooms') as string) || 1
  const stairs = parseInt(formData.get('stairs') as string) || 0
  const exits = parseInt(formData.get('exits') as string) || 0
  const plotSize = formData.get('plotSize') as string
  const plotArea = parseFloat(formData.get('plotArea') as string) || 0
  // Software Compatibility Extraction
  const softwareTypes: string[] = []
  if (formData.get('software_REVIT') === 'on') softwareTypes.push('REVIT')
  if (formData.get('software_ARCHICAD') === 'on') softwareTypes.push('ARCHICAD')
  if (formData.get('software_SKETCHUP') === 'on') softwareTypes.push('SKETCHUP')
  if (formData.get('software_AUTOCAD') === 'on') softwareTypes.push('AUTOCAD')
  if (formData.get('software_PDF') === 'on') softwareTypes.push('PDF')

  // Features
  const hasFamilyLounge = formData.get('hasFamilyLounge') === 'on'
  const hasPenthouse = formData.get('hasPenthouse') === 'on'
  const hasStudy = formData.get('hasStudy') === 'on'
  const hasLaundry = formData.get('hasLaundry') === 'on'
  const hasStore = formData.get('hasStore') === 'on'
  const hasAnteRoom = formData.get('hasAnteRoom') === 'on'
  const hasBQ = formData.get('hasBQ') === 'on'

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Helper: Stream file to disk to avoid memory issues (OOM)
    const saveFileStream = async (file: File | null): Promise<string | undefined> => {
      if (!file || file.size === 0) return undefined

      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, '-')}`
      const filepath = path.join(uploadDir, filename)

      try {
        const { createWriteStream } = await import('fs')
        const { Readable } = await import('stream')
        //@ts-ignore
        const webStream = file.stream()
        const nodeStream = Readable.fromWeb(webStream as any)
        const writeStream = createWriteStream(filepath)

        await new Promise<void>((resolve, reject) => {
          nodeStream.pipe(writeStream)
          writeStream.on('finish', () => resolve())
          writeStream.on('error', reject)
        })

        return `/uploads/${filename}`
      } catch (e) {
        console.error("Stream Save Error:", e)
        return undefined
      }
    }

    const rvtUrl = await saveFileStream(formData.get('rvtFile') as File)
    const plnUrl = await saveFileStream(formData.get('plnFile') as File)
    const skpUrl = await saveFileStream(formData.get('skpFile') as File)
    const pdfUrl = await saveFileStream(formData.get('pdfFile') as File)
    const electricalUrl = await saveFileStream(formData.get('electricalFile') as File)
    const mechanicalUrl = await saveFileStream(formData.get('mechanicalFile') as File)
    const structuralUrl = await saveFileStream(formData.get('structuralFile') as File)

    let dwgUrl = await saveFileStream(formData.get('dwgFile') as File)
    if (!dwgUrl) {
      const legacyUrl = formData.get('dwgUrl') as string
      if (legacyUrl && legacyUrl.length > 0) dwgUrl = legacyUrl
      else dwgUrl = ''
    }

    // Multi-Image Handling
    const files = formData.getAll('previewImages') as File[]
    let previewImageUrls: string[] = []

    if (files && files.length > 0 && files[0].size > 0) {
      for (const file of files) {
        if (file.size === 0) continue;
        const url = await saveFileStream(file)
        if (url) previewImageUrls.push(url)
      }
    } else {
      const singleFile = formData.get('previewImage') as File
      const url = await saveFileStream(singleFile)
      if (url) previewImageUrls.push(url)
      else return { error: "At least one preview image is required" }
    }

    const design = await prisma.design.create({
      data: {
        title,
        description,
        tier,
        price,
        priceRender,
        priceDwg,
        pricePdf,
        priceElec,
        priceMech,
        priceStruct,
        floors,
        bedrooms,
        bathrooms,
        toilets,
        livingRooms,
        stairs,
        exits,
        hasFamilyLounge,
        hasPenthouse,
        hasStudy,
        hasLaundry,
        hasStore,
        hasAnteRoom,
        hasBQ,
        plotSize,
        plotArea,

        // @ts-ignore - Support both JSON (legacy) and String (SVG)
        buildingFootprint: (() => {
          const raw = formData.get('buildingFootprint') as string;
          if (!raw) return [];
          try {
            return JSON.parse(raw);
          } catch (e) {
            return raw; // Treat as SVG string
          }
        })(),

        dwgUrl,

        fileTypes: softwareTypes,
        rvtUrl,
        plnUrl,
        skpUrl,
        pdfUrl,
        electricalUrl,
        mechanicalUrl,
        structuralUrl,

        previewImages: previewImageUrls,
      },
    })

    // Log success
    // const fs = await import('fs')
    // fs.appendFileSync('server-debug.log', `[${new Date().toISOString()}] Design created: ${design.id}\n`)

  } catch (error) {
    console.error('Server Action Error:', error)
    return { error: 'Failed to upload: ' + (error as Error).message }
  }

  revalidatePath('/')
  redirect('/')
}

export async function toggleLikeAction(designId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  const userId = session.user.id

  // Check if liked
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_designId: {
        userId,
        designId
      }
    }
  })

  if (existingLike) {
    await prisma.like.delete({
      where: {
        userId_designId: {
          userId,
          designId
        }
      }
    })
  } else {
    await prisma.like.create({
      data: {
        userId,
        designId
      }
    })
  }

  revalidatePath(`/designs/${designId}`)
}

export async function postCommentAction(designId: string, content: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  await prisma.comment.create({
    data: {
      userId: session.user.id,
      designId,
      content
    }
  })

  revalidatePath(`/designs/${designId}`)
}

export async function addToCollectionAction(designId: string): Promise<void> {
  const session = await getSession()
  if (!session) return

  // MVP: "Default" collection
  let collection = await prisma.collection.findFirst({
    where: {
      userId: session.user.id,
      name: 'Favorites'
    }
  })

  if (!collection) {
    collection = await prisma.collection.create({
      data: {
        userId: session.user.id,
        name: 'Favorites'
      }
    })
  }

  try {
    await prisma.collectionItem.create({
      data: {
        collectionId: collection.id,
        designId
      }
    })
  } catch (e) {
    // Ignore duplicate adds
  }
}

export async function getCommentsAction(designId: string) {
  const prisma = new PrismaClient()
  const comments = await prisma.comment.findMany({
    where: { designId },
    include: {
      user: {
        select: {
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return comments.map(c => ({
    ...c,
    userEmail: c.user.email
  }))
}

import { verifyPaystackTransaction } from '@/lib/paystack'

export async function verifyPurchaseAction(reference: string, designId: string, amountKobo: number, items: string[] = []) {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  // 1. Verify with Paystack
  const verifyRes = await verifyPaystackTransaction(reference)

  // MVP: If verifyRes.status is true (or fallback logic)
  if (verifyRes?.status || (verifyRes?.data?.status === 'success')) {
    console.log("Verify passed. Attempting DB create with:", {
      userId: session.user.id,
      designId,
      ref: reference
    })
    try {
      // Use Raw SQL to bypass stale Prisma Client validation
      const id = randomUUID()
      const itemsJson = JSON.stringify(items)
      const amount = amountKobo / 100

      await prisma.$executeRaw`
        INSERT INTO "Purchase" ("id", "userId", "designId", "amount", "status", "provider", "reference", "items", "createdAt")
        VALUES (${id}, ${session.user.id}, ${designId}, ${amount}, 'succeeded', 'PAYSTACK', ${reference}, ${itemsJson}::jsonb, NOW())
      `

      console.log("Purchase recorded successfully (Raw SQL):", id)

      revalidatePath(`/designs/${designId}`)
      return { success: true }
    } catch (e) {
      console.error('CRITICAL DB ERROR (RAW):', e)
      return { error: 'Payment succeeded but recording failed. Contact support.' }
    }
  } else {
    console.error("Verification Logic Failed. Res:", verifyRes)
  }

  return { error: 'Payment verification failed' }
}

// ============================================================
// ADMIN DESIGN MANAGEMENT
// ============================================================

export async function updateDesignAction(designId: string, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (session?.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    // Helper: Stream file to disk
    const saveFileStream = async (file: File | null): Promise<string | undefined> => {
      if (!file || file.size === 0) return undefined
      const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name.replace(/\s/g, '-')}`
      const filepath = path.join(uploadDir, filename)
      try {
        const { createWriteStream } = await import('fs')
        const { Readable } = await import('stream')
        // @ts-ignore
        const webStream = file.stream()
        const nodeStream = Readable.fromWeb(webStream as any)
        const writeStream = createWriteStream(filepath)
        await new Promise<void>((resolve, reject) => {
          nodeStream.pipe(writeStream)
          writeStream.on('finish', () => resolve())
          writeStream.on('error', reject)
        })
        return `/uploads/${filename}`
      } catch (e) {
        console.error("Stream Save Error:", e)
        return undefined
      }
    }

    const data: Record<string, any> = {}

    // Strings
    const title = formData.get('title') as string
    if (title) data.title = title
    const description = formData.get('description') as string
    if (description) data.description = description
    const plotSize = formData.get('plotSize') as string
    if (plotSize) data.plotSize = plotSize

    const tier = formData.get('tier') as string
    if (tier) data.tier = tier

    // Numbers
    const intFields = ['floors', 'bedrooms', 'bathrooms', 'toilets', 'livingRooms', 'stairs', 'exits']
    intFields.forEach(f => {
      const val = formData.get(f)
      if (val !== null) data[f] = parseInt(val as string) || 0
    })

    if (formData.get('plotArea')) data.plotArea = parseFloat(formData.get('plotArea') as string) || 0

    // Decimals
    const priceFields = ['priceRender', 'priceDwg', 'pricePdf', 'priceElec', 'priceMech', 'priceStruct']
    priceFields.forEach(f => {
      const val = formData.get(f)
      if (val !== null) data[f] = parseFloat(val as string) || 0
    })

    // Booleans
    const boolFields = ['isFeatured', 'hasFamilyLounge', 'hasPenthouse', 'hasStudy', 'hasLaundry', 'hasStore', 'hasAnteRoom', 'hasBQ']
    boolFields.forEach(f => {
      // In FormData, checkbox is 'on' if checked, null/undefined if not. 
      // But for updates, we must be careful. DesignEditForm sends all checkboxes. 
      // We act on presence.
      data[f] = formData.get(f) === 'on'
    })

    // JSON
    const footprint = formData.get('buildingFootprint') as string
    if (footprint) {
      try {
        data.buildingFootprint = JSON.parse(footprint)
      } catch {
        data.buildingFootprint = footprint
      }
    }

    // File Types
    const softwareTypes: string[] = []
    if (formData.get('software_REVIT') === 'on') softwareTypes.push('REVIT')
    if (formData.get('software_ARCHICAD') === 'on') softwareTypes.push('ARCHICAD')
    if (formData.get('software_SKETCHUP') === 'on') softwareTypes.push('SKETCHUP')
    if (formData.get('software_AUTOCAD') === 'on') softwareTypes.push('AUTOCAD')
    if (formData.get('software_PDF') === 'on') softwareTypes.push('PDF')

    // Only update fileTypes if at least one is selected? Or if user unchecked all? 
    // We'll update it based on the form state. 
    // Ideally we should check if the user *touched* these fields, but for now we assume the form represents the desired state.
    // However, DesignEditForm might not send unchecked fields? No, it doesn't send unchecked.
    // So if I have software_REVIT turned off, it won't be here. 
    // This logic overwrites fileTypes with only what's currently checked. That is correct for an "Edit" form.
    data.fileTypes = softwareTypes

    // URL overrides
    const urlFields = ['rvtUrl', 'plnUrl', 'skpUrl', 'pdfUrl', 'dwgUrl', 'electricalUrl', 'mechanicalUrl', 'structuralUrl']
    urlFields.forEach(f => {
      const val = formData.get(f) as string
      if (val !== null) data[f] = val
    })

    // New Images
    const newImages = formData.getAll('newPreviewImages') as File[]
    if (newImages && newImages.length > 0 && newImages[0].size > 0) {
      const validUrls: string[] = []
      for (const file of newImages) {
        const url = await saveFileStream(file)
        if (url) validUrls.push(url)
      }
      if (validUrls.length > 0) {
        // Fetch existing to append
        const existing = await prisma.design.findUnique({ where: { id: designId }, select: { previewImages: true } })
        data.previewImages = [...(existing?.previewImages || []), ...validUrls]
      }
    }

    await prisma.design.update({
      where: { id: designId },
      data: data
    })

    revalidatePath('/admin/designs')
    revalidatePath(`/admin/designs/${designId}`)
    revalidatePath('/browse')
    revalidatePath('/')

    return { success: true }
  } catch (e) {
    console.error('Update design error:', e)
    return { error: 'Failed to update design. ' + (e instanceof Error ? e.message : '') }
  }
}



export async function deleteDesignAction(designId: string): Promise<ActionState> {
  const session = await getSession()
  if (session?.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    // Delete related records first (cascading)
    await prisma.collectionItem.deleteMany({ where: { designId } })
    await prisma.comment.deleteMany({ where: { designId } })
    await prisma.like.deleteMany({ where: { designId } })
    await prisma.download.deleteMany({ where: { designId } })
    await prisma.purchase.deleteMany({ where: { designId } })

    await prisma.design.delete({ where: { id: designId } })

    revalidatePath('/admin/designs')
    revalidatePath('/browse')
    revalidatePath('/')

    return { success: true }
  } catch (e) {
    console.error('Delete design error:', e)
    return { error: 'Failed to delete design. ' + (e instanceof Error ? e.message : '') }
  }
}

export async function updateUserAction(formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session) return { error: 'Unauthorized' }

  try {
    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const bio = formData.get('bio') as string

    // Future: Handle avatar upload here if we add file input

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        bio
      }
    })

    revalidatePath('/profile')
    return { success: true }
  } catch (e) {
    console.error('Update user error:', e)
    return { error: 'Failed to update profile.' }
  }
}
