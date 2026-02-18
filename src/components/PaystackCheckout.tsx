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
    publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    isSubscription = false
}: PaystackCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const router = useRouter()

    const handlePayment = () => {
        setLoading(true)

        if (!window.PaystackPop) {
            alert('Payment system is initializing... please wait.')
            setLoading(false)
            return
        }

        const safeAmount = Math.round(amount) // Ensure Integer
        if (isNaN(safeAmount) || safeAmount <= 0) {
            alert('Invalid Payment Amount')
            setLoading(false)
            return
        }

        const paystackConfig = {
            key: publicKey,
            email: email,
            amount: safeAmount,
            currency: 'NGN',
            ref: 'PAY-' + Math.floor((Math.random() * 1000000000) + 1),
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
            callback: function (response: any) {
                // Wrap async logic
                onPaymentSuccess(response)
            },
            onClose: function () {
                setLoading(false)
                console.log("Paystack Window Closed")
            },
        }

        console.log("Paystack Config Payload:", { ...paystackConfig, key: '***' }) // Log payload (hide key)

        try {
            const handler = window.PaystackPop.setup(paystackConfig)
            handler.openIframe()
        } catch (error) {
            console.error("Paystack Setup Error:", error)
            setLoading(false)
            alert("Failed to initialize payment gateway.")
        }
    }

    const onPaymentSuccess = async (response: any) => {
        console.log("Payment Success Callback:", response)
        try {
            const result = await verifyPurchaseAction(response.reference, designId, amount)

            if (result.success) {
                // ... Invoice generation (fire and forget or await) ... 
                try {
                    await generateInvoice({
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
                alert('Payment verification failed on server: ' + (result.error || 'Unknown Error'))
                setLoading(false)
            }
        } catch (err) {
            console.error("Verification Error", err)
            alert('An error occurred during verification.')
            setLoading(false)
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
                    Loading Secure Payment Gateway...
                </div>
            )}

            <button
                onClick={handlePayment}
                disabled={loading || !scriptLoaded}
                className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-4 px-8 rounded-none border-2 border-transparent hover:border-white transition-all transform hover:scale-105 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,242,255,0.3)]"
            >
                {loading ? 'Processing...' : `Pay NGN ${(amount / 100).toLocaleString()}`}
            </button>

            <p className="text-xs text-center text-gray-500 font-mono">
                100% Secure Transaction.
                <br />
                Instant Access upon success.
            </p>
        </div>
    )
}
