'use client'

import { useState } from 'react'
import ProfileEditForm from './ProfileEditForm'
import { User } from '@prisma/client'

export default function ProfileClientWrapper({ children, user }: { children: React.ReactNode, user: User }) {
    const [isEditing, setIsEditing] = useState(false)

    // Intercept click on children to open modal (if data-edit-trigger is present)
    const handleChildClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('[data-edit-trigger]')) {
            setIsEditing(true)
        }
    }

    return (
        <div onClick={handleChildClick}>
            {children}
            {isEditing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
                            <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-500">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <ProfileEditForm user={user} onCancel={() => setIsEditing(false)} />
                    </div>
                </div>
            )}
        </div>
    )
}
