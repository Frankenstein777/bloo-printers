'use client'

import { useState } from 'react'
import Script from 'next/script'
import { verifySubscriptionAction } from '@/app/actions'
import { useToast } from '@/components/ToastProvider'
import { useRouter } from 'next/navigation'

interface PaystackSubscribeButtonProps {
    email: string
    publicKey?: string
    planId?: string
    amount?: number // In Kobo, used if planId is not provided
}

declare global {
    interface Window { PaystackPop: any }
}

export default function PaystackSubscribeButton({ 
    email, 
    publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_xxxxxxxx',
    planId = process.env.NEXT_PUBLIC_PAYSTACK_PLAN_ID,
    amount = 5000000 // Default to 50,000 NGN (in kobo) if no plan is set
}: PaystackSubscribeButtonProps) {
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleSubscribe = () => {
        setLoading(true)

        if (!window.PaystackPop) {
            toast('Payment system is initializing... please wait.', 'info')
            setLoading(false)
            return
        }

        const paystackConfig: any = {
            key: publicKey,
            email,
            currency: 'NGN',
            ref: 'SUB-' + Math.floor((Math.random() * 1000000000) + 1),
            callback: async function (response: any) {
                try {
                    const result = await verifySubscriptionAction(response.reference)
                    if (result.success) {
                        toast('Subscription successful! Welcome to Premium.', 'success', 6000)
                        router.push('/profile')
                    } else {
                        toast('Subscription verification failed. Contact support.', 'error')
                    }
                } catch (err) {
                    console.error("Subscription Error", err)
                    toast('An error occurred during verification.', 'error')
                } finally {
                    setLoading(false)
                }
            },
            onClose: function () {
                setLoading(false)
            },
        }

        if (planId) {
            paystackConfig.plan = planId
            // Optional: amount is ignored by Paystack if a valid plan is passed,
            // but providing it might be required by the popup depending on configuration.
            // Leaving it out forces Paystack to fetch the plan amount.
        } else {
            paystackConfig.amount = amount
        }

        try {
            const handler = window.PaystackPop.setup(paystackConfig)
            handler.openIframe()
        } catch (e) {
            setLoading(false)
            toast("Could not open payment window.", 'error')
        }
    }

    return (
        <div className="w-full">
            <Script 
                src="https://js.paystack.co/v1/inline.js" 
                strategy="lazyOnload" 
                onLoad={() => setScriptLoaded(true)}
            />
            
            <button
                onClick={handleSubscribe}
                disabled={loading || !scriptLoaded}
                className="w-full bg-purple-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-purple-700 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Processing...' : (scriptLoaded ? 'Subscribe (Monthly Access)' : 'Loading Payment...')}
            </button>
        </div>
    )
}
