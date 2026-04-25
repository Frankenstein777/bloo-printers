'use client'

import { Suspense } from 'react'
import { signupAction } from '../actions'
import Link from 'next/link'
import { useState } from 'react'
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton'

export default function SignupPage() {
    const [mode, setMode] = useState<'USER' | 'ARCHITECT'>('USER')

    return (
        <Suspense>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
                <div className="max-w-md w-full space-y-8 p-10 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                            Create your account
                        </h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Join Octoplans to access premium architectural designs.
                        </p>
                    </div>

                    {/* Mode Toggle */}
                    <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg mt-6">
                        <button 
                            type="button" 
                            onClick={() => setMode('USER')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'USER' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Sign up as User
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setMode('ARCHITECT')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${mode === 'ARCHITECT' ? 'bg-white dark:bg-slate-700 text-[#00a3ad] dark:text-[#00f2ff] shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
                        >
                            Partner as Architect
                        </button>
                    </div>

                    <div className="mt-8">
                        <GoogleSignInButton 
                            text={mode === 'USER' ? "Sign up with Google" : "Apply with Google"} 
                            callbackUrl={mode === 'ARCHITECT' ? "/become-architect" : "/"}
                        />

                        <div className="mt-6 relative">
                            <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-slate-900 text-gray-500">Or continue with</span>
                            </div>
                        </div>
                    </div>

                    <form className="mt-6 space-y-4" action={signupAction}>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email address <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-slate-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="your@email.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Phone number <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                autoComplete="tel"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-slate-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="+234 800 000 0000"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Password <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-slate-800 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Create a password"
                            />
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                            >
                                Create Account
                            </button>
                        </div>

                        <p className="text-xs text-center text-gray-400 mt-2">
                            Your phone number is stored securely and displayed on your profile.
                        </p>
                    </form>

                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </Suspense>
    )
}
