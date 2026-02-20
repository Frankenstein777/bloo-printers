'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

// Deterministic color from email string
function getAvatarColor(str: string) {
    const colors = [
        '#0e7490', // cyan-700
        '#1d4ed8', // blue-700
        '#6d28d9', // violet-700
        '#065f46', // emerald-800
        '#b45309', // amber-700
        '#be185d', // pink-700
        '#0f766e', // teal-700
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
    return colors[Math.abs(hash) % colors.length]
}

function UserAvatar({ session }: { session: any }) {
    const email: string = session?.user?.email || ''
    const name: string = session?.user?.name || ''
    const role: string = session?.user?.role || ''
    const sub: string = session?.user?.subscriptionStatus || ''

    // Use first letter of name, or first letter of email
    const initial = (name ? name[0] : email[0] || '?').toUpperCase()
    const bg = getAvatarColor(email)

    const badge = sub === 'PREMIUM' ? '⭐' : role === 'ADMIN' ? '🔑' : null

    return (
        <Link href="/dashboard" title={email} className="flex items-center gap-1.5 group">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm font-mono border-2 border-transparent group-hover:border-[#00f2ff] transition-all"
                style={{ backgroundColor: bg }}
            >
                {initial}
            </div>
            {badge && <span className="text-sm leading-none">{badge}</span>}
        </Link>
    )
}

export default function NavbarClient({ session }: { session: any }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors fixed w-full z-50">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <Image
                                src="/logo.svg"
                                alt="Ocean of Blueprints"
                                width={32}
                                height={32}
                                className="dark:invert dark:brightness-[3] dark:hue-rotate-[160deg] opacity-80 dark:opacity-100 w-8 h-8"
                            />
                            <span className="font-black font-mono text-xl tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] hidden sm:block">
                                OCEAN OF BLUEPRINTS
                            </span>
                            <span className="font-black font-mono text-base tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] sm:hidden">
                                OOB
                            </span>
                        </Link>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/browse" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                Browse
                            </Link>
                            <Link href="/#about" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                About
                            </Link>
                            <span className="border-transparent text-gray-400 dark:text-gray-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase cursor-not-allowed" title="Coming Soon">
                                AI Studio (Soon)
                            </span>
                            {session && (
                                <Link href="/dashboard" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                    Dashboard
                                </Link>
                            )}
                            {session?.user.role === 'ADMIN' && (
                                <Link href="/admin" className="border-transparent text-gray-500 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                    Admin
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Desktop Right Side */}
                    <div className="hidden sm:flex items-center space-x-4">
                        {session ? (
                            <div className="flex items-center space-x-3">
                                <UserAvatar session={session} />
                                <SignOutButton />
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link href="/login" className="text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] text-sm font-medium font-mono uppercase">
                                    Login
                                </Link>
                                <Link href="/signup" className="bg-[#00a3ad] dark:bg-[#00f2ff] text-black px-4 py-2 text-sm font-bold font-mono hover:bg-[#00f2ff] hover:shadow-[0_0_15px_rgba(0,242,255,0.5)] transition-all uppercase">
                                    Sign up_
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile: Avatar + Hamburger */}
                    <div className="flex items-center gap-3 sm:hidden">
                        {session && <UserAvatar session={session} />}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isMobileMenuOpen ? (
                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 h-screen overflow-y-auto pb-20">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link href="/browse" onClick={() => setIsMobileMenuOpen(false)} className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                            Browse Catalog
                        </Link>
                        <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                            About Us
                        </Link>
                        <div className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed">
                            AI Studio (Coming Soon)
                        </div>
                        {session && (
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                Dashboard
                            </Link>
                        )}
                        {session?.user.role === 'ADMIN' && (
                            <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                                Admin Panel
                            </Link>
                        )}
                    </div>
                    {session && (
                        <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-800 px-4">
                            <SignOutButton />
                        </div>
                    )}
                    {!session && (
                        <div className="mt-3 space-y-3 px-4">
                            <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full px-4 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                Login
                            </Link>
                            <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full px-4 py-3 border border-blue-200 shadow-sm text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50">
                                Sign up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    )
}
