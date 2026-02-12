'use client'

import { useState } from 'react'
// We will use a dynamic import or checking for window.PaystackPop if we were using the script directly.
// But for cleaner React code, we'll implement a custom handler or use 'react-paystack' pattern.
// However, adding a new dependency might be annoying. Let's use the Inline Script approach for maximum compatibility without `npm install`.

import Script from 'next/script'
import { verifyPurchaseAction } from '@/app/actions'
import { generateInvoice } from '@/lib/invoice-client'

interface PaystackButtonProps {
    email: string
    amount: number // In Kobo (e.g. 500000 for 5000 NGN)
    designId: string
    publicKey?: string
}

declare global {
    interface Window {
        PaystackPop: any
    }
}

export default function PaystackButton({ email, amount, designId, publicKey = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }: PaystackButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePayment = () => {
        setLoading(true)

        // Check if Paystack loaded
        if (!window.PaystackPop) {
            alert('Payment system loading... please try again in a second.')
            setLoading(false)
            return
        }

        const handler = window.PaystackPop.setup({
            key: publicKey,
            email: email,
            amount: amount, // in kobo
            currency: 'NGN',
            ref: 'TEST-' + Math.floor((Math.random() * 1000000000) + 1), // Generate a random ref
            metadata: {
                designId: designId
            },
            callback: async function (response: any) {
                try {
                    // Verify transaction on server
                    const result = await verifyPurchaseAction(response.reference, designId, amount)

                    if (result.success) {
                        alert('Payment successful! generating Invoice...')
                        try {
                            generateInvoice({
                                id: response.reference,
                                date: new Date(),
                                user: { email: email },
                                items: [{ description: 'Design Access', quantity: 1, price: amount / 100 }],
                                total: amount / 100,
                                currency: 'NGN',
                                reference: response.reference
                            })
                        } catch (pdfError) {
                            console.error("Invoice generation failed", pdfError)
                            alert("Payment success, but invoice generation failed. Please contact support.")
                        }
                    } else {
                        alert('Payment verification failed on server. Contact support.')
                    }
                } catch (err) {
                    console.error("Payment Error", err)
                    alert('An error occurred during verification.')
                } finally {
                    setLoading(false)
                }
            },
            onClose: function () {
                setLoading(false)
            },
        })

        try {
            handler.openIframe()
        } catch (e) {
            setLoading(false)
            alert("Could not open payment window.")
        }
    }

    return (
        <>
            <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
            <button
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-3 px-8 rounded-md hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Processing...' : `Pay Now (NGN ${amount / 100})`}
            </button>
        </>
    )
}
