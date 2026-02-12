import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { SignOutButton } from '@/components/auth/SignOutButton'

export default async function Navbar() {
    const session = await getSession()

    return (
        <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
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
                            <Link href="/#testimonials" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                Testimonials
                            </Link>
                            <Link href="/#contact" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                Contact
                            </Link>
                            <Link href="/generate" className="border-transparent text-gray-500 dark:text-gray-300 hover:text-[#00f2ff] hover:border-[#00f2ff] inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium font-mono uppercase">
                                AI Studio
                            </Link>
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
                    <div className="flex items-center space-x-4">
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
                </div>
            </div>
        </nav>
    )
}
