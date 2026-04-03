'use client'

import { useState } from 'react'

interface PriceConfig {
    render: number
    dwg: number
    pdf: number
    elec: number
    mech: number
    struct: number
}

interface DesignConfiguratorProps {
    prices: PriceConfig
    isSubscriber?: boolean
    availableFiles?: string[]
    urls?: { dwg?: string; pdf?: string; elec?: string; mech?: string; struct?: string }
    onItemsChange: (items: string[]) => void
}

export default function DesignConfigurator({ prices, isSubscriber, urls = {}, onItemsChange }: DesignConfiguratorProps) {
    const [selected, setSelected] = useState<Record<string, boolean>>({
        'render': true, // Default checked
        'dwg': false,
        'pdf': false,
        'elec': false,
        'mech': false,
        'struct': false
    })

    const hasPdf = selected['pdf']

    const items = [
        { id: 'render', label: '3D Renderings (High Res)', price: prices.render, available: true },
        { id: 'pdf', label: 'Complete Design PDF', price: prices.pdf, available: !!urls.pdf },
        { id: 'dwg', label: 'Source CAD Files (DWG/RVT)', price: prices.dwg, available: !!urls.dwg },
        { id: 'elec', label: 'Electrical Drawings', price: prices.elec, available: !!urls.elec },
        { id: 'mech', label: 'Mechanical Drawings', price: prices.mech, available: !!urls.mech },
        { id: 'struct', label: 'Structural Engineering', price: prices.struct, available: !!urls.struct },
    ]

    const handleToggle = (id: string) => {
        const item = items.find(i => i.id === id)
        if (!item || !item.available) return

        const newState = { ...selected, [id]: !selected[id] }
        setSelected(newState)

        const selectedItems: string[] = []
        items.forEach(i => {
            if (newState[i.id] && i.available) {
                selectedItems.push(i.label)
            }
        })

        onItemsChange(selectedItems)
    }

    return (
        <div className="space-y-4 bg-black/40 border border-[#00f2ff]/20 p-6 rounded-xl">
            <h3 className="text-[#00f2ff] font-mono text-lg mb-4 uppercase flex items-center gap-2">
                <span className="text-xl">🛠️</span> Configure Your Package
            </h3>

            <div className="space-y-3">
                {items.map((item) => {
                    const isSelected = selected[item.id]
                    const isDWG = item.id === 'dwg'
                    const showFreeDWG = isDWG && isSubscriber && hasPdf
                    
                    return (
                        <div
                            key={item.id}
                            onClick={() => handleToggle(item.id)}
                            className={`
                                flex justify-between items-center p-4 rounded-lg border transition-all select-none
                                ${!item.available ? 'opacity-40 cursor-not-allowed bg-black/10 border-gray-900' : 'cursor-pointer'}
                                ${isSelected && item.available
                                    ? 'bg-[#00f2ff]/10 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.1)]'
                                    : (!item.available ? '' : 'bg-black/20 border-gray-800 hover:border-gray-600')}
                            `}
                        >
                            <div className="flex items-center space-x-3">
                                <div className={`
                                    w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                    ${isSelected && item.available ? 'border-[#00f2ff] bg-[#00f2ff]' : 'border-gray-600'}
                                `}>
                                    {isSelected && item.available && <span className="text-black text-xs font-bold">✓</span>}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`font-mono ${isSelected && item.available ? 'text-white' : 'text-gray-400'}`}>
                                        {item.label}
                                    </span>
                                    {!item.available && (
                                        <span className="text-[10px] text-red-500 font-mono uppercase">Not Uploaded</span>
                                    )}
                                </div>
                            </div>
                            {showFreeDWG ? (
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-500 line-through">₦{item.price.toLocaleString()}</span>
                                    <span className="font-mono text-[#00f2ff] font-bold">FREE</span>
                                </div>
                            ) : (
                                <span className={`font-mono font-bold ${!item.available ? 'text-gray-600' : 'text-[#00f2ff]'}`}>
                                    ₦{item.price.toLocaleString()}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">
                Select the components you need for your project.
            </p>
        </div>
    )
}
