'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType, duration?: number) => void
}

// ─── Context ─────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue | null>(null)

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
    return ctx
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
}

const styles: Record<ToastType, string> = {
    success: 'border-green-500/60 bg-green-900/30 text-green-300 shadow-[0_0_18px_rgba(34,197,94,0.25)]',
    error: 'border-red-500/60 bg-red-900/30 text-red-300 shadow-[0_0_18px_rgba(239,68,68,0.25)]',
    warning: 'border-yellow-500/60 bg-yellow-900/30 text-yellow-300 shadow-[0_0_18px_rgba(234,179,8,0.25)]',
    info: 'border-[#00f2ff]/50 bg-[#00f2ff]/10 text-[#00f2ff] shadow-[0_0_18px_rgba(0,242,255,0.25)]',
}

const iconStyles: Record<ToastType, string> = {
    success: 'bg-green-500/20 text-green-400',
    error: 'bg-red-500/20 text-red-400',
    warning: 'bg-yellow-500/20 text-yellow-400',
    info: 'bg-[#00f2ff]/20 text-[#00f2ff]',
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const counter = useRef(0)

    const toast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
        const id = `toast-${++counter.current}`
        setToasts(prev => [...prev, { id, message, type, duration }])
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, duration + 400) // +400ms for exit animation
    }, [])

    const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id))

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast Container — fixed top-right, stacking vertically */}
            <div
                className="fixed top-20 right-4 z-[99999] flex flex-col gap-3 pointer-events-none"
                aria-live="polite"
                aria-label="Notifications"
            >
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={`
                            pointer-events-auto
                            flex items-start gap-3
                            min-w-[260px] max-w-[360px]
                            px-4 py-3
                            border backdrop-blur-xl
                            font-mono text-sm
                            animate-in slide-in-from-right-4 fade-in duration-300
                            ${styles[t.type]}
                        `}
                    >
                        {/* Icon badge */}
                        <span className={`flex-none w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5 ${iconStyles[t.type]}`}>
                            {icons[t.type]}
                        </span>

                        {/* Message */}
                        <p className="flex-1 leading-snug">{t.message}</p>

                        {/* Dismiss */}
                        <button
                            onClick={() => dismiss(t.id)}
                            className="flex-none opacity-50 hover:opacity-100 transition-opacity text-xs mt-0.5 ml-1"
                            aria-label="Dismiss"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}
