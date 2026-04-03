'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import PaystackCheckout from './PaystackCheckout'
import DesignConfigurator from './DesignConfigurator'

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
    isSubscriber?: boolean
    globalDiscountPct?: number
}

// Maps the item labels returned by DesignConfigurator → their price
const LABEL_PRICE_MAP: Record<string, string> = {
    '3D Renderings (High Res)': 'priceRender',
    'Full PDF Plans': 'pricePdf',
    'AutoCAD DWG Files': 'priceDwg',
    'Electrical Drawings': 'priceElec',
    'Mechanical Drawings': 'priceMech',
    'Structural Plans': 'priceStruct',
}

export default function CheckoutClient({ design, prices, userEmail, isSubscriber, globalDiscountPct = 0 }: CheckoutClientProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>(['3D Renderings (High Res)'])

    // Wait, DesignConfigurator handles total internally right now. Let's fix that.
    // We should compute total here instead, since we need to apply subscriber discounts.
    // Actually, DesignConfigurator also needs to show the free DWG stuff.
    // I will refactor DesignConfigurator to just report selected items, or we compute total here.
    
    // Instead of state for total, we compute it below:
    let baseTotal = 0;
    
    // Check if we have PDF selected and user is subscriber, to give free DWG
    const hasPdf = selectedItems.includes('Complete Design PDF')
    
    const invoiceItems = selectedItems.map(label => {
        let price = prices[LABEL_PRICE_MAP[label]?.replace('price', '').toLowerCase() as keyof typeof prices] ?? 0
        
        // Subscriber benefit: CAD DWG is free if PDF is also being purchased
        if (isSubscriber && label === 'Source CAD Files (DWG/RVT)' && hasPdf) {
            price = 0
        } else if (globalDiscountPct > 0 && design.tier !== 'FREE') {
            price = price - (price * (globalDiscountPct / 100))
        }
        
        baseTotal += price
        return {
            description: label,
            quantity: 1,
            price
        }
    })

    const subscriberDiscountAmount = isSubscriber ? baseTotal * 0.15 : 0
    let finalTotal = baseTotal - subscriberDiscountAmount
    if (finalTotal < 0) finalTotal = 0
    if (design.tier === 'FREE') finalTotal = 0 // override for free tier

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
                        isSubscriber={isSubscriber}
                        availableFiles={design.fileTypes || []}
                        urls={{
                            dwg: design.dwgUrl,
                            pdf: design.pdfUrl,
                            elec: design.electricalUrl,
                            mech: design.mechanicalUrl,
                            struct: design.structuralUrl
                        }}
                        onItemsChange={(items) => {
                            setSelectedItems(items)
                        }}
                    />
                </div>

                {/* Payment Column */}
                <div className="bg-black/40 backdrop-blur-sm p-8 rounded-2xl border border-[#00f2ff]/20 shadow-2xl sticky top-24">
                    <h1 className="text-3xl font-black mb-2 tracking-tighter uppercase text-white">Checkout</h1>
                    <p className="text-gray-400 text-sm mb-8">Secure Transaction • Instant Digital Delivery</p>

                    {/* Itemized breakdown */}
                    <div className="space-y-2 mb-6 border-b border-gray-700 pb-6">
                        {invoiceItems.length > 0 ? (
                            invoiceItems.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span className="text-gray-300">{item.description}</span>
                                    <span className="text-white font-bold">₦{item.price.toLocaleString()}</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-sm">No items selected yet.</p>
                        )}
                    </div>

                    {isSubscriber && baseTotal > 0 && (
                        <div className="flex justify-between items-center text-sm font-bold text-[#00f2ff] mb-2 px-4 py-2 bg-[#00f2ff]/10 rounded border border-[#00f2ff]/20">
                            <span>Subscriber Discount (15%)</span>
                            <span>-₦{subscriberDiscountAmount.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center text-3xl font-bold mb-10 mt-4">
                        <span>Total</span>
                        <span className="text-[#00f2ff]">₦{finalTotal.toLocaleString()}</span>
                    </div>

                    {finalTotal > 0 || (design.tier === 'FREE' && invoiceItems.length > 0) ? (
                        <PaystackCheckout
                            email={userEmail || 'guest@example.com'}
                            amount={finalTotal * 100}
                            designId={design.id}
                            designTitle={design.title}
                            invoiceItems={invoiceItems}
                            metadata={{
                                items: selectedItems.join(', '),
                                custom_fields: [
                                    {
                                        display_name: "Selected Items",
                                        variable_name: "selected_items",
                                        value: selectedItems.join(', ')
                                    }
                                ]
                            }}
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

