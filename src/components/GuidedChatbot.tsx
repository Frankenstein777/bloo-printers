'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// ──────────────────────────────────────────
// Context: extra options injected based on current page
// ──────────────────────────────────────────
function getPageContext(pathname: string): { hint?: string; extraOptions?: Option[] } {
    if (pathname.startsWith('/browse')) {
        return {
            hint: "🔍 You're browsing the **catalog**.",
            extraOptions: [
                { label: '🗂 How do I filter designs?', next: 'filters' },
                { label: '❤️ How do likes & saves work?', next: 'social' },
            ]
        }
    }
    if (pathname.startsWith('/designs/')) {
        return {
            hint: "📐 You're viewing a **design detail page**.",
            extraOptions: [
                { label: '🧭 What is the Site Visualizer?', next: 'visualizer' },
                { label: '💳 How do I buy this design?', next: 'buying' },
            ]
        }
    }
    if (pathname.startsWith('/checkout')) {
        return {
            hint: "💳 You're on the **checkout page**.",
            extraOptions: [
                { label: '📦 What file types can I get?', next: 'filetypes' },
                { label: '🔒 Is payment secure?', next: 'security' },
            ]
        }
    }
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) {
        return {
            hint: "👤 You're on your **dashboard**.",
            extraOptions: [
                { label: '📂 Where are my purchased files?', next: 'downloads' },
            ]
        }
    }
    return {}
}

// ──────────────────────────────────────────
// CHATBOT SCRIPT
// ──────────────────────────────────────────
type Action = 'browse' | 'login' | 'contact' | 'whatsapp' | 'close' | 'dashboard'

interface Option {
    label: string
    next?: string
    action?: Action
}

interface Node {
    id: string
    messages: string[]
    options: Option[]
}

const SCRIPT: Node[] = [
    {
        id: 'start',
        messages: [
            "👋 Hello! Welcome to **Ocean of Blueprints**.",
            "I'm Bloo — your virtual guide. What can I help you with today?"
        ],
        options: [
            { label: '🏠 Browse Designs', next: 'browse' },
            { label: '💳 How does buying work?', next: 'buying' },
            { label: '📦 What file types do you offer?', next: 'filetypes' },
            { label: '📞 Contact Support', next: 'contact' },
            { label: '🔐 Login / Sign Up', action: 'login' },
        ]
    },
    {
        id: 'browse',
        messages: [
            "Our catalog has residential designs across all styles — Modern, Traditional, Villa, Bungalow and more.",
            "You can filter by bedrooms, plot size, amenities, and file types."
        ],
        options: [
            { label: '🔍 Go to Catalog', action: 'browse' },
            { label: '💳 How do I buy?', next: 'buying' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'filters',
        messages: [
            "On the Browse page, use the **Filter Sidebar** on the left to narrow down by:",
            "🛏 Number of bedrooms\n📐 Plot size\n⭐ Amenities (Pool, Cinema, BQ, etc.)\n📁 File types available (DWG, PDF, etc.)"
        ],
        options: [
            { label: '❤️ What about likes & saves?', next: 'social' },
            { label: '🔍 Go to Catalog', action: 'browse' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'social',
        messages: [
            "On every design card you can:",
            "❤️ **Like** — Let us know what you love\n🔖 **Save** — Bookmark to your Collections\n💬 **Comment** — Share thoughts with the community"
        ],
        options: [
            { label: '💳 How do I buy?', next: 'buying' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'visualizer',
        messages: [
            "🧭 The **Site Visualizer** lets you check if a design fits your actual plot of land.",
            "1️⃣ Open any design.\n2️⃣ Scroll to the **Visualizer** section.\n3️⃣ Enter your plot dimensions (Width × Depth).\n4️⃣ Rotate, scale and position the building footprint on your plot.\n5️⃣ See exactly what fits!"
        ],
        options: [
            { label: '💳 How do I buy this design?', next: 'buying' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'buying',
        messages: [
            "Buying is simple and secure:",
            "1️⃣ Browse the catalog and pick a design.\n2️⃣ On the detail page, click **Get Access**.\n3️⃣ Choose which files you need (PDF, DWG, etc.).\n4️⃣ Pay securely via Paystack — card or bank transfer.\n5️⃣ Files are unlocked instantly upon payment! ✅"
        ],
        options: [
            { label: '📦 What files can I get?', next: 'filetypes' },
            { label: '💰 What are the prices?', next: 'pricing' },
            { label: '🔒 Is payment secure?', next: 'security' },
            { label: '🔍 Browse Catalog', action: 'browse' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'security',
        messages: [
            "🔒 Yes, 100%! All payments are processed by **Paystack** — Nigeria's most trusted payment gateway.",
            "We do NOT store your card details. Your transaction is verified server-side before anything is unlocked."
        ],
        options: [
            { label: '💳 How to buy', next: 'buying' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'filetypes',
        messages: [
            "We offer modular file packages — buy only what you need:",
            "🖼 **3D Renders** — High-res visualization images\n📄 **PDF Plans** — Printable floor plans & elevations\n📐 **DWG/CAD Files** — Editable AutoCAD source files\n⚡ **Electrical Drawings** — Full electrical layout\n🔩 **Mechanical Drawings** — HVAC & plumbing\n🏗 **Structural Plans** — Structural engineer drawings"
        ],
        options: [
            { label: '💳 How do I buy?', next: 'buying' },
            { label: '💰 Pricing info', next: 'pricing' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'pricing',
        messages: [
            "Each design has individual prices per file type.",
            "Prices vary per design and are set by our architects. You'll see the full breakdown at checkout — no hidden fees!"
        ],
        options: [
            { label: '🔍 Browse and See Prices', action: 'browse' },
            { label: '💳 How to buy', next: 'buying' },
            { label: '📞 Ask a human', next: 'contact' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'downloads',
        messages: [
            "After a successful purchase, your files appear in your **Dashboard** under the Downloads section.",
            "You can re-download at any time — no expiry!"
        ],
        options: [
            { label: '🔍 Browse more designs', action: 'browse' },
            { label: '📞 Need help?', next: 'contact' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
    {
        id: 'contact',
        messages: [
            "We'd love to hear from you! 💬",
            "You can reach us on **WhatsApp** for the fastest response, or scroll to the Contact section on the homepage."
        ],
        options: [
            { label: '💬 Chat on WhatsApp', action: 'whatsapp' },
            { label: '📧 Go to Contact Page', action: 'contact' },
            { label: '🏠 Back to Start', next: 'start' },
        ]
    },
]

const NODE_MAP = Object.fromEntries(SCRIPT.map(n => [n.id, n]))

// ──────────────────────────────────────────
// Bot Icon
// ──────────────────────────────────────────
function BotIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <rect x="6" y="12" width="24" height="18" rx="4" fill="currentColor" opacity="0.9" />
            <rect x="11" y="17" width="4" height="4" rx="2" fill="#001f2b" />
            <rect x="21" y="17" width="4" height="4" rx="2" fill="#001f2b" />
            <rect x="12" y="18" width="2" height="2" rx="1" fill="#00f2ff" opacity="0.8" />
            <rect x="22" y="18" width="2" height="2" rx="1" fill="#00f2ff" opacity="0.8" />
            <rect x="13" y="24" width="10" height="2" rx="1" fill="#001f2b" opacity="0.6" />
            <rect x="17" y="6" width="2" height="6" rx="1" fill="currentColor" opacity="0.7" />
            <circle cx="18" cy="5" r="2.5" fill="currentColor" />
            <rect x="3" y="16" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.6" />
            <rect x="30" y="16" width="3" height="6" rx="1.5" fill="currentColor" opacity="0.6" />
        </svg>
    )
}

// ──────────────────────────────────────────
type Message = { role: 'bot' | 'user', text: string }
const JINGLE_INTERVAL_MS = 20000

export default function GuidedChatbot() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const [nodeId, setNodeId] = useState('start')
    const [messages, setMessages] = useState<Message[]>([])
    const [optionsVisible, setOptionsVisible] = useState(false)
    const [jingle, setJingle] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const jingleTimer = useRef<ReturnType<typeof setInterval> | null>(null)
    const { hint, extraOptions = [] } = getPageContext(pathname)

    // Init with greeting + page hint
    useEffect(() => {
        const node = NODE_MAP['start']
        const initialMessages: Message[] = node.messages.map(t => ({ role: 'bot', text: t }))
        if (hint) initialMessages.push({ role: 'bot', text: hint })
        setMessages(initialMessages)
        setTimeout(() => setOptionsVisible(true), 500)
    }, [hint])

    useEffect(() => {
        if (open) {
            if (jingleTimer.current) clearInterval(jingleTimer.current)
            setJingle(false)
        } else {
            jingleTimer.current = setInterval(() => {
                setJingle(true)
                setTimeout(() => setJingle(false), 1000)
            }, JINGLE_INTERVAL_MS)
        }
        return () => { if (jingleTimer.current) clearInterval(jingleTimer.current) }
    }, [open])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const goToNode = useCallback((nextId: string) => {
        const node = NODE_MAP[nextId]
        if (!node) return
        setNodeId(nextId)
        setOptionsVisible(false)
        setMessages(prev => [...prev, ...node.messages.map(t => ({ role: 'bot' as const, text: t }))])
        setTimeout(() => setOptionsVisible(true), 400)
    }, [])

    const handleOption = useCallback((opt: Option) => {
        setMessages(prev => [...prev, { role: 'user', text: opt.label }])
        setOptionsVisible(false)

        if (opt.action) {
            switch (opt.action) {
                case 'browse': window.location.href = '/browse'; return
                case 'login': window.location.href = '/login'; return
                case 'dashboard': window.location.href = '/dashboard'; return
                case 'contact': window.location.href = '/#contact'; return
                case 'whatsapp':
                    window.open(`https://wa.me/2347068095681?text=${encodeURIComponent("Hello, I'm reaching out from Ocean of Blueprints and need help.")}`, '_blank')
                    goToNode('start'); return
                case 'close': setOpen(false); goToNode('start'); return
            }
        }
        if (opt.next) setTimeout(() => goToNode(opt.next!), 300)
    }, [goToNode])

    // Merge page-specific extra options into current node's options
    const currentNode = NODE_MAP[nodeId]
    const currentOptions = nodeId === 'start'
        ? [...currentNode.options, ...extraOptions]
        : currentNode.options

    return (
        <>
            <style>{`
                @keyframes bloo-jingle {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    15% { transform: rotate(-15deg) scale(1.15); }
                    30% { transform: rotate(15deg) scale(1.15); }
                    45% { transform: rotate(-10deg) scale(1.1); }
                    60% { transform: rotate(10deg) scale(1.1); }
                    75% { transform: rotate(-5deg) scale(1.05); }
                }
                .bloo-jingle { animation: bloo-jingle 0.9s ease-in-out; }
                @keyframes bloo-pulse-ring {
                    0% { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
                .bloo-ring {
                    position: absolute; inset: 0; border-radius: 9999px;
                    background: rgba(0, 242, 255, 0.4);
                    animation: bloo-pulse-ring 1s ease-out;
                }
            `}</style>

            {/* Chatbot button — positioned above the audio control (bottom-24) */}
            <div className="fixed bottom-24 right-6 z-[200]">
                {jingle && <span className="bloo-ring" />}
                <button
                    onClick={() => { setOpen(o => !o); setJingle(false) }}
                    aria-label="Open Bloo Chat"
                    className={`relative w-14 h-14 rounded-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black shadow-[0_0_25px_rgba(0,242,255,0.5)] flex items-center justify-center hover:scale-110 transition-transform ${jingle ? 'bloo-jingle' : ''}`}
                >
                    {open ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <BotIcon className="w-8 h-8" />
                    )}
                </button>
                {!open && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-500 border-2 border-neutral-950 animate-pulse" />
                )}
            </div>

            {/* Chat Widget — opens above button */}
            {open && (
                <div className="fixed bottom-40 right-6 z-[199] w-[350px] max-h-[500px] flex flex-col rounded-2xl overflow-hidden border border-[#00f2ff]/30 shadow-[0_0_40px_rgba(0,242,255,0.15)] bg-neutral-950">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#00a3ad]/20 border-b border-[#00f2ff]/20">
                        <div className="w-9 h-9 rounded-full bg-[#00f2ff] flex items-center justify-center text-black">
                            <BotIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm font-mono">BLOO</p>
                            <p className="text-[10px] text-[#00f2ff]/70 font-mono uppercase tracking-widest">Virtual Guide • Online</p>
                        </div>
                        <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm font-mono leading-relaxed whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-[#00f2ff]/20 text-[#00f2ff] rounded-br-none'
                                        : 'bg-white/5 text-gray-200 rounded-bl-none border border-white/10'}`}
                                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                                />
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Options */}
                    {optionsVisible && (
                        <div className="px-4 py-3 space-y-2 border-t border-white/5 bg-black/20">
                            {currentOptions.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleOption(opt)}
                                    className="w-full text-left px-3 py-2 text-xs font-mono text-gray-200 bg-white/5 hover:bg-[#00f2ff]/15 hover:text-[#00f2ff] border border-white/10 hover:border-[#00f2ff]/50 rounded-lg transition-all duration-150 active:scale-95"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    )
}
