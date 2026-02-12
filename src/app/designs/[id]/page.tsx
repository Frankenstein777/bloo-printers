import { PrismaClient } from '@prisma/client'
import { getSession } from '@/lib/auth'
import Image from 'next/image'
import Link from 'next/link'
import { subscribeAction, purchaseAction } from '@/app/actions'
import { notFound } from 'next/navigation'
import AIRenderGenerator from '@/components/AIRenderGenerator'

const prisma = new PrismaClient()

import { SocialActions } from '@/components/social-actions'
import { CommentSection } from '@/components/comment-section'
import { ProtectedImage } from '@/components/ProtectedImage'
import { ImageGallery } from '@/components/ImageGallery'
import PaystackButton from '@/components/PaystackButton'
import { PlotFitterTrigger } from '@/components/plot-fitter/PlotFitterTrigger'

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

export default async function DesignDetailPage({ params }: { params: { id: string } }) {
    const { id } = await params
    const design = await getDesign(id)
    const session = await getSession()

    if (!design) {
        notFound()
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
    let showBlur = false

    if (isAdmin || hasPurchased) {
        canDownload = true
    } else if (design.tier === 'FREE') {
        canDownload = true
    } else if (design.tier === 'PREMIUM') {
        if (isSubscriber) {
            canDownload = true
        } else {
            showBlur = true
        }
    } else if (design.tier === 'EXCLUSIVE') {
        // Only Admin or Purchaser (handled above) can access
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

                        {(design.tier === 'FREE' || canDownload) && (
                            <div className="mt-10 border-t border-gray-200 dark:border-gray-700 pt-10">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Visualization</h3>
                                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                    Unlocked for {design.tier === 'FREE' ? 'everyone' : 'owners'}.
                                </p>
                                <AIRenderGenerator designId={design.id} />
                            </div>
                        )}

                        <CommentSection designId={design.id} initialComments={comments} user={session?.user} />
                    </div>

                    {/* Product Info */}
                    <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">{design.title}</h1>

                        <div className="mt-3">
                            <h2 className="sr-only">Product information</h2>
                            <p className="text-3xl text-gray-900 dark:text-white">{design.price ? `$${design.price.toString()}` : design.tier}</p>
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

                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Tools</h3>
                            <PlotFitterTrigger design={sanitizedDesign as any} />
                        </div>

                        <div className="mt-10 flex sm:flex-col1">
                            {canDownload ? (
                                <a href={design.dwgUrl} target="_blank" rel="noopener noreferrer" className="max-w-xs flex-1 bg-indigo-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-50 focus:ring-indigo-500 sm:w-full">
                                    Download DWG
                                </a>
                            ) : (
                                <div className="space-y-4">
                                    {design.tier === 'PREMIUM' && (
                                        <div className="space-y-3">
                                            <form action={subscribeAction}>
                                                <button type="submit" className="w-full bg-purple-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-purple-700 uppercase tracking-wider">
                                                    Subscribe (Monthly Access)
                                                </button>
                                            </form>
                                            <div className="relative flex py-2 items-center">
                                                <div className="flex-grow border-t border-gray-400"></div>
                                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or</span>
                                                <div className="flex-grow border-t border-gray-400"></div>
                                            </div>
                                            <Link href={`/checkout/${design.id}`} className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-3 px-8 rounded-md flex items-center justify-center hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all uppercase tracking-widest">
                                                Buy One-Off (NGN {(design.price || 2000).toLocaleString()})
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
                                    href={`https://wa.me/2347068095681?text=${encodeURIComponent(`Hello, I wish to intend for some alteration to ${design.title} found on the ocean of blueprints`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-green-500 hover:underline transition-colors"
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
