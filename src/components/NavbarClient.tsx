'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

// Generate initials-based avatar color from email
function getAvatarColor(str: string) {
    const colors = [
        'bg-cyan-500', 'bg-blue-500', 'bg-purple-500', 'bg-green-500',
        'bg-orange-500', 'bg-pink-500', 'bg-teal-500'
    ]
    const index = str.charCodeAt(0) % colors.length
    return colors[index]
}

function UserAvatar({ session }: { session: any }) {
    const email: string = session.user.email || ''
    const name: string = session.user.name || ''
    const image: string = session.user.image || ''
    const role: string = session.user.role || ''
    const sub: string = session.user.subscriptionStatus || ''
    const initials = (name ? name[0] : email[0] || '?').toUpperCase()
    const badgeText = sub === 'PREMIUM' ? '⭐' : role === 'ADMIN' ? '🔑' : ''

    return (
        <Link href="/dashboard" className="flex items-center gap-2 group" title={email}>
            {image ? (
                <Image
                    src={image}
                    alt={name || email}
                    width={36}
                    height={36}
                    className="rounded-full border-2 border-[#00f2ff]/40 group-hover:border-[#00f2ff] transition-all"
                />
            ) : (
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm font-mono border-2 border-[#00f2ff]/40 group-hover:border-[#00f2ff] transition-all ${getAvatarColor(email)}`}>
                    {initials}
                </div>
            )}
            {badgeText && (
                <span className="text-sm" title={sub === 'PREMIUM' ? 'Premium' : 'Admin'}>{badgeText}</span>
            )}
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
                        <Link href="/" className="flex-shrink-0 flex items-center gap-3">
                            {/* Octopus Logo */}
                            <Image
                                src="/logo.png"
                                alt="Ocean of Blueprints Logo"
                                width={36}
                                height={36}
                                className="invert dark:invert-0 opacity-80 dark:opacity-100"
                            />
                            <span className="font-black font-mono text-xl tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] hidden sm:block">
                                OCEAN OF BLUEPRINTS
                            </span>
                            {/* Mobile: abbreviated */}
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
                    {/* Mobile sign out */}
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
