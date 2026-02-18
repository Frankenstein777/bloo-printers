import { useState } from 'react'
import { verifyPurchaseAction, initializePaymentAction } from '@/app/actions'
import { generateInvoice } from '@/lib/invoice-client'
import { useRouter } from 'next/navigation'

interface PaystackCheckoutProps {
    email: string
    amount: number // In Kobo
    designId: string
    designTitle: string
    publicKey?: string
    isSubscription?: boolean
}

export default function PaystackCheckout({
    email,
    amount, // Kobo
    designId,
    designTitle,
}: PaystackCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handlePayment = async () => {
        setLoading(true)
        console.log("Paystack: Initializing Server-Side Payment...")

        try {
            const result = await initializePaymentAction(email, amount, designId, designTitle)
            console.log("Paystack: Init Result", result)

            if (result.success && result.url) {
                // Redirect user to Paystack
                window.location.href = result.url
            } else {
                alert('Payment initialization failed: ' + (result.error || 'Unknown error'))
                setLoading(false)
            }
        } catch (e) {
            console.error("Paystack Init Error:", e)
            alert('Could not start payment. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-4 px-8 rounded-none border-2 border-transparent hover:border-white transition-all transform hover:scale-105 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
                {loading ? 'Redirecting to Paystack...' : `Pay NGN ${(amount / 100).toLocaleString()}`}
            </button>

            <p className="text-xs text-center text-gray-500 font-mono">
                100% Secure Transaction.
                <br />
                You will be redirected to Paystack to complete your purchase.
            </p>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                    onClick={async () => {
                        const { checkEnvVarsAction } = await import('@/app/actions-debug')
                        const result = await checkEnvVarsAction()
                        console.log("DEBUG: Server Env Check", result)
                        alert(`Server Key Status: ${result.hasSecret ? 'LOADED' : 'MISSING'}\nPrefix: ${result.prefix}`)
                    }}
                    className="text-xs text-gray-400 underline w-full text-center"
                >
                    Debug: Check Server Keys
                </button>
            </div>
        </div>
    )
}
