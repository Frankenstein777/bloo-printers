'use client'

import { useState } from 'react'
import { HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid'
import { toggleLikeAction, addToCollectionAction } from '@/app/actions'

interface SocialActionsProps {
    designId: string
    initialLikes: number
    isLiked: boolean
    isSaved?: boolean
}

export function SocialActions({ designId, initialLikes, isLiked: initialIsLiked, isSaved: initialIsSaved }: SocialActionsProps) {
    const [likes, setLikes] = useState(initialLikes)
    const [isLiked, setIsLiked] = useState(initialIsLiked)
    const [isSaved, setIsSaved] = useState(initialIsSaved ?? false)

    const handleLike = async () => {
        // Optimistic update
        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikes(prev => newIsLiked ? prev + 1 : prev - 1)

        await toggleLikeAction(designId)
    }

    const handleSave = async () => {
        // Optimistic
        setIsSaved(!isSaved)
        // Hardcoded 'default' collection logic for MVP action
        await addToCollectionAction(designId)
    }

    return (
        <div className="flex space-x-4 py-4">
            <button
                onClick={handleLike}
                className="tour-like-button flex items-center space-x-1 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Like"
            >
                {isLiked ? (
                    <HeartSolid className="h-6 w-6 text-red-500" />
                ) : (
                    <HeartIcon className="h-6 w-6" />
                )}
                <span>{likes}</span>
            </button>

            <button
                onClick={handleSave}
                className="tour-save-button flex items-center space-x-1 text-gray-500 hover:text-indigo-500 transition-colors"
                aria-label="Save"
            >
                {isSaved ? (
                    <BookmarkSolid className="h-6 w-6 text-indigo-500" />
                ) : (
                    <BookmarkIcon className="h-6 w-6" />
                )}
                <span>Save</span>
            </button>
        </div>
    )
}
