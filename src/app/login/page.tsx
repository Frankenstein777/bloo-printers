'use client'

import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Secure access via Google
                    </p>
                </div>
                <div className="mt-8">
                    <GoogleSignInButton />
                </div>
            </div>
        </div>
    )
}
