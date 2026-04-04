'use client'

import { useState } from 'react'
import Script from 'next/script'
import { verifySubscriptionAction } from '@/app/actions'
import { useToast } from '@/components/ToastProvider'
import { useRouter } from 'next/navigation'

// ₦80,000/month  → 8,000,000 kobo
// ₦800,000/year  → 80,000,000 kobo  (save ₦160,000 vs 12 months)
const PLANS = {
    monthly: { label: 'Monthly', price: 80_000, kobo: 8_000_000, period: '/ month' },
    annual:  { label: 'Annual',  price: 800_000, kobo: 80_000_000, period: '/ year', badge: 'Save ₦160,000' },
} as const

type PlanKey = keyof typeof PLANS

interface Props {
    email: string
    publicKey?: string
}

declare global {
    interface Window { PaystackPop: any }
}

export default function PaystackSubscribeButton({
    email,
    publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || '',
}: Props) {
    const [loading, setLoading] = useState(false)
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [plan, setPlan] = useState<PlanKey>('monthly')
    const { toast } = useToast()
    const router = useRouter()

    const handleSubscribe = () => {
        setLoading(true)

        const run = () => {
            const selectedPlan = PLANS[plan]
            const paystackConfig = {
                key: publicKey,
                email,
                amount: selectedPlan.kobo,   // Always send amount — no plan ID
                currency: 'NGN',
                ref: 'SUB-' + Date.now() + '-' + Math.floor(Math.random() * 1e6),
                metadata: {
                    custom_fields: [
                        { display_name: 'Plan', variable_name: 'plan', value: selectedPlan.label },
                    ],
                },
                callback: async (response: any) => {
                    try {
                        const result = await verifySubscriptionAction(response.reference)
                        if (result.success) {
                            toast('Subscription successful! Welcome to Premium. 🎉', 'success', 6000)
                            router.push('/profile')
                        } else {
                            toast('Verification failed. Please contact support.', 'error')
                        }
                    } catch (err) {
                        console.error('Subscription Error', err)
                        toast('An error occurred during verification.', 'error')
                    } finally {
                        setLoading(false)
                    }
                },
                onClose: () => {
                    setLoading(false)
                },
            }

            try {
                const handler = window.PaystackPop.setup(paystackConfig)
                handler.openIframe()
            } catch (e) {
                console.error('PaystackPop error:', e)
                setLoading(false)
                toast('Could not open payment window. Please refresh and try again.', 'error')
            }
        }

        if (window.PaystackPop) {
            run()
        } else {
            // Poll up to 5 s for the Paystack script to be ready
            let elapsed = 0
            const interval = setInterval(() => {
                elapsed += 200
                if (window.PaystackPop) {
                    clearInterval(interval)
                    setScriptLoaded(true)
                    run()
                } else if (elapsed >= 5000) {
                    clearInterval(interval)
                    setLoading(false)
                    toast('Payment system failed to load. Please refresh and try again.', 'error')
                }
            }, 200)
        }
    }

    const selected = PLANS[plan]

    return (
        <div className="w-full">
            <Script
                src="https://js.paystack.co/v1/inline.js"
                strategy="afterInteractive"
                onLoad={() => setScriptLoaded(true)}
                onError={() => toast('Failed to load payment system. Please refresh.', 'error')}
            />

            {/* Trigger button */}
            <button
                onClick={() => setShowModal(true)}
                disabled={loading || !scriptLoaded}
                className="w-full bg-[#00f2ff] hover:bg-white text-black font-black font-mono py-4 px-8 flex items-center justify-center text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_25px_rgba(0,242,255,0.5)]"
            >
                {loading
                    ? 'Processing...'
                    : scriptLoaded
                        ? 'Subscribe Now →'
                        : 'Loading Payment...'}
            </button>

            {/* Confirmation modal */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-950 border border-[#00f2ff]/20 rounded-2xl w-full max-w-md p-6 relative shadow-[0_0_60px_rgba(0,242,255,0.1)]">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>

                        <h3 className="text-2xl font-black text-white font-mono uppercase tracking-tighter mb-1">
                            Confirm <span className="text-[#00f2ff]">Subscription</span>
                        </h3>
                        <p className="text-sm text-gray-500 mb-6 font-mono">Choose your billing period</p>

                        {/* Plan toggle */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                            {(Object.keys(PLANS) as PlanKey[]).map(key => {
                                const p = PLANS[key]
                                const active = plan === key
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setPlan(key)}
                                        className={`relative p-4 rounded-xl border text-left transition-all ${
                                            active
                                                ? 'border-[#00f2ff] bg-[#00f2ff]/10 shadow-[0_0_20px_rgba(0,242,255,0.15)]'
                                                : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                                        }`}
                                    >
                                        {'badge' in p && (
                                            <span className="absolute -top-2 left-3 bg-[#00f2ff] text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wide">
                                                {(p as any).badge}
                                            </span>
                                        )}
                                        <p className={`font-mono font-bold text-sm mb-1 ${active ? 'text-[#00f2ff]' : 'text-gray-300'}`}>
                                            {p.label}
                                        </p>
                                        <p className="text-white font-black text-xl font-mono">
                                            ₦{p.price.toLocaleString()}
                                        </p>
                                        <p className="text-gray-500 font-mono text-xs">{p.period}</p>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Benefits recap */}
                        <div className="space-y-2 mb-6 text-xs font-mono text-gray-400">
                            {[
                                { icon: '🏷️', text: '15% automatic discount on all purchases' },
                                { icon: '🪙', text: '500 GBS AI Studio credits on activation' },
                                { icon: '🏗️', text: 'Free CAD source files with PDF purchases' },
                            ].map(b => (
                                <div key={b.icon} className="flex items-center gap-2">
                                    <span>{b.icon}</span>
                                    <span>{b.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex items-baseline justify-between mb-6 px-4 py-3 rounded-lg bg-slate-900 border border-slate-800">
                            <span className="text-gray-400 font-mono text-sm">Total due today</span>
                            <span className="text-[#00f2ff] font-black font-mono text-2xl">
                                ₦{selected.price.toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={() => {
                                setShowModal(false)
                                handleSubscribe()
                            }}
                            className="w-full bg-[#00f2ff] hover:bg-white text-black font-black font-mono py-4 transition-all uppercase tracking-widest text-sm hover:shadow-[0_0_25px_rgba(0,242,255,0.5)]"
                        >
                            Pay ₦{selected.price.toLocaleString()} {selected.label === 'Monthly' ? '/ mo' : '/ yr'} →
                        </button>

                        <p className="text-center text-gray-600 font-mono text-[10px] mt-3">
                            Secured by Paystack · One-time payment
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
