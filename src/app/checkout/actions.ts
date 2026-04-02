'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { verifyPaystackTransaction } from '@/lib/paystack'
import { randomUUID } from 'crypto'

export async function verifyPurchaseAction(reference: string, designId: string, amountKobo: number, items: string[] = []) {
    try {
        const session = await getSession()
        if (!session) return { error: 'Unauthorized: No verified session found.' }

        // Validate User Existence (Fix for 23503 FK Error)
        const userExists = await prisma.user.findUnique({ where: { id: session.user.id } })
        if (!userExists) {
            return { error: 'Your session is stale (User not found). Please Logout and Login again.' }
        }

        // 1. Verify with Paystack
        const verifyRes = await verifyPaystackTransaction(reference)

        // MVP: If verifyRes.status is true (or fallback logic)
        if (verifyRes?.status || (verifyRes?.data?.status === 'success')) {
            // Use Raw SQL to bypass stale Prisma Client validation
            const id = randomUUID()
            const itemsJson = JSON.stringify(items)
            const amount = amountKobo / 100

            // Try precise table name quoting (Prisma usually uses TitleCase for models)
            // If this fails, the error message will hopefully be specific now.
            await prisma.$executeRaw`
            INSERT INTO "Purchase" ("id", "userId", "designId", "amount", "status", "provider", "reference", "items", "createdAt")
            VALUES (${id}, ${session.user.id}, ${designId}, ${amount}, 'succeeded', 'PAYSTACK', ${reference}, ${itemsJson}::jsonb, NOW())
        `

            revalidatePath(`/designs/${designId}`)
            return { success: true }
        }

        console.error("[Checkout] Paystack verification failed:", verifyRes)
        return { error: 'Payment verification failed at provider.' }

    } catch (e: any) {
        console.error('[Checkout] CRITICAL ERROR:', e)
        // Return the actual error message to the client for debugging
        return { error: `Server Error: ${e.message || e}` }
    }
}
