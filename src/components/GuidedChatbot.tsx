'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'

// ──────────────────────────────────────────
// Context: extra options injected based on current page
// ──────────────────────────────────────────
function getPageContext(pathname: string): { hint?: string; extraOptions?: Option[] } {
    if (pathname.startsWith('/catalog')) {
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
            "👋 Hello! Welcome to **Octoplans**.",
            "I'm Octo — your virtual guide. What can I help you with today?"
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
            "🧭 The **Plot Fit Checker** lets you see if a design fits your actual land.",
            "1️⃣ Open any design detail page.\n2️⃣ Click the **'Check Plot Fit'** button (blue/indigo button on the right side).\n3️⃣ A surveyor tool opens — enter your plot boundary as survey lines (bearing + distance, just like a survey document).\n4️⃣ The system traces your land shape from those survey readings.\n5️⃣ The building footprint is overlaid on your plot — drag and rotate it to find the best position!"
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
// Octo Logo Icon (from public/logo.svg)
// ──────────────────────────────────────────
function OctoIcon({ className }: { className?: string }) {
    return (
        <svg
            version="1.0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 526 550"
            preserveAspectRatio="xMidYMid meet"
            className={className}
            fill="currentColor"
        >
            <g transform="translate(0,550) scale(0.1,-0.1)">
                <path d="M2562 4286 c-135 -72 -213 -129 -292 -213 -79 -84 -123 -156 -166 -271 -82 -220 -85 -420 -8 -562 14 -25 52 -82 85 -126 82 -107 107 -160 139 -289 l27 -110 18 40 c35 82 46 121 46 171 1 75 -7 105 -69 244 -78 178 -93 225 -99 316 -10 147 35 262 147 374 69 69 240 196 277 206 56 15 344 -227 398 -335 77 -153 67 -294 -36 -523 -96 -210 -107 -273 -70 -380 19 -54 49 -118 51 -108 1 3 10 45 20 93 24 113 61 191 145 302 122 162 156 274 136 442 -30 243 -133 450 -290 580 -91 75 -312 204 -349 203 -4 0 -53 -25 -110 -54z" />
                <path d="M1984 3228 c16 -58 18 -148 6 -240 -12 -86 -11 -106 1 -141 19 -55 81 -102 155 -117 71 -15 93 0 35 23 -56 23 -118 81 -127 120 -4 18 -8 95 -8 172 -1 132 -2 142 -25 173 -29 37 -46 42 -37 10z" />
                <path d="M3334 3214 l-29 -38 3 -139 c3 -192 -16 -231 -138 -286 -50 -22 -38 -36 23 -26 58 10 108 37 145 80 28 31 32 43 32 91 0 30 -5 87 -11 126 -8 54 -8 90 1 146 6 40 10 76 7 78 -3 3 -18 -12 -33 -32z" />
                <path d="M705 3095 c-93 -18 -172 -46 -264 -96 -100 -53 -265 -163 -252 -167 5 -2 67 8 138 22 204 40 297 49 438 43 202 -7 306 -46 585 -220 214 -134 302 -167 445 -167 124 0 229 39 325 122 l35 30 -55 -8 c-94 -13 -200 -6 -275 17 -88 27 -185 75 -394 197 -262 151 -396 209 -541 232 -80 12 -96 12 -185 -5z" />
                <path d="M4382 3080 c-109 -29 -238 -89 -443 -206 -239 -137 -319 -177 -409 -205 -79 -24 -196 -31 -280 -16 l-45 8 27 -28 c73 -76 198 -123 328 -123 138 0 245 40 455 172 323 203 492 245 805 204 97 -13 290 -49 334 -62 36 -12 5 16 -94 81 -264 174 -474 228 -678 175z" />
                <path d="M2090 2995 c0 -36 6 -80 14 -98 21 -51 80 -95 164 -121 28 -9 28 2 2 88 -12 38 -34 82 -52 102 -28 32 -109 94 -122 94 -3 0 -6 -29 -6 -65z" />
                <path d="M3203 3025 c-29 -19 -64 -52 -78 -73 -26 -38 -71 -170 -61 -179 3 -3 31 5 62 17 77 32 119 76 133 140 13 59 15 130 3 130 -4 0 -31 -16 -59 -35z" />
                <path d="M2555 2665 c-12 -103 -45 -253 -69 -319 -29 -77 -56 -121 -155 -251 -141 -185 -150 -230 -101 -490 46 -241 34 -331 -66 -509 -24 -44 -42 -81 -40 -84 9 -8 148 73 194 113 98 85 111 175 66 444 -45 272 -30 347 105 516 39 50 86 119 103 154 30 59 32 71 31 160 -1 89 -32 273 -53 311 -5 9 -11 -7 -15 -45z" />
                <path d="M2759 2628 c-18 -71 -23 -122 -24 -218 0 -151 8 -172 114 -305 39 -49 86 -119 104 -155 44 -89 48 -181 13 -390 -45 -265 -32 -349 68 -437 45 -39 183 -119 192 -111 2 3 -16 39 -39 81 -99 173 -112 272 -68 500 52 269 44 312 -99 502 -49 66 -103 145 -119 175 -41 76 -77 208 -92 331 -7 57 -16 108 -20 112 -4 5 -17 -33 -30 -85z" />
                <path d="M2202 2597 c-122 -114 -240 -195 -354 -243 -75 -32 -104 -40 -312 -94 -316 -81 -386 -144 -386 -349 0 -47 9 -140 20 -206 39 -240 36 -312 -14 -436 -14 -35 -24 -65 -22 -67 9 -8 108 50 140 82 19 20 42 57 51 87 19 55 18 110 -3 386 -20 248 22 317 228 379 221 66 312 100 402 146 120 61 221 151 266 237 34 62 65 141 56 141 -3 0 -35 -28 -72 -63z" />
                <path d="M3084 2635 c17 -74 70 -161 140 -230 109 -107 263 -182 527 -254 268 -74 305 -137 275 -463 -20 -213 -20 -251 -1 -314 20 -67 62 -114 136 -154 70 -37 69 -42 23 75 -23 60 -27 85 -27 170 0 55 10 156 22 225 11 69 21 166 21 216 0 214 -65 269 -426 363 -105 27 -218 61 -252 75 -119 48 -249 137 -376 256 -65 61 -69 63 -62 35z" />
                <path d="M2943 2535 c3 -84 7 -110 31 -162 36 -79 84 -124 258 -241 162 -110 240 -188 263 -264 22 -74 19 -176 -10 -328 -47 -252 -28 -336 97 -416 42 -27 180 -84 203 -84 7 0 -10 24 -39 53 -104 105 -125 204 -90 440 25 172 23 315 -5 390 -43 110 -152 203 -446 383 -82 50 -161 117 -197 167 -11 16 -31 59 -44 95 l-24 67 3 -100z" />
                <path d="M2396 2590 c-24 -102 -103 -193 -243 -279 -369 -228 -448 -308 -472 -477 -10 -68 -2 -200 19 -329 5 -33 10 -100 10 -150 0 -78 -4 -98 -29 -151 -16 -35 -51 -82 -81 -112 -29 -29 -48 -52 -42 -52 7 0 40 11 75 24 252 95 289 172 232 482 -60 323 -27 397 264 593 222 149 271 214 279 366 5 97 0 137 -12 85z" />
            </g>
        </svg>
    )
}

// ──────────────────────────────────────────
type Message = { role: 'bot' | 'user', text: string }

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
            if (jingleTimer.current) clearTimeout(jingleTimer.current)
            setJingle(false)
        } else {
            const scheduleJingle = () => {
                const delay = 1000 + Math.random() * 3000 // 1 to 4 seconds
                jingleTimer.current = setTimeout(() => {
                    setJingle(true)
                    setTimeout(() => {
                        setJingle(false)
                        scheduleJingle()
                    }, 1000)
                }, delay)
            }
            scheduleJingle()
        }
        return () => { if (jingleTimer.current) clearTimeout(jingleTimer.current) }
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
                case 'browse': window.location.href = '/catalog'; return
                case 'login': window.location.href = '/login'; return
                case 'dashboard': window.location.href = '/dashboard'; return
                case 'contact': window.location.href = '/#contact'; return
                case 'whatsapp':
                    window.open(`https://wa.me/2347068095681?text=${encodeURIComponent("Hello! I'm reaching out from Octoplans and need help.")}`, '_blank')
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
                    0%, 100% { transform: rotate(0deg) scale(1); filter: hue-rotate(0deg); }
                    15% { transform: rotate(-15deg) scale(1.15); filter: hue-rotate(90deg); }
                    30% { transform: rotate(15deg) scale(1.15); filter: hue-rotate(-90deg); }
                    45% { transform: rotate(-10deg) scale(1.1); filter: hue-rotate(45deg); }
                    60% { transform: rotate(10deg) scale(1.1); filter: hue-rotate(-45deg); }
                    75% { transform: rotate(-5deg) scale(1.05); filter: hue-rotate(20deg); }
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
                    aria-label="Open Octo Chat"
                    className={`relative w-14 h-14 rounded-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black shadow-[0_0_25px_rgba(0,242,255,0.5)] flex items-center justify-center hover:scale-110 transition-transform ${jingle ? 'bloo-jingle' : ''}`}
                >
                    {open ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <OctoIcon className="w-9 h-9" />
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
                            <OctoIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm font-mono">OCTO</p>
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
