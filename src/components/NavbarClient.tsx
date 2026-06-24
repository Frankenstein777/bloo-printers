'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { SignOutButton } from '@/components/auth/SignOutButton'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import DiscountBanner from '@/components/DiscountBanner'
import ThemeToggle from '@/components/ThemeToggle'

// Deterministic color from email string
function getAvatarColor(str: string) {
    const colors = [
        '#0e7490', '#1d4ed8', '#6d28d9', '#065f46',
        '#b45309', '#be185d', '#0f766e',
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
    const initial = (name ? name[0] : email[0] || '?').toUpperCase()
    const bg = getAvatarColor(email)
    const badge = sub === 'PREMIUM' ? '⭐' : role === 'ADMIN' ? '🔑' : null

    return (
        <Link href="/profile" title={email} className="flex items-center gap-1.5 group cursor-none">
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm font-sans border-2 border-transparent group-hover:border-brand-teal transition-all"
                style={{ backgroundColor: bg }}
            >
                {initial}
            </div>
            {badge && <span className="text-sm leading-none">{badge}</span>}
        </Link>
    )
}

interface Discount {
    id: string
    label: string
    percentageMin: number
    percentageMax: number
    expiresAt: string | null
}

export default function NavbarClient({ session, discount }: { session: any; discount: Discount | null }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="fixed w-full z-[100] top-0 font-sans">
            {/* Full-width discount announcement banner */}
            {discount && (
                <DiscountBanner
                    label={discount.label}
                    percentageMin={discount.percentageMin}
                    percentageMax={discount.percentageMax}
                    expiresAt={discount.expiresAt}
                />
            )}

            <nav className="bg-brand-navy border-b border-slate-800 transition-colors w-full text-white">
                <div className="max-w-screen-2xl 2xl:max-w-[95rem] w-full mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        {/* Left Side: Brand Logo and Title */}
                        <div className="flex items-center">
                            <Link href="/" className="flex-shrink-0 flex items-center gap-3 cursor-none">
                                <div className="relative w-10 h-10 shrink-0">
                                    <Image
                                        src="/logo.svg"
                                        alt="Octoplans Logo"
                                        fill
                                        className="invert brightness-[3] hue-rotate-[160deg] object-contain"
                                    />
                                </div>
                                <div className="flex flex-col justify-center leading-none">
                                    <span className="font-extrabold text-xl tracking-wider text-white">
                                        OCTOPLANS
                                    </span>
                                    <span className="text-[10px] text-slate-400 font-light mt-0.5 tracking-tight hidden sm:block">
                                        Precision Architectural Blueprints
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Links */}
                            <div className="hidden lg:flex lg:ml-10 lg:space-x-8">
                                <Link href="/catalog" className="text-slate-300 hover:text-brand-teal inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors cursor-none">
                                    Browse Plans
                                </Link>
                                <Link href="/#categories" className="text-slate-300 hover:text-brand-teal inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors cursor-none">
                                    Categories
                                </Link>
                                <Link href="/become-architect" className="text-slate-300 hover:text-brand-teal inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors cursor-none">
                                    Sell Your Plans
                                </Link>
                                <Link href="/#about" className="text-slate-300 hover:text-brand-teal inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors cursor-none">
                                    How It Works
                                </Link>
                                <Link href="/custom-brief" className="text-slate-300 hover:text-brand-teal inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors cursor-none">
                                    Custom Brief
                                </Link>
                                <Link href="/subscribe" className="text-brand-teal hover:text-white inline-flex items-center px-1 pt-1 text-sm font-extrabold tracking-wider transition-colors cursor-none">
                                    Premium
                                </Link>
                            </div>
                        </div>

                        {/* Desktop Right Side */}
                        <div className="hidden lg:flex items-center space-x-6">
                            {/* Theme Toggle */}
                            <ThemeToggle />

                            {/* Cart Icon */}
                            <Link href="/checkout/cart" className="relative text-slate-300 hover:text-brand-teal transition-colors cursor-none" title="Cart">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="absolute -top-1.5 -right-1.5 bg-brand-teal text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    2
                                </span>
                            </Link>

                            {session ? (
                                <div className="flex items-center space-x-4">
                                    <UserAvatar session={session} />
                                    <SignOutButton />
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <Link href="/login" className="text-slate-300 hover:text-brand-teal text-sm font-medium transition-colors cursor-none">
                                        Login
                                    </Link>
                                    <Link href="/signup" className="bg-brand-teal hover:bg-brand-teal/80 text-white px-5 py-2.5 rounded-md text-sm font-semibold transition-all shadow-md cursor-none">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Mobile Right Side: ThemeToggle + Cart + Burger */}
                        <div className="flex items-center space-x-3 lg:hidden">
                            <ThemeToggle />

                            {/* Cart Icon */}
                            <Link href="/checkout/cart" className="relative text-slate-300 hover:text-brand-teal transition-colors cursor-none" title="Cart">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <span className="absolute -top-1.5 -right-1.5 bg-brand-teal text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    2
                                </span>
                            </Link>

                            {session && <UserAvatar session={session} />}

                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none cursor-none"
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

                {/* Mobile Slide-down Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden bg-brand-navy border-t border-slate-800 shadow-2xl transition-all duration-300">
                        <div className="pt-2 pb-6 space-y-1 px-4">
                            <Link href="/catalog" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-slate-300 hover:text-brand-teal text-base font-medium transition-colors cursor-none">
                                Browse Plans
                            </Link>
                            <Link href="/#categories" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-slate-300 hover:text-brand-teal text-base font-medium transition-colors cursor-none">
                                Categories
                            </Link>
                            <Link href="/become-architect" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-slate-300 hover:text-brand-teal text-base font-medium transition-colors cursor-none">
                                Sell Your Plans
                            </Link>
                            <Link href="/#about" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-slate-300 hover:text-brand-teal text-base font-medium transition-colors cursor-none">
                                How It Works
                            </Link>
                            <Link href="/custom-brief" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-slate-300 hover:text-brand-teal text-base font-medium transition-colors cursor-none">
                                Custom Brief
                            </Link>
                            <Link href="/subscribe" onClick={() => setIsMobileMenuOpen(false)} className="block py-3 text-brand-teal text-base font-bold transition-colors cursor-none">
                                Premium Subscription
                            </Link>

                            {session ? (
                                <div className="pt-4 border-t border-slate-800 flex flex-col gap-3">
                                    <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-brand-teal text-base font-medium cursor-none">
                                        My Profile
                                    </Link>
                                    <SignOutButton />
                                </div>
                            ) : (
                                <div className="pt-4 border-t border-slate-800 space-y-3">
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full py-2.5 border border-slate-700 text-slate-300 hover:text-white rounded-md text-sm font-medium transition-colors cursor-none">
                                        Login
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full py-2.5 bg-brand-teal text-white hover:bg-brand-teal/80 rounded-md text-sm font-semibold transition-all cursor-none">
                                        Sign Up
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </div>
    )
}
