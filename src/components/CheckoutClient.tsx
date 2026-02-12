'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import DummyPaymentForm from './DummyPaymentForm'
import DesignConfigurator from './DesignConfigurator'
import { verifyPurchaseAction } from '@/app/checkout/actions'
import { generateInvoice } from '@/lib/invoice-client'
import { useRouter } from 'next/navigation'

interface CheckoutClientProps {
    design: any
    prices: {
        render: number
        dwg: number
        pdf: number
        elec: number
        mech: number
        struct: number
    }
    userEmail?: string | null
}

export default function CheckoutClient({ design, prices, userEmail }: CheckoutClientProps) {
    const router = useRouter()

    // Default: Renderings (10000) selected
    const [total, setTotal] = useState(prices.render)
    const [selectedItems, setSelectedItems] = useState<string[]>(['3D Renderings (High Res)'])

    const handleSuccess = async (cardholderName: string) => {
        const ref = 'OB-' + Date.now()

        // server verification (simulated for MVP dummy payment)
        try {
            const result = await verifyPurchaseAction(ref, design.id, total * 100, selectedItems) // Actions expects Kobo

            if (result.success) {
                // Map labels back to prices for the invoice
                const itemPriceMap: Record<string, number> = {
                    '3D Renderings (High Res)': prices.render,
                    'Complete Design PDF': prices.pdf,
                    'Source CAD Files (DWG/RVT)': prices.dwg,
                    'Electrical Drawings': prices.elec,
                    'Mechanical Drawings': prices.mech,
                    'Structural Engineering': prices.struct,
                }

                await generateInvoice({
                    id: ref,
                    date: new Date(),
                    user: {
                        email: userEmail || '',
                        name: cardholderName // Pass actual name
                    },
                    items: selectedItems.map(item => ({
                        description: item,
                        quantity: 1,
                        price: itemPriceMap[item] || 0 // Lookup price or default to 0
                    })),
                    total: total,
                    currency: 'NGN',
                    reference: ref
                })

                router.push(`/designs/${design.id}?unlocked=true`)
            } else {
                alert('Error: ' + (result.error || 'Unknown server error'))
            }
        } catch (e: any) {
            console.error("Client Catch:", e)
            alert('Client Error: ' + e.message)
        }
    }

    return (
        <div className="min-h-screen bg-neutral-900 text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-mono">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-start">

                {/* Visuals & Config */}
                <div className="space-y-8">
                    <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-[#00f2ff]/30 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
                        <Image
                            src={design.previewImages[0]}
                            alt={design.title}
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur px-4 py-2 rounded text-[#00f2ff] font-bold">
                            {design.title}
                        </div>
                    </div>

                    <DesignConfigurator
                        prices={prices}
                        onTotalChange={(newTotal, items) => {
                            setTotal(newTotal)
                            setSelectedItems(items)
                        }}
                    />
                </div>

                {/* Payment Column */}
                <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-[#00f2ff]/20 shadow-2xl sticky top-24">
                    <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase text-white">Checkout</h1>
                    <p className="text-gray-400 text-sm mb-8">Secure Transaction • Instant Digital Delivery</p>

                    <div className="space-y-4 mb-8 border-b border-gray-700 pb-8">
                        <div className="flex justify-between items-center text-lg">
                            <span className="text-gray-400">Selected Items</span>
                            <span className="font-bold text-right text-xs max-w-[200px]">{selectedItems.join(', ') || 'None'}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-3xl font-bold mb-10">
                        <span>Total</span>
                        <span className="text-[#00f2ff]">₦{total.toLocaleString()}</span>
                    </div>

                    {total > 0 ? (
                        <DummyPaymentForm
                            amount={total}
                            onSuccess={handleSuccess}
                        />
                    ) : (
                        <div className="text-center py-4 text-gray-500 border border-dashed border-gray-700 rounded">
                            Select at least one item to proceed.
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <Link href={`/designs/${design.id}`} className="text-sm text-gray-500 hover:text-white underline underline-offset-4">
                            Cancel and Return to Design
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
