'use client'

import { useState } from 'react'
import Script from 'next/script'
import { verifyPurchaseAction } from '@/app/actions'
import { generateInvoice } from '@/lib/invoice-client'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ToastProvider'

interface InvoiceItem {
    description: string
    quantity: number
    price: number
}

interface PaystackCheckoutProps {
    email: string
    amount: number // In Kobo
    designId: string
    designTitle: string
    publicKey?: string
    isSubscription?: boolean
    metadata?: any
    invoiceItems?: InvoiceItem[]
}

declare global {
    interface Window { PaystackPop: any }
}

export default function PaystackCheckout({
    email,
    amount,
    designId,
    designTitle,
    publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
    isSubscription = false,
    metadata = {},
    invoiceItems
}: PaystackCheckoutProps) {
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const router = useRouter()
    const { toast } = useToast()

    const handlePayment = () => {
        setLoading(true)

        if (!window.PaystackPop) {
            toast('Payment system is initializing... please wait.', 'info')
            setLoading(false)
            return
        }

        const safeAmount = Math.round(amount)
        if (isNaN(safeAmount) || safeAmount <= 0) {
            toast('Invalid payment amount.', 'error')
            setLoading(false)
            return
        }

        const paystackConfig = {
            key: publicKey,
            email,
            amount: safeAmount,
            currency: 'NGN',
            ref: 'PAY-' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: {
                designId,
                ...metadata,
                custom_fields: [
                    { display_name: "Design Title", variable_name: "design_title", value: designTitle },
                    ...(metadata?.custom_fields || [])
                ]
            },
            callback: function (response: any) { onPaymentSuccess(response) },
            onClose: function () {
                setLoading(false)
                console.log("Paystack Window Closed")
            },
        }

        try {
            const handler = window.PaystackPop.setup(paystackConfig)
            handler.openIframe()
        } catch (error) {
            console.error("Paystack Setup Error:", error)
            setLoading(false)
            toast("Failed to initialize payment gateway.", 'error')
        }
    }

    const onPaymentSuccess = async (response: any) => {
        console.log("Payment Success Callback:", response)
        try {
            const result = await verifyPurchaseAction(response.reference, designId, amount)

            if (result.success) {
                try {
                    const items = (invoiceItems && invoiceItems.length > 0)
                        ? invoiceItems
                        : [{ description: `Access: ${designTitle}`, quantity: 1, price: amount / 100 }]

                    await generateInvoice({
                        id: response.reference,
                        date: new Date(),
                        user: { email },
                        items,
                        total: amount / 100,
                        currency: 'NGN',
                        reference: response.reference
                    })
                } catch (e) {
                    console.error("Invoice Error", e)
                }

                toast('Payment successful! Redirecting you to the design...', 'success', 5000)
                router.push(`/designs/${designId}?unlocked=true`)

            } else {
                toast('Payment verification failed: ' + (result.error || 'Unknown Error'), 'error')
                setLoading(false)
            }
        } catch (err) {
            console.error("Verification Error", err)
            toast('An error occurred during verification.', 'error')
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
                100% Secure Transaction.<br />
                Instant Access upon success.
            </p>
        </div>
    )
}
