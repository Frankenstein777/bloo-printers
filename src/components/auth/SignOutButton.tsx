"use client"

import { signOut } from "next-auth/react"

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-sm font-mono uppercase text-gray-500 dark:text-gray-400 hover:text-[#00f2ff] transition-colors"
        >
            Logout
        </button>
    )
}
