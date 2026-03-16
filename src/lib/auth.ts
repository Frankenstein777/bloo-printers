import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"

// Wraps NextAuth.js session for compatibility
export async function getSession() {
    const session = await getServerSession(authOptions)

    if (session) {
        return {
            user: {
                ...session.user,
                // Ensure subscriptionStatus is handled if present in user object (requires schema update or callback logic)
                // For now, mapping role.
            }
        }
    }

    return null
}

export async function login(email: string) {
    // Deprecated: use standard NextAuth signIn flow
    return null
}

export async function logout() {
    // Deprecated: use standard NextAuth signOut flow
    return null
}
