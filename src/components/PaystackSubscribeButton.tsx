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
    const [showModal, setShowModal] = useState(false)
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
                onClick={() => setShowModal(true)}
                disabled={loading || !scriptLoaded}
                className="w-full bg-purple-600 border border-transparent rounded-md py-3 px-8 flex items-center justify-center text-base font-medium text-white hover:bg-purple-700 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_20px_rgba(147,51,234,0.6)]"
            >
                {loading ? 'Processing...' : (scriptLoaded ? 'Subscribe (Monthly Access)' : 'Loading Payment...')}
            </button>

            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-purple-500/30 rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
                        <button 
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                        
                        <h3 className="text-2xl font-black text-white font-mono uppercase tracking-tighter mb-2">
                            Premium <span className="text-purple-400">Benefits</span>
                        </h3>
                        <p className="text-sm text-gray-400 mb-6 font-mono">Unlock standard tools for architectural innovation.</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex gap-3 items-start p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <span className="text-purple-400 text-xl">🪙</span>
                                <div>
                                    <h4 className="font-bold text-white text-sm">500 Credits on GBS AI Studio</h4>
                                    <p className="text-xs text-gray-400">Instantly credited to your partner account.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                                <span className="text-blue-400 text-xl">🏗️</span>
                                <div>
                                    <h4 className="font-bold text-white text-sm">Free Source CAD Files</h4>
                                    <p className="text-xs text-gray-400">Get DWG/RVT files for free whenever you purchase a Full Design PDF.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 items-start p-3 bg-[#00f2ff]/10 rounded-lg border border-[#00f2ff]/20">
                                <span className="text-[#00f2ff] text-xl">🏷️</span>
                                <div>
                                    <h4 className="font-bold text-white text-sm">15% Subscriber Discount</h4>
                                    <p className="text-xs text-gray-400">Automatic 15% off all design purchases.</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                setShowModal(false)
                                handleSubscribe()
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-8 rounded-lg transition-colors uppercase tracking-widest text-sm"
                        >
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
