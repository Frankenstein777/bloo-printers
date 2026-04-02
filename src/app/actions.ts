'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'
import { prisma } from '@/lib/prisma'

// ── Auth Actions ─────────────────────────────────────────────────────────────

export async function signupAction(formData: FormData): Promise<void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const phone = (formData.get('phone') as string)?.trim() || null
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) return
  await prisma.user.create({
    data: { email, passwordHash: password, phone, role: 'USER', subscriptionStatus: 'FREE' },
  })
  redirect('/login')
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type ActionState = {
  error?: string
  success?: boolean
}

// ── Design Upload ─────────────────────────────────────────────────────────────

export async function uploadDesignAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (session?.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const tier = formData.get('tier') as 'FREE' | 'PREMIUM' | 'EXCLUSIVE'

  const getPrice = (key: string, def: number) => parseFloat(formData.get(key) as string) || def

  const priceRender = getPrice('priceRender', 10000)
  const priceDwg = getPrice('priceDwg', 70000)
  const pricePdf = getPrice('pricePdf', 40000)
  const priceElec = getPrice('priceElec', 10000)
  const priceMech = getPrice('priceMech', 10000)
  const priceStruct = getPrice('priceStruct', 30000)
  const price = priceRender

  const floors = parseInt(formData.get('floors') as string) || 0
  const bedrooms = parseInt(formData.get('bedrooms') as string) || 0
  const bathrooms = parseInt(formData.get('bathrooms') as string) || 0
  const toilets = parseInt(formData.get('toilets') as string) || 0
  const livingRooms = parseInt(formData.get('livingRooms') as string) || 1
  const stairs = parseInt(formData.get('stairs') as string) || 0
  const exits = parseInt(formData.get('exits') as string) || 0
  const plotSize = formData.get('plotSize') as string
  const plotArea = parseFloat(formData.get('plotArea') as string) || 0

  const softwareTypes: string[] = []
  if (formData.get('software_REVIT') === 'on') softwareTypes.push('REVIT')
  if (formData.get('software_ARCHICAD') === 'on') softwareTypes.push('ARCHICAD')
  if (formData.get('software_SKETCHUP') === 'on') softwareTypes.push('SKETCHUP')
  if (formData.get('software_AUTOCAD') === 'on') softwareTypes.push('AUTOCAD')
  if (formData.get('software_PDF') === 'on') softwareTypes.push('PDF')

  const hasFamilyLounge = formData.get('hasFamilyLounge') === 'on'
  const hasPenthouse = formData.get('hasPenthouse') === 'on'
  const hasStudy = formData.get('hasStudy') === 'on'
  const hasLaundry = formData.get('hasLaundry') === 'on'
  const hasStore = formData.get('hasStore') === 'on'
  const hasAnteRoom = formData.get('hasAnteRoom') === 'on'
  const hasBQ = formData.get('hasBQ') === 'on'
  const hasCinema = formData.get('hasCinema') === 'on'
  const hasGym = formData.get('hasGym') === 'on'
  const hasGameRoom = formData.get('hasGameRoom') === 'on'
  const hasBar = formData.get('hasBar') === 'on'
  const hasRooftop = formData.get('hasRooftop') === 'on'
  const hasReadingRoom = formData.get('hasReadingRoom') === 'on'
  const hasSpa = formData.get('hasSpa') === 'on'
  const hasIndoorPool = formData.get('hasIndoorPool') === 'on'
  const hasCourtyard = formData.get('hasCourtyard') === 'on'
  const hasAtrium = formData.get('hasAtrium') === 'on'
  const hasLoggia = formData.get('hasLoggia') === 'on'
  const hasPetRoom = formData.get('hasPetRoom') === 'on'
  const hasBasement = formData.get('hasBasement') === 'on'
  const hasGarage = formData.get('hasGarage') === 'on'
  const hasPool = formData.get('hasPool') === 'on'
  const hasGatehouse = formData.get('hasGatehouse') === 'on'
  const hasColdRoom = formData.get('hasColdRoom') === 'on'
  const hasPantry = formData.get('hasPantry') === 'on'
  const hasPanicRoom = formData.get('hasPanicRoom') === 'on'
  const hasMusicRoom = formData.get('hasMusicRoom') === 'on'
  const hasStudio = formData.get('hasStudio') === 'on'

  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

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

    await prisma.design.create({
      data: {
        title, description, tier, price, priceRender, priceDwg, pricePdf, priceElec, priceMech, priceStruct,
        floors, bedrooms, bathrooms, toilets, livingRooms, stairs, exits,
        hasFamilyLounge, hasPenthouse, hasStudy, hasLaundry, hasStore, hasAnteRoom, hasBQ,
        hasCinema, hasGym, hasGameRoom, hasBar, hasRooftop, hasReadingRoom, hasSpa, hasIndoorPool,
        hasCourtyard, hasAtrium, hasLoggia, hasPetRoom, hasBasement, hasGarage, hasPool, hasGatehouse,
        hasColdRoom, hasPantry, hasPanicRoom, hasMusicRoom, hasStudio,
        plotSize, plotArea,
        // @ts-ignore
        buildingFootprint: (() => {
          const raw = formData.get('buildingFootprint') as string;
          if (!raw) return [];
          try { return JSON.parse(raw); } catch (e) { return raw; }
        })(),
        dwgUrl,
        fileTypes: softwareTypes,
        rvtUrl, plnUrl, skpUrl, pdfUrl, electricalUrl, mechanicalUrl, structuralUrl,
        previewImages: previewImageUrls,
      },
    })
  } catch (error) {
    console.error('Server Action Error:', error)
    return { error: 'Failed to upload: ' + (error as Error).message }
  }

  revalidatePath('/')
  redirect('/')
}

// ── Admin Design Management ───────────────────────────────────────────────────

export async function updateDesignAction(designId: string, formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (session?.user.role !== 'ADMIN') {
    return { error: 'Unauthorized' }
  }

  try {
    const data: Record<string, any> = {}

    const title = formData.get('title') as string
    if (title) data.title = title
    const description = formData.get('description') as string
    if (description) data.description = description
    const plotSize = formData.get('plotSize') as string
    if (plotSize) data.plotSize = plotSize
    const tier = formData.get('tier') as string
    if (tier) data.tier = tier

    const intFields = ['floors', 'bedrooms', 'bathrooms', 'toilets', 'livingRooms', 'stairs', 'exits']
    intFields.forEach(f => {
      const val = formData.get(f)
      if (val !== null) data[f] = parseInt(val as string) || 0
    })

    if (formData.get('plotArea')) data.plotArea = parseFloat(formData.get('plotArea') as string) || 0

    const priceFields = ['priceRender', 'priceDwg', 'pricePdf', 'priceElec', 'priceMech', 'priceStruct']
    priceFields.forEach(f => {
      const val = formData.get(f)
      if (val !== null) data[f] = parseFloat(val as string) || 0
    })

    const boolFields = [
      'isFeatured', 'hasFamilyLounge', 'hasPenthouse', 'hasStudy', 'hasLaundry', 'hasStore', 'hasAnteRoom', 'hasBQ',
      'hasCinema', 'hasGym', 'hasGameRoom', 'hasBar', 'hasRooftop', 'hasReadingRoom', 'hasSpa', 'hasIndoorPool',
      'hasCourtyard', 'hasAtrium', 'hasLoggia', 'hasPetRoom', 'hasBasement', 'hasGarage', 'hasPool', 'hasGatehouse',
      'hasColdRoom', 'hasPantry', 'hasPanicRoom', 'hasMusicRoom', 'hasStudio'
    ]
    boolFields.forEach(f => { data[f] = formData.get(f) === 'on' })

    const footprint = formData.get('buildingFootprint') as string
    if (footprint) {
      try { data.buildingFootprint = JSON.parse(footprint) } catch { data.buildingFootprint = footprint }
    }

    const softwareTypes: string[] = []
    if (formData.get('software_REVIT') === 'on') softwareTypes.push('REVIT')
    if (formData.get('software_ARCHICAD') === 'on') softwareTypes.push('ARCHICAD')
    if (formData.get('software_SKETCHUP') === 'on') softwareTypes.push('SKETCHUP')
    if (formData.get('software_AUTOCAD') === 'on') softwareTypes.push('AUTOCAD')
    if (formData.get('software_PDF') === 'on') softwareTypes.push('PDF')
    data.fileTypes = softwareTypes

    const urlFields = ['rvtUrl', 'plnUrl', 'skpUrl', 'pdfUrl', 'dwgUrl', 'electricalUrl', 'mechanicalUrl', 'structuralUrl']
    urlFields.forEach(f => {
      const val = formData.get(f) as string
      if (val !== null) data[f] = val
    })

    const uploadedUrlsRaw = formData.get('uploadedPreviewUrls') as string | null
    if (uploadedUrlsRaw) {
      try {
        const newUrls: string[] = JSON.parse(uploadedUrlsRaw)
        if (newUrls.length > 0) {
          const existing = await prisma.design.findUnique({ where: { id: designId }, select: { previewImages: true } })
          data.previewImages = [...(existing?.previewImages || []), ...newUrls]
        }
      } catch { /* ignore parse error */ }
    }

    await prisma.design.update({ where: { id: designId }, data })
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
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name, phone, bio }
    })
    revalidatePath('/profile')
    return { success: true }
  } catch (e) {
    console.error('Update user error:', e)
    return { error: 'Failed to update profile.' }
  }
}

// ── Payment Actions ───────────────────────────────────────────────────────────

export async function initializePaymentAction(email: string, amount: number, designId: string, designTitle: string) {
  try {
    const session = await getSession()
    if (!session) return { success: false, error: 'User not logged in' }

    const reference = 'PAY-' + randomUUID().replace(/-/g, '').substring(0, 20).toUpperCase()
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const callbackUrl = `${baseUrl}/designs/${designId}?verify_ref=${reference}`

    const res = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email, amount, reference, callback_url: callbackUrl,
        metadata: {
          designId,
          custom_fields: [{ display_name: "Design Title", variable_name: "design_title", value: designTitle }]
        }
      })
    })

    const data = await res.json()
    if (!data.status) {
      console.error('Paystack Init Failed:', data)
      return { success: false, error: data.message || 'Initialization failed' }
    }
    return { success: true, url: data.data.authorization_url, reference }
  } catch (error) {
    console.error('Payment Init Error:', error)
    return { success: false, error: 'Payment initialization failed' }
  }
}

export async function verifyPurchaseAction(reference: string, designId: string, amount: number): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: 'no-store'
    })
    const data = await res.json()
    if (!data.status || data.data.status !== 'success') return { success: false, error: 'Transaction failed or invalid' }
    if (data.data.amount !== amount) {
      console.error(`Amount mismatch: Expected ${amount}, Got ${data.data.amount}`)
      return { success: false, error: 'Amount mismatch' }
    }

    const session = await getSession()
    if (!session) return { success: false, error: 'User not logged in' }

    const existing = await prisma.purchase.findFirst({ where: { reference } })
    if (existing) return { success: true }

    await prisma.purchase.create({
      data: {
        userId: session.user.id, designId, amount: amount / 100,
        currency: 'NGN', status: 'succeeded', provider: 'PAYSTACK', reference
      }
    })
    revalidatePath(`/designs/${designId}`)
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Payment Verification Error:', error)
    return { success: false, error: 'Verification failed' }
  }
}

export async function verifySubscriptionAction(reference: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
      cache: 'no-store'
    })
    const data = await res.json()
    if (!data.status || data.data.status !== 'success') return { success: false, error: 'Transaction failed or invalid' }

    const session = await getSession()
    if (!session) return { success: false, error: 'User not logged in' }

    await prisma.user.update({ where: { id: session.user.id }, data: { subscriptionStatus: 'PREMIUM' } })

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        paystackSubscriptionCode: data.data.plan,
        status: 'active',
        currentPeriodEnd: thirtyDaysFromNow
      }
    })
    revalidatePath('/')
    revalidatePath('/profile')
    return { success: true }
  } catch (error) {
    console.error('Subscription Verification Error:', error)
    return { success: false, error: 'Subscription verification failed' }
  }
}

// ── Social Actions ────────────────────────────────────────────────────────────

export async function toggleLikeAction(designId: string): Promise<void> {
  const session = await getSession()
  if (!session) return
  const userId = session.user.id
  const existing = await prisma.like.findFirst({ where: { userId, designId } })
  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } })
  } else {
    await prisma.like.create({ data: { userId, designId } })
  }
  revalidatePath('/')
  revalidatePath('/browse')
  revalidatePath(`/designs/${designId}`)
}

export async function addToCollectionAction(designId: string): Promise<void> {
  const session = await getSession()
  if (!session) return
  const userId = session.user.id

  let collection = await prisma.collection.findFirst({ where: { userId, name: 'Favorites' } })
  if (!collection) {
    collection = await prisma.collection.create({ data: { userId, name: 'Favorites', isPublic: false } })
  }

  const existingItem = await prisma.collectionItem.findFirst({ where: { collectionId: collection.id, designId } })
  if (existingItem) {
    await prisma.collectionItem.delete({ where: { id: existingItem.id } })
  } else {
    await prisma.collectionItem.create({ data: { collectionId: collection.id, designId } })
  }
  revalidatePath('/')
  revalidatePath('/browse')
  revalidatePath(`/designs/${designId}`)
}

export async function postCommentAction(designId: string, content: string): Promise<void> {
  const session = await getSession()
  if (!session) return
  await prisma.comment.create({ data: { userId: session.user.id, designId, content } })
  revalidatePath(`/designs/${designId}`)
}

export async function getCommentsAction(designId: string) {
  return await prisma.comment.findMany({
    where: { designId },
    include: { user: { select: { email: true, name: true, image: true } } },
    orderBy: { createdAt: 'desc' }
  })
}

// ── Main Admin User Management ────────────────────────────────────────────────

const MAIN_ADMIN_EMAIL = 'frankensteingary777@gmail.com'

function isMainAdmin(email: string | null | undefined): boolean {
  return email === MAIN_ADMIN_EMAIL
}

export async function elevateUserFormAction(formData: FormData): Promise<void> {
  const userId = formData.get('userId') as string
  await elevateToAdminAction(userId)
}

export async function demoteUserFormAction(formData: FormData): Promise<void> {
  const userId = formData.get('userId') as string
  await demoteFromAdminAction(userId)
}

export async function elevateToAdminAction(userId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || !isMainAdmin(session.user.email)) {
    return { error: 'Unauthorized. Only the main admin can perform this action.' }
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { role: 'ADMIN' } })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) {
    console.error('Elevate to admin error:', e)
    return { error: 'Failed to elevate user.' }
  }
}

export async function demoteFromAdminAction(userId: string): Promise<ActionState> {
  const session = await getSession()
  if (!session || !isMainAdmin(session.user.email)) {
    return { error: 'Unauthorized. Only the main admin can perform this action.' }
  }
  const targetUser = await prisma.user.findUnique({ where: { id: userId } })
  if (isMainAdmin(targetUser?.email)) {
    return { error: 'Cannot demote the main admin.' }
  }
  try {
    await prisma.user.update({ where: { id: userId }, data: { role: 'USER' } })
    revalidatePath('/admin/users')
    return { success: true }
  } catch (e) {
    console.error('Demote from admin error:', e)
    return { error: 'Failed to demote user.' }
  }
}

// ── Discount Actions ──────────────────────────────────────────────────────────

export async function createDiscountAction(formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || !isMainAdmin(session.user.email)) {
    return { error: 'Unauthorized.' }
  }

  const label = (formData.get('label') as string)?.trim()
  const percentageMin = parseInt(formData.get('percentageMin') as string)
  const percentageMax = parseInt(formData.get('percentageMax') as string)
  const durationHours = formData.get('durationHours') as string
  const isTimeLimited = !!durationHours && durationHours !== '0'

  if (!label || isNaN(percentageMin) || isNaN(percentageMax)
    || percentageMin < 1 || percentageMax > 100 || percentageMin > percentageMax) {
    return { error: 'Invalid discount range. Min must be ≥ 1, Max ≤ 100, Min ≤ Max.' }
  }

  try {
    await prisma.discount.updateMany({ where: { isActive: true }, data: { isActive: false } })

    const expiresAt = isTimeLimited
      ? new Date(Date.now() + parseFloat(durationHours) * 60 * 60 * 1000)
      : null

    await prisma.discount.create({ data: { label, percentageMin, percentageMax, isActive: true, expiresAt } })

    revalidatePath('/')
    revalidatePath('/browse')
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error('Create discount error:', e)
    return { error: 'Failed to create discount.' }
  }
}

export async function deactivateDiscountAction(): Promise<ActionState> {
  const session = await getSession()
  if (!session || !isMainAdmin(session.user.email)) {
    return { error: 'Unauthorized.' }
  }
  try {
    await prisma.discount.updateMany({ where: { isActive: true }, data: { isActive: false } })
    revalidatePath('/')
    revalidatePath('/browse')
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error('Deactivate discount error:', e)
    return { error: 'Failed to deactivate discount.' }
  }
}

export async function deactivateDiscountFormAction(): Promise<void> {
  await deactivateDiscountAction()
}

export async function createDiscountFormAction(formData: FormData): Promise<void> {
  await createDiscountAction(formData)
}

export async function getActiveDiscount() {
  const discount = await prisma.discount.findFirst({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    },
    orderBy: { createdAt: 'desc' }
  })
  if (!discount) return null
  return {
    id: discount.id,
    label: discount.label,
    percentageMin: discount.percentageMin,
    percentageMax: discount.percentageMax,
    expiresAt: discount.expiresAt?.toISOString() ?? null,
  }
}

// ── Announcement Actions ────────────────────────────────────────────────────

export async function createAnnouncementAction(formData: FormData): Promise<ActionState> {
  const session = await getSession()
  if (!session || !isMainAdmin(session.user.email)) {
    return { error: 'Unauthorized.' }
  }

  const title = (formData.get('announcementTitle') as string)?.trim()
  const body = (formData.get('announcementBody') as string)?.trim()
  const durationHours = formData.get('announcementDuration') as string
  const isTimeLimited = !!durationHours && durationHours !== '0'

  if (!title || !body) {
    return { error: 'Title and body are required.' }
  }

  try {
    const expiresAt = isTimeLimited
      ? new Date(Date.now() + parseFloat(durationHours) * 60 * 60 * 1000)
      : null
    await prisma.announcement.create({ data: { title, body, isActive: true, expiresAt } })
    revalidatePath('/')
    revalidatePath('/browse')
    revalidatePath('/admin')
    return { success: true }
  } catch (e) {
    console.error('Create announcement error:', e)
    return { error: 'Failed to create announcement.' }
  }
}

export async function createAnnouncementFormAction(formData: FormData): Promise<void> {
  await createAnnouncementAction(formData)
}

export async function deactivateAnnouncementAction(formData: FormData): Promise<void> {
  const session = await getSession()
  if (!session || !isMainAdmin(session.user.email)) return
  const id = formData.get('announcementId') as string
  if (!id) return
  try {
    await prisma.announcement.update({ where: { id }, data: { isActive: false } })
    revalidatePath('/')
    revalidatePath('/browse')
    revalidatePath('/admin')
  } catch (e) {
    console.error('Deactivate announcement error:', e)
  }
}

export async function getActiveAnnouncements() {
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }]
    },
    orderBy: { createdAt: 'desc' }
  })
  return announcements.map(a => ({
    id: a.id,
    title: a.title,
    body: a.body,
    expiresAt: a.expiresAt?.toISOString() ?? null,
  }))
}
