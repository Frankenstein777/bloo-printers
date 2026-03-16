'use client'

import { useState } from 'react'
import { postCommentAction } from '@/app/actions'

interface Comment {
    id: string
    user: { email: string }
    content: string
    createdAt: Date
}

interface CommentSectionProps {
    designId: string
    initialComments: Comment[]
    user?: { id: string, email?: string | null } | null
}

export function CommentSection({ designId, initialComments, user }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>(initialComments)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        setIsSubmitting(true)
        // In a real app we'd get the actual new comment from server response or user session
        // For MVP, simplistic optimistic update assuming success or subsequent refresh
        // Here we just wait for server action revalidation mostly.

        await postCommentAction(designId, newComment)
        setNewComment('')
        setIsSubmitting(false)
        // Note: Real-time update would require returning the new comment from action 
        // or re-fetching. Relying on Next.js revalidatePath for now.
    }

    return (
        <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Comments</h3>

            {/* Comment List */}
            <div className="mt-4 space-y-4 mb-8">
                {comments.length === 0 ? (
                    <p className="text-gray-500 text-sm">No comments yet. Be the first!</p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                {comment.user.email} • {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-200">{comment.content}</p>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            {!user ? (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Please <a href="/login" className="text-indigo-600 hover:underline">log in</a> to leave a comment.</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        rows={3}
                        className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                    />
                    <div className="mt-2 flex justify-end">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
