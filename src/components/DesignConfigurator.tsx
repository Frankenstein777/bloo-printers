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
    onTotalChange: (total: number, items: string[]) => void
}

export default function DesignConfigurator({ prices, onTotalChange }: DesignConfiguratorProps) {
    const [selected, setSelected] = useState<Record<string, boolean>>({
        'render': true, // Default checked
        'dwg': false,
        'pdf': false,
        'elec': false,
        'mech': false,
        'struct': false
    })

    const items = [
        { id: 'render', label: '3D Renderings (High Res)', price: prices.render },
        { id: 'pdf', label: 'Complete Design PDF', price: prices.pdf },
        { id: 'dwg', label: 'Source CAD Files (DWG/RVT)', price: prices.dwg },
        { id: 'elec', label: 'Electrical Drawings', price: prices.elec },
        { id: 'mech', label: 'Mechanical Drawings', price: prices.mech },
        { id: 'struct', label: 'Structural Engineering', price: prices.struct },
    ]

    const handleToggle = (id: string) => {
        const newState = { ...selected, [id]: !selected[id] }
        setSelected(newState)

        // Calculate new total
        let newTotal = 0
        const selectedItems: string[] = []

        items.forEach(item => {
            if (newState[item.id]) {
                newTotal += item.price
                selectedItems.push(item.label)
            }
        })

        onTotalChange(newTotal, selectedItems)
    }

    return (
        <div className="space-y-4 bg-black/40 border border-[#00f2ff]/20 p-6 rounded-xl">
            <h3 className="text-[#00f2ff] font-mono text-lg mb-4 uppercase flex items-center gap-2">
                <span className="text-xl">🛠️</span> Configure Your Package
            </h3>

            <div className="space-y-3">
                {items.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleToggle(item.id)}
                        className={`
                            flex justify-between items-center p-4 rounded-lg cursor-pointer border transition-all select-none
                            ${selected[item.id]
                                ? 'bg-[#00f2ff]/10 border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.1)]'
                                : 'bg-black/20 border-gray-800 hover:border-gray-600'}
                        `}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`
                                w-5 h-5 rounded-full border flex items-center justify-center transition-colors
                                ${selected[item.id] ? 'border-[#00f2ff] bg-[#00f2ff]' : 'border-gray-600'}
                            `}>
                                {selected[item.id] && <span className="text-black text-xs font-bold">✓</span>}
                            </div>
                            <span className={`font-mono ${selected[item.id] ? 'text-white' : 'text-gray-400'}`}>
                                {item.label}
                            </span>
                        </div>
                        <span className="font-mono text-[#00f2ff] font-bold">
                            ₦{item.price.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            <p className="text-xs text-gray-500 text-center pt-2">
                Select the components you need for your project.
            </p>
        </div>
    )
}
