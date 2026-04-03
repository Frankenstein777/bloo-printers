'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { SocialActions } from './social-actions'
import { getCommentsAction, postCommentAction } from '@/app/actions'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'
import { WatermarkOverlay } from './WatermarkOverlay'

interface Design {
    id: string
    title: string
    description: string
    previewImages: string[]
    tier: string
    bedrooms: number
    floors: number
    plotSize?: string
    price: number | null
    priceRender?: number
    priceDwg?: number
    pricePdf?: number
    priceElec?: number
    priceMech?: number
    priceStruct?: number
}

interface DesignCardProps {
    design: Design
    initialLikes: number
    isLiked: boolean
    userEmail?: string
    discountPct?: number // seeded discount % for this card (0 = no discount)
}

export default function DesignCard({ design, initialLikes, isLiked, userEmail, discountPct }: DesignCardProps) {
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState<any[]>([])
    const [isLoadingComments, setIsLoadingComments] = useState(false)
    const [newComment, setNewComment] = useState('')
    const [isPosting, setIsPosting] = useState(false)

    const hasDiscount = !!discountPct && discountPct > 0 && design.tier !== 'FREE'
    const basePrice = design.priceRender || design.price || 0
    const discountedPrice = hasDiscount ? Math.round(basePrice * (1 - discountPct! / 100)) : basePrice

    const handleToggleComments = async () => {
        if (!showComments) {
            setIsLoadingComments(true)
            const fetched = await getCommentsAction(design.id)
            setComments(fetched)
            setIsLoadingComments(false)
        }
        setShowComments(!showComments)
    }

    const handlePostComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsPosting(true)
        await postCommentAction(design.id, newComment)

        // Refresh comments
        const fetched = await getCommentsAction(design.id)
        setComments(fetched)
        setNewComment('')
        setIsPosting(false)
    }

    return (
        <div className="group relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-[#00f2ff] hover:shadow-[0_0_15px_rgba(0,242,255,0.3)] transition-all duration-300 overflow-hidden flex flex-col">
            <div
                className="w-full min-h-60 bg-gray-200 relative aspect-w-1 aspect-h-1 group-hover:opacity-90 transition-opacity"
                onContextMenu={(e) => e.preventDefault()}
            >
                <WatermarkOverlay />
                <Image
                    src={design.previewImages[0]}
                    alt={design.title}
                    fill
                    unoptimized
                    className="object-cover object-center w-full h-full pointer-events-none select-none"
                    draggable={false}
                />
                {/* Tier badge */}
                <div className="absolute top-2 right-2 z-30">
                    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider ${design.tier === 'FREE' ? 'bg-green-100 text-green-800' :
                        design.tier === 'PREMIUM' ? 'bg-purple-100 text-purple-800' :
                            'bg-yellow-100 text-yellow-800'
                        }`}>
                        {design.tier}
                    </span>
                </div>
                {/* Discount badge */}
                {hasDiscount && (
                    <div className="absolute top-2 left-2 z-30">
                        <span className="inline-flex items-center gap-1 bg-[#00f2ff] text-black text-xs font-black px-2 py-0.5 rounded shadow-[0_0_8px_rgba(0,242,255,0.6)] uppercase tracking-widest">
                            🏷️ {discountPct}% OFF
                        </span>
                    </div>
                )}
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-[#f8fafc] font-mono tracking-tight">
                        <Link href={`/designs/${design.id}`}>
                            <span aria-hidden="true" className="absolute inset-0 z-0" />
                            {design.title}
                        </Link>
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{design.description}</p>
                </div>

                <div className="mt-4">
                    <div className="flex items-center mb-2 gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {design.bedrooms > 0 && (
                                <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>
                                    <span>{design.bedrooms} Beds</span>
                                </div>
                            )}
                            {design.floors > 0 && (
                                <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l10 6-10 6L2 8l10-6z"/><path d="M2 14l10 6 10-6"/></svg>
                                    <span>{design.floors} Floors</span>
                                </div>
                            )}
                            {design.plotSize && (
                                <div className="flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3h18v18H3z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>
                                    <span>{design.plotSize} Plot</span>
                                </div>
                            )}
                        </div>
                        {/* Price display */}
                        {basePrice > 0 && (
                            <div className="ml-auto text-right">
                                {hasDiscount ? (
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs text-gray-400 line-through font-mono">
                                            ₦{basePrice.toLocaleString()}
                                        </span>
                                        <span className="text-sm text-[#00f2ff] font-black font-mono">
                                            ₦{discountedPrice.toLocaleString()}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                        ₦{basePrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="relative z-10 border-t border-gray-100 dark:border-gray-800 pt-2 flex items-center justify-between">
                        <SocialActions
                            designId={design.id}
                            initialLikes={initialLikes}
                            isLiked={isLiked}
                        />
                        <button
                            onClick={handleToggleComments}
                            className="tour-comment-button flex items-center space-x-1 text-gray-500 hover:text-red-500 hover:text-[#00f2ff] transition-colors font-mono text-xs uppercase tracking-wide"
                        >
                            <ChatBubbleLeftIcon className="h-5 w-5" />
                            <span>Comment</span>
                        </button>
                    </div>

                    {showComments && (
                        <div className="relative z-20 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                            <div className="max-h-60 overflow-y-auto space-y-3 mb-4 pr-1 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                {isLoadingComments ? (
                                    <p className="text-sm text-gray-500 text-center">Loading comments...</p>
                                ) : comments.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center">No comments yet.</p>
                                ) : (
                                    comments.map((c: any) => (
                                        <div key={c.id} className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded text-sm">
                                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                                                <span className="font-medium">{c.userEmail?.split('@')[0]}</span>
                                                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200">{c.content}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {userEmail ? (
                                <form onSubmit={handlePostComment} className="relative">
                                    <input
                                        type="text"
                                        placeholder="Write a comment..."
                                        className="w-full text-sm border-gray-300 dark:border-gray-600 rounded-full px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        disabled={isPosting}
                                    />
                                    {isPosting && <span className="absolute right-3 top-2.5 text-xs text-indigo-500">...</span>}
                                </form>
                            ) : (
                                <p className="text-xs text-center text-gray-500">Log in to comment</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
