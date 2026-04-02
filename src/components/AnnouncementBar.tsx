'use client'

import { useEffect, useState } from 'react'

interface Announcement {
    id: string
    title: string
    body: string
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

function AnnouncementItem({
    announcement,
    isAdmin,
    onRemove,
}: {
    announcement: Announcement
    isAdmin: boolean
    onRemove: (id: string) => void
}) {
    const timeLeft = useCountdown(announcement.expiresAt)
    const [dismissed, setDismissed] = useState(false)

    // Client-side expiry: hide if timed out
    if (announcement.expiresAt && !timeLeft) return null
    if (dismissed) return null

    return (
        <div className="w-full bg-gradient-to-r from-[#1a0533] via-[#2d0a5e] to-[#1a0533] border-b border-purple-500/30 py-2 px-4 flex items-center justify-between gap-3 text-sm font-mono relative overflow-hidden z-[58]">
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/8 to-transparent animate-[shimmer_3s_infinite] pointer-events-none" />

            <span className="relative flex items-center gap-2 flex-1 min-w-0">
                <span className="text-purple-300 text-base shrink-0">📢</span>
                <span className="font-bold text-purple-200 uppercase tracking-widest shrink-0">{announcement.title}</span>
                <span className="text-white/50 mx-1 shrink-0">—</span>
                <span className="text-white/80 text-xs truncate">{announcement.body}</span>
            </span>

            <span className="relative flex items-center gap-2 shrink-0">
                {announcement.expiresAt && timeLeft && (
                    <span className="flex items-center gap-1.5 border border-purple-400/50 bg-black/30 rounded px-2 py-0.5">
                        <svg className="w-3 h-3 text-purple-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-purple-300 font-black tabular-nums text-xs">{timeLeft}</span>
                    </span>
                )}
                {isAdmin ? (
                    <form action="/api/announcements/remove" onSubmit={async (e) => {
                        e.preventDefault()
                        onRemove(announcement.id)
                    }}>
                        <button
                            type="submit"
                            title="Remove announcement"
                            className="w-5 h-5 rounded-full bg-red-900/60 hover:bg-red-600 text-red-300 hover:text-white flex items-center justify-center text-xs transition-colors font-bold"
                        >
                            ×
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={() => setDismissed(true)}
                        title="Dismiss"
                        className="w-5 h-5 rounded-full bg-white/10 hover:bg-white/20 text-white/50 hover:text-white flex items-center justify-center text-xs transition-colors"
                    >
                        ×
                    </button>
                )}
            </span>
        </div>
    )
}

interface AnnouncementBarProps {
    announcements: Announcement[]
    isAdmin: boolean
}

export default function AnnouncementBar({ announcements, isAdmin }: AnnouncementBarProps) {
    const [items, setItems] = useState(announcements)

    const handleRemove = async (id: string) => {
        // Optimistic: hide immediately
        setItems(prev => prev.filter(a => a.id !== id))
        // Call server action via fetch (since this is a client component)
        await fetch('/api/announcements/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        })
    }

    if (items.length === 0) return null

    return (
        <div className="w-full">
            {items.map(a => (
                <AnnouncementItem
                    key={a.id}
                    announcement={a}
                    isAdmin={isAdmin}
                    onRemove={handleRemove}
                />
            ))}
        </div>
    )
}
