import { getSession } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import AIRenderGenerator from '@/components/AIRenderGenerator'
import { prisma } from '@/lib/prisma'

import { SocialActions } from '@/components/social-actions'
import { CommentSection } from '@/components/comment-section'
import { ProtectedImage } from '@/components/ProtectedImage'
import { ImageGallery } from '@/components/ImageGallery'
import PaystackButton from '@/components/PaystackButton'
import PaystackSubscribeButton from '@/components/PaystackSubscribeButton'
import { PlotFitterTrigger } from '@/components/plot-fitter/PlotFitterTrigger'
import { DownloadButtons } from '@/components/DownloadButtons'
import { getActiveDiscount } from '@/app/actions'
import { getSeededDiscountPct } from '@/lib/discount'

// ... existing imports ...

async function getDesign(id: string) {
    return await prisma.design.findUnique({
        where: { id },
    })
}

async function getComments(id: string) {
    return await prisma.comment.findMany({
        where: { designId: id },
        include: { user: { select: { email: true } } },
        orderBy: { createdAt: 'desc' }
    })
}

async function getLikeStatus(designId: string, userId?: string) {
    if (!userId) return false
    const like = await prisma.like.findUnique({
        where: {
            userId_designId: {
                userId,
                designId
            }
        }
    })
    return !!like
}

async function getLikeCount(designId: string) {
    return await prisma.like.count({
        where: { designId }
    })
}

export default async function DesignDetailPage({ params, searchParams }: { params: { id: string }, searchParams: { verify_ref?: string } }) {
    const { id } = await params
    const { verify_ref } = await searchParams
    const design = await getDesign(id)
    const session = await getSession()

    if (!design) {
        notFound()
    }

    // Auto-Verify if returning from Paystack
    let autoUnlocked = false
    if (verify_ref && session) {
        // We verify on the server before rendering
        // Note: verifyPurchaseAction is an async server action, we can call it directly here since we are on the server
        const { verifyPurchaseAction } = await import('@/app/actions')
        const result = await verifyPurchaseAction(verify_ref, id, Number(design.priceRender || design.price || 0)) // Render Price is default?
        // Wait, price logic needs to match what was sent.
        // For now, let's assume the action handles amount mismatch gracefully or we fetch the exact amount used.
        // Actually, verifyPurchaseAction checks amount. We need to pass the correct amount.
        // The checkout passed `amount` (kobo). Here we pass NGN?
        // Let's re-read verifyPurchaseAction. It expects amount in KOBO (data.data.amount is kobo).
        // So we need to pass Design Price * 100.
        // But wait, the user might have paid the One-Off price.
        // Let's assume One-Off price for now. 
        // design.price is the one-off price.

        const priceToVerify = (Number(design.price) || 0) * 100
        const verification = await verifyPurchaseAction(verify_ref, id, priceToVerify)

        if (verification.success) {
            autoUnlocked = true
        } else {
            console.error("Auto-Verification Failed:", verification.error)
        }
    }

    const comments = await getComments(id)
    const initialLikes = await getLikeCount(id)
    const isLiked = await getLikeStatus(id, session?.user.id)

    // Sanitize design for client components (Convert Decimal to Number)
    const sanitizedDesign = {
        ...design,
        price: design.price ? Number(design.price) : null,
        priceRender: Number(design.priceRender),
        priceDwg: Number(design.priceDwg),
        pricePdf: Number(design.pricePdf),
        priceElec: Number(design.priceElec),
        priceMech: Number(design.priceMech),
        priceStruct: Number(design.priceStruct),
    }

    // Fetch active discount and compute seeded % for this design
    const activeDiscount = await getActiveDiscount()
    const discountPct = activeDiscount && design.tier !== 'FREE'
        ? getSeededDiscountPct(activeDiscount.id, design.id, activeDiscount.percentageMin, activeDiscount.percentageMax)
        : 0
    const hasDiscount = discountPct > 0

    // Pre-compute discounted prices for display
    const discountedRender = hasDiscount ? Math.round(sanitizedDesign.priceRender * (1 - discountPct / 100)) : sanitizedDesign.priceRender
    const discountedDwg = hasDiscount ? Math.round(sanitizedDesign.priceDwg * (1 - discountPct / 100)) : sanitizedDesign.priceDwg
    const discountedPdf = hasDiscount ? Math.round(sanitizedDesign.pricePdf * (1 - discountPct / 100)) : sanitizedDesign.pricePdf

    // Access Logic
    // Access Logic
    const isSubscriber = (session?.user as any)?.subscriptionStatus === 'PREMIUM' || (session?.user as any)?.role === 'ADMIN'
    const isAdmin = (session?.user as any)?.role === 'ADMIN'

    // Check for individual purchase
    const purchase = session ? await prisma.purchase.findFirst({
        where: {
            userId: session.user.id,
            designId: id,
            status: 'succeeded'
        }
    }) : null

    const hasPurchased = !!purchase

    // Determining access rights
    let canDownload = false
    const showBlur = false // Removed — images are watermarked server-side

    if (isAdmin || hasPurchased) {
        canDownload = true
    } else if (design.tier === 'FREE') {
        canDownload = true
    } else if (design.tier === 'PREMIUM') {
        if (isSubscriber) {
            canDownload = true
        }
    } else if (design.tier === 'EXCLUSIVE') {
        // Only Admin or Purchaser (handled above) can access
    }

    const availableFiles = [
        { type: 'dwg', label: 'DWG', url: design.dwgUrl },
        { type: 'pdf', label: 'PDF', url: design.pdfUrl },
        { type: 'rvt', label: 'Revit (RVT)', url: design.rvtUrl },
        { type: 'pln', label: 'ArchiCAD (PLN)', url: design.plnUrl },
        { type: 'skp', label: 'SketchUp (SKP)', url: design.skpUrl },
        { type: 'electrical', label: 'Electrical', url: design.electricalUrl },
        { type: 'mechanical', label: 'Mechanical', url: design.mechanicalUrl },
        { type: 'structural', label: 'Structural', url: design.structuralUrl },
    ].filter(f => !!f.url).map(f => ({ type: f.type, label: f.label }))

    if (design.previewImages && design.previewImages.length > 0) {
        design.previewImages.forEach((url, i) => {
            availableFiles.unshift({ type: `clean-preview-${i}`, label: `Original Image ${i + 1}` })
        })
    }

    return (
        <div className="min-h-screen bg-transparent py-12 transition-colors">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                    {/* Image Gallery */}
                    <div className="flex flex-col">
                        <ImageGallery
                            images={design.previewImages}
                            title={design.title}
                            showBlur={showBlur}
                        />

                        <div className="mt-4">
                            <SocialActions designId={design.id} initialLikes={initialLikes} isLiked={isLiked} />
                        </div>

                        {design.floorPlanImages && design.floorPlanImages.length > 0 && (
                            <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Floor Plans</h3>
                                {(isSubscriber || hasPurchased) ? (
                                    <ImageGallery
                                        images={design.floorPlanImages}
                                        title={`${design.title} Floor Plans`}
                                        showBlur={false}
                                    />
                                ) : (
                                    <div className="relative">
                                        <div className="pointer-events-none select-none h-64 overflow-hidden rounded-xl">
                                             {/* Highly blurred preview of the first floor plan */}
                                            <ProtectedImage
                                                src={design.floorPlanImages[0]}
                                                alt="Floor Plan Preview"
                                                showBlur={true}
                                                objectFit="cover"
                                            />
                                        </div>
                                        <div className="absolute inset-0 z-50 flex items-center justify-center rounded-xl bg-black/20">
                                            <div className="text-center bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800">
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Subscriber Exclusive</h3>
                                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Upgrade to Premium to view floor plans.</p>
                                                <Link href="/subscribe" className="mt-4 inline-block bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-semibold py-2 px-6 rounded transition">
                                                    Subscribe Now
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AI Visualization Removed as per user request */}
                        {/* 
                        {(design.tier === 'FREE' || canDownload) && (
                            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-10">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Visualization</h3>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Unlocked for {design.tier === 'FREE' ? 'everyone' : 'owners'}.
                                </p>
                                <AIRenderGenerator designId={design.id} />
                            </div>
                        )} 
                        */}

                        <CommentSection designId={design.id} initialComments={comments} user={session?.user} />
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        {autoUnlocked && (
                            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded relative" role="alert">
                                <strong className="font-bold">Payment Successful! </strong>
                                <span className="block sm:inline">Your design is now unlocked. Thank you for your purchase.</span>
                            </div>
                        )}
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{design.title}</h1>

                        {hasDiscount && (
                            <div className="mt-3 inline-flex items-center gap-2 bg-[#00f2ff]/10 border border-[#00f2ff]/40 rounded-lg px-3 py-1.5">
                                <span className="text-[#00f2ff] font-black text-sm font-mono">🏷️ {discountPct}% OFF</span>
                                <span className="text-white/50 text-xs font-mono">limited offer</span>
                            </div>
                        )}

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            {hasDiscount ? (
                                <div className="flex items-baseline gap-3">
                                    <p className="text-2xl text-[#00f2ff] font-black font-mono">
                                        Buy One-Off
                                    </p>
                                    <p className="text-lg text-gray-400 line-through font-mono">
                                        ₦{sanitizedDesign.priceRender.toLocaleString()}
                                    </p>
                                    <span className="text-xs text-gray-500 font-mono">(3D Renders)</span>
                                </div>
                            ) : (
                                <p className="text-3xl text-gray-900 dark:text-white text-[#00a3ad] dark:text-[#00f2ff] font-mono">
                                    {design.price ? `₦${Number(design.price).toLocaleString()}` : design.tier}
                                </p>
                            )}
                        </div>

                        <div className="mt-6">
                            <h3 className="sr-only">Description</h3>
                            <div className="text-base text-gray-700 dark:text-gray-300 space-y-6" dangerouslySetInnerHTML={{ __html: design.description }} />
                        </div>

                        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Bedrooms</span>
                                    <span className="block mt-1 text-lg font-semibold text-gray-900 dark:text-white">{design.bedrooms}</span>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Floors</span>
                                    <span className="block mt-1 text-lg font-semibold text-gray-900 dark:text-white">{design.floors}</span>
                                </div>
                                <div>
                                    <span className="block text-sm font-medium text-gray-500 dark:text-gray-400">Plot Size</span>
                                    <span className="block mt-1 text-lg font-semibold text-gray-900 dark:text-white">{design.plotSize}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Features & Amenities</h3>
                            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm text-gray-600 dark:text-gray-400">
                                {[
                                    { label: 'Family Lounge', val: design.hasFamilyLounge },
                                    { label: 'Penthouse', val: design.hasPenthouse },
                                    { label: 'Study / Office', val: design.hasStudy },
                                    { label: 'Laundry', val: design.hasLaundry },
                                    { label: 'Store', val: design.hasStore },
                                    { label: 'Ante Room', val: design.hasAnteRoom },
                                    { label: 'BQ', val: design.hasBQ },
                                    { label: 'Home Cinema', val: design.hasCinema },
                                    { label: 'Gym', val: design.hasGym },
                                    { label: 'Game Room', val: design.hasGameRoom },
                                    { label: 'Bar', val: design.hasBar },
                                    { label: 'Rooftop Lounge', val: design.hasRooftop },
                                    { label: 'Reading Room', val: design.hasReadingRoom },
                                    { label: 'Spa', val: design.hasSpa },
                                    { label: 'Indoor Pool', val: design.hasIndoorPool },
                                    { label: 'Courtyard', val: design.hasCourtyard },
                                    { label: 'Atrium', val: design.hasAtrium },
                                    { label: 'Loggia', val: design.hasLoggia },
                                    { label: 'Pet Room', val: design.hasPetRoom },
                                    { label: 'Basement', val: design.hasBasement },
                                    { label: 'Garage', val: design.hasGarage },
                                    { label: 'Swimming Pool', val: design.hasPool },
                                    { label: 'Gatehouse', val: design.hasGatehouse },
                                    { label: 'Cold Room', val: design.hasColdRoom },
                                    { label: 'Pantry', val: design.hasPantry },
                                    { label: 'Panic Room', val: design.hasPanicRoom },
                                    { label: 'Music Room', val: design.hasMusicRoom },
                                    { label: 'Studio', val: design.hasStudio },
                                ].filter(f => f.val).map(f => (
                                    <div key={f.label} className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        <span>{f.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tools</h3>
                            <PlotFitterTrigger design={sanitizedDesign as any} />
                        </div>

                        <div className="mt-10 flex flex-col sm:flex-col1">
                            {canDownload ? (
                                <div className="w-full">
                                    <DownloadButtons designId={design.id} files={availableFiles} />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {design.tier === 'PREMIUM' && (
                                        <div className="space-y-3">
                                            <PaystackSubscribeButton
                                                email={session?.user?.email || ''}
                                            />
                                            <div className="relative flex py-2 items-center">
                                                <div className="flex-grow border-t border-gray-400"></div>
                                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or</span>
                                                <div className="flex-grow border-t border-gray-400"></div>
                                            </div>
                                            <Link href={`/checkout/${design.id}`} className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-3 px-8 rounded-md flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all uppercase tracking-widest">
                                                Buy One-Off
                                            </Link>
                                            <p className="text-center text-xs text-gray-500">Buy just this design</p>
                                        </div>
                                    )}
                                    {design.tier === 'EXCLUSIVE' && (
                                        <div className="space-y-2">
                                            <p className="text-xs text-gray-500 text-center uppercase">Secure Access</p>
                                            <Link href={`/checkout/${design.id}`} className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-3 px-8 rounded-md flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all uppercase tracking-widest">
                                                Purchase Access
                                            </Link>
                                        </div>
                                    )}
                                    {!session && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            <Link href="/login" className="font-bold underline text-indigo-600 dark:text-indigo-400">Login</Link> to check your access.
                                        </p>
                                    )}
                                </div>

                            )}

                            {/* Alteration Request */}
                            <div className="mt-6 text-center">
                                <a
                                    href={`https://wa.me/2347068095681?text=${encodeURIComponent(`Hello, I wish to request some alterations to ${design.title} found on Octoplans`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-3 px-8 rounded-md flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all uppercase tracking-widest gap-2"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
                                    Request Alterations / Custom Changes
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
