'use client'

import { useEffect, useState } from 'react'

interface DiscountBannerProps {
    label: string
    percentageMin: number
    percentageMax: number
    expiresAt: string | null
}

function useCountdown(expiresAt: string | null) {
    const getTimeLeft = () => {
        if (!expiresAt) return null
        const diff = new Date(expiresAt).getTime() - Date.now()
        if (diff <= 0) return null
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    const [timeLeft, setTimeLeft] = useState<string | null>(getTimeLeft)

    useEffect(() => {
        if (!expiresAt) return
        const interval = setInterval(() => {
            const t = getTimeLeft()
            setTimeLeft(t)
            if (!t) clearInterval(interval)
        }, 1000)
        return () => clearInterval(interval)
    }, [expiresAt])

    return timeLeft
}

export default function DiscountBanner({ label, percentageMin, percentageMax, expiresAt }: DiscountBannerProps) {
    const timeLeft = useCountdown(expiresAt)

    // If timed and expired on client, hide
    if (expiresAt && !timeLeft) return null

    const rangeLabel = percentageMin === percentageMax
        ? `${percentageMax}% OFF`
        : `UP TO ${percentageMax}% OFF`

    return (
        <div className="w-full bg-gradient-to-r from-brand-navy via-brand-teal/80 to-brand-navy border-b border-brand-teal/20 py-2.5 px-4 flex items-center justify-center gap-3 text-sm font-sans relative overflow-hidden z-[60] text-white">
            {/* Animated shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-teal/15 to-transparent animate-[shimmer_2.5s_infinite] pointer-events-none" />

            <span className="relative flex items-center gap-2">
                <span className="text-brand-teal animate-pulse text-base">🏷️</span>
                <span className="font-bold uppercase tracking-wider">{label}</span>
                <span className="text-white/60">—</span>
                <span className="bg-brand-teal text-white font-extrabold px-2.5 py-0.5 rounded text-xs tracking-wider uppercase shadow-sm">
                    Massive Discounts • {rangeLabel}
                </span>
                <span className="text-white/80 text-xs">on select designs</span>
            </span>

            {expiresAt && timeLeft && (
                <span className="relative flex items-center gap-1.5 ml-2 border border-brand-teal/30 bg-black/40 rounded px-2.5 py-0.5">
                    <svg className="w-3 h-3 text-brand-teal shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-brand-teal font-extrabold tabular-nums text-xs">{timeLeft}</span>
                </span>
            )}
        </div>
    )
}
