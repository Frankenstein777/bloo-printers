'use client'

import { useState, useTransition } from 'react'
import { updateUserAction } from '@/app/actions'
import { User } from '@prisma/client'
import { useRouter } from 'next/navigation'

interface ProfileEditFormProps {
    user: User
    onCancel: () => void
}

export default function ProfileEditForm({ user, onCancel }: ProfileEditFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState('')

    const handleSubmit = async (formData: FormData) => {
        setError('')
        startTransition(async () => {
            const res = await updateUserAction(formData)
            if (res?.error) {
                setError(res.error)
            } else {
                router.refresh()
                onCancel()
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                    <input
                        name="name"
                        defaultValue={user.name || ''}
                        placeholder="e.g. John Doe"
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number</label>
                    <input
                        name="phone"
                        defaultValue={user.phone || ''}
                        placeholder="+234..."
                        className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bio / About</label>
                <textarea
                    name="bio"
                    defaultValue={user.bio || ''}
                    rows={3}
                    placeholder="Tell us a bit about yourself..."
                    className="mt-1 block w-full rounded-md border-slate-300 dark:border-slate-600 border p-2 bg-white dark:bg-slate-800"
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isPending}
                    className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>
        </form>
    )
}
