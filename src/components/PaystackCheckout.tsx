'use client'

import { useState } from 'react'
import Script from 'next/script'
import { verifyPurchaseAction } from '@/app/actions'
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

declare global {
    interface Window {
        PaystackPop: any
    }
}

export default function PaystackCheckout({
    email,
    amount,
    designId,
    designTitle,
    publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    isSubscription = false
}: PaystackCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const router = useRouter()

    const handlePayment = () => {
        setLoading(true)
        console.log("Paystack: Starting Payment Flow")
        console.log("Paystack: Public Key loaded?", !!publicKey, publicKey?.substring(0, 10) + "...")
        console.log("Paystack: Script loaded?", scriptLoaded)
        console.log("Paystack: Window Object?", !!window.PaystackPop)

        if (!window.PaystackPop) {
            alert('Payment system is initializing... please wait.')
            console.error("PaystackPop is undefined", window)
            setLoading(false)
            return
        }

        try {
            const handler = window.PaystackPop.setup({
                key: publicKey,
                email: email,
                amount: amount,
                currency: 'NGN',
                ref: 'TEST-' + Math.floor((Math.random() * 1000000000) + 1),
                metadata: {
                    designId: designId,
                    custom_fields: [
                        {
                            display_name: "Design Title",
                            variable_name: "design_title",
                            value: designTitle
                        }
                    ]
                },
                callback: async function (response: any) {
                    console.log("Paystack: Callback received", response)
                    try {
                        const result = await verifyPurchaseAction(response.reference, designId, amount)
                        console.log("Paystack: Verification Result", result)

                        if (result.success) {
                            // Generate Invoice
                            try {
                                generateInvoice({
                                    id: response.reference,
                                    date: new Date(),
                                    user: { email: email },
                                    items: [{ description: `Access: ${designTitle}`, quantity: 1, price: amount / 100 }],
                                    total: amount / 100,
                                    currency: 'NGN',
                                    reference: response.reference
                                })
                            } catch (e) {
                                console.error("Invoice Error", e)
                            }

                            alert('Payment Successful! Redirecting you to the design...')
                            router.push(`/designs/${designId}?unlocked=true`)

                        } else {
                            alert('Payment verification failed on server. Please contact support. Error: ' + result.error)
                            setLoading(false)
                        }
                    } catch (err) {
                        console.error("Verification Error", err)
                        alert('An error occurred during verification.')
                        setLoading(false)
                    }
                },
                onClose: function () {
                    console.log("Paystack: Window Closed")
                    setLoading(false)
                },
            })

            console.log("Paystack: Handler Created", handler)
            handler.openIframe()
        } catch (e) {
            console.error("Paystack: Initialization Error", e)
            setLoading(false)
            alert("Could not open payment window. Check console for details.")
        }
    }

    return (
        <div className="w-full max-w-md mx-auto space-y-6">
            <Script
                src="https://js.paystack.co/v1/inline.js"
                strategy="lazyOnload"
                onLoad={() => setScriptLoaded(true)}
            />

            {!scriptLoaded && (
                <div className="text-center text-sm text-[#00f2ff] animate-pulse">
                    Connecting to Paystack Secure Gateway...
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading || !scriptLoaded}
                className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-4 px-8 rounded-none border-2 border-transparent hover:border-white transition-all transform hover:scale-105 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
                {loading ? 'Processing Secure Payment...' : `Pay NGN ${(amount / 100).toLocaleString()}`}
            </button>

            <p className="text-xs text-center text-gray-500 font-mono">
                100% Secure Transaction.
                <br />
                Instant Access + PDF Invoice generated upon success.
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
