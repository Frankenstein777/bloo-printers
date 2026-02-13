'use client'

import { useState } from 'react'
import Link from 'next/link'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

export default function NavbarClient({ session }: { session: any }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors fixed w-full z-50">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="font-black font-mono text-xl tracking-tighter text-[#00a3ad] dark:text-[#00f2ff]">
                                OCEAN OF BLUEPRINTS
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
                            <div className="flex items-center space-x-4">
                                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                    <Link href="/dashboard" className="hover:text-[#00f2ff] transition-colors">
                                        {session.user.email}
                                    </Link>
                                    {/* @ts-ignore */}
                                    <span className="text-[#00f2ff]"> [{session.user.subscriptionStatus || session.user.role}]</span>
                                </span>
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

                    {/* Mobile Hamburger Button */}
                    <div className="flex items-center sm:hidden">
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
                        <Link
                            href="/browse"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            Browse Catalog
                        </Link>
                        <Link
                            href="/#about"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                        >
                            About Us
                        </Link>
                        <div className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-400 dark:text-gray-600 cursor-not-allowed">
                            AI Studio (Coming Soon)
                        </div>
                        {session && (
                            <Link
                                href="/dashboard"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Dashboard
                            </Link>
                        )}
                        {session?.user.role === 'ADMIN' && (
                            <Link
                                href="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block pl-3 pr-4 py-4 border-l-4 border-transparent text-lg font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                                Admin Panel
                            </Link>
                        )}
                    </div>
                    <div className="pt-4 pb-4 border-t border-gray-200 dark:border-gray-800">
                        {session ? (
                            <div className="px-4 space-y-4">
                                <div className="flex items-center">
                                    <div className="ml-3">
                                        <div className="text-base font-medium text-gray-800 dark:text-white">{session.user.email}</div>
                                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">{session.user.role.toLowerCase()}</div>
                                    </div>
                                </div>
                                <div className="mt-3">
                                    <SignOutButton />
                                </div>
                            </div>
                        ) : (
                            <div className="mt-3 space-y-3 px-4">
                                <Link
                                    href="/login"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-center w-full px-4 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block text-center w-full px-4 py-3 border border-blue-200 shadow-sm text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50"
                                >
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
