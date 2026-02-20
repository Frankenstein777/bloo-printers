'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

// ──────────────────────────────────────────
// CHATBOT SCRIPT
// Each node: id, message[], options[]
//   option: { label, next, action? }
//   action: 'browse' | 'login' | 'contact' | 'whatsapp' | 'close'
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
        id: 'buying',
        messages: [
            "Buying is simple and secure:",
            "1️⃣ Browse the catalog and pick a design.\n2️⃣ On the detail page, click **Get Access**.\n3️⃣ Choose which files you need (PDF, DWG, etc.).\n4️⃣ Pay securely via Paystack — card or bank transfer.\n5️⃣ Files are unlocked instantly upon payment! ✅"
        ],
        options: [
            { label: '📦 What files can I get?', next: 'filetypes' },
            { label: '💰 What are the prices?', next: 'pricing' },
            { label: '🔍 Browse Catalog', action: 'browse' },
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
            "Prices are set by our architects and vary per design. You'll see the exact breakdown at checkout before you pay — no hidden fees!"
        ],
        options: [
            { label: '🔍 Browse and See Prices', action: 'browse' },
            { label: '💳 How to buy', next: 'buying' },
            { label: '📞 Ask a human', next: 'contact' },
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
type Message = { role: 'bot' | 'user', text: string }

export default function GuidedChatbot() {
    const [open, setOpen] = useState(false)
    const [nodeId, setNodeId] = useState('start')
    const [messages, setMessages] = useState<Message[]>([])
    const [optionsVisible, setOptionsVisible] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const hasOpened = useRef(false)

    // Initialise with greet messages
    useEffect(() => {
        const node = NODE_MAP['start']
        setMessages(node.messages.map(t => ({ role: 'bot', text: t })))
        setTimeout(() => setOptionsVisible(true), 500)
    }, [])

    // Scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const goToNode = (nextId: string) => {
        const node = NODE_MAP[nextId]
        if (!node) return
        setNodeId(nextId)
        setOptionsVisible(false)
        setMessages(prev => [...prev, ...node.messages.map(t => ({ role: 'bot' as const, text: t }))])
        setTimeout(() => setOptionsVisible(true), 400)
    }

    const handleOption = (opt: Option) => {
        // Append user "choice" as a message
        setMessages(prev => [...prev, { role: 'user', text: opt.label }])
        setOptionsVisible(false)

        if (opt.action) {
            switch (opt.action) {
                case 'browse':
                    window.location.href = '/browse'
                    return
                case 'login':
                    window.location.href = '/login'
                    return
                case 'dashboard':
                    window.location.href = '/dashboard'
                    return
                case 'contact':
                    window.location.href = '/#contact'
                    return
                case 'whatsapp':
                    window.open(`https://wa.me/2347068095681?text=${encodeURIComponent("Hello, I'm reaching out from Ocean of Blueprints and need help.")}`, '_blank')
                    goToNode('start')
                    return
                case 'close':
                    setOpen(false)
                    goToNode('start')
                    return
            }
        }

        if (opt.next) {
            setTimeout(() => goToNode(opt.next!), 300)
        }
    }

    const currentNode = NODE_MAP[nodeId]

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Open Bloo Chat"
                className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full bg-[#00a3ad] dark:bg-[#00f2ff] text-black shadow-[0_0_25px_rgba(0,242,255,0.5)] flex items-center justify-center hover:scale-110 transition-transform"
            >
                {open ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3.75H12M3.75 6a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 15.75h-3l-3 3-3-3H6a2.25 2.25 0 01-2.25-2.25V6z" />
                    </svg>
                )}
            </button>

            {/* Chat Widget */}
            {open && (
                <div className="fixed bottom-24 right-6 z-[199] w-[350px] max-h-[520px] flex flex-col rounded-2xl overflow-hidden border border-[#00f2ff]/30 shadow-[0_0_40px_rgba(0,242,255,0.15)] bg-neutral-950">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#00a3ad]/20 border-b border-[#00f2ff]/20">
                        <div className="w-9 h-9 rounded-full bg-[#00f2ff] flex items-center justify-center text-black font-black text-sm font-mono">B</div>
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
                                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-sm font-mono leading-relaxed whitespace-pre-line ${msg.role === 'user'
                                        ? 'bg-[#00f2ff]/20 text-[#00f2ff] rounded-br-none'
                                        : 'bg-white/5 text-gray-200 rounded-bl-none border border-white/10'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
                                />
                            </div>
                        ))}
                        <div ref={bottomRef} />
                    </div>

                    {/* Options */}
                    {optionsVisible && (
                        <div className="px-4 py-3 space-y-2 border-t border-white/5 bg-black/20">
                            {currentNode.options.map((opt, i) => (
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
