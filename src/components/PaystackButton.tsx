'use client'

import { useState } from 'react'
import Script from 'next/script'
import { verifyPurchaseAction } from '@/app/actions'
import { generateInvoice } from '@/lib/invoice-client'
import { useToast } from '@/components/ToastProvider'

interface PaystackButtonProps {
    email: string
    amount: number // In Kobo (e.g. 500000 for 5000 NGN)
    designId: string
    publicKey?: string
}

declare global {
    interface Window { PaystackPop: any }
}

export default function PaystackButton({ email, amount, designId, publicKey = 'pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' }: PaystackButtonProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const handlePayment = () => {
        setLoading(true)

        if (!window.PaystackPop) {
            toast('Payment system loading... please try again in a second.', 'info')
            setLoading(false)
            return
        }

        const handler = window.PaystackPop.setup({
            key: publicKey,
            email,
            amount,
            currency: 'NGN',
            ref: 'TEST-' + Math.floor((Math.random() * 1000000000) + 1),
            metadata: { designId },
            callback: async function (response: any) {
                try {
                    const result = await verifyPurchaseAction(response.reference, designId, amount)
                    if (result.success) {
                        toast('Payment successful! Generating invoice...', 'success', 6000)
                        try {
                            await generateInvoice({
                                id: response.reference,
                                date: new Date(),
                                user: { email },
                                items: [{ description: 'Design Access', quantity: 1, price: amount / 100 }],
                                total: amount / 100,
                                currency: 'NGN',
                                reference: response.reference
                            })
                        } catch (pdfError) {
                            console.error("Invoice generation failed", pdfError)
                            toast("Payment successful — invoice generation failed. Please contact support.", 'warning')
                        }
                    } else {
                        toast('Payment verification failed on server. Contact support.', 'error')
                    }
                } catch (err) {
                    console.error("Payment Error", err)
                    toast('An error occurred during verification.', 'error')
                } finally {
                    setLoading(false)
                }
            },
            onClose: function () { setLoading(false) },
        })

        try {
            handler.openIframe()
        } catch (e) {
            setLoading(false)
            toast("Could not open payment window.", 'error')
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
