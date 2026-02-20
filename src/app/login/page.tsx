'use client'

import { Suspense } from 'react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

// Inner component that reads search params (must be wrapped in Suspense)
function LoginContent() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-neutral-950">
            <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white font-mono">
                        Sign in
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Secure access via Google — you'll be returned to where you were.
                    </p>
                </div>
                <div className="mt-8">
                    {/* GoogleSignInButton reads ?callbackUrl= from URL internally */}
                    <GoogleSignInButton />
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense>
            <LoginContent />
        </Suspense>
    )
}
