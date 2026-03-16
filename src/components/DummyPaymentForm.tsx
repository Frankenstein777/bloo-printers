'use client'

import { useState } from 'react'

interface DummyPaymentFormProps {
    amount: number // in Naira
    onSuccess: (cardholderName: string) => void
}

export default function DummyPaymentForm({ amount, onSuccess }: DummyPaymentFormProps) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        name: ''
    })

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        // Simulate network delay
        setTimeout(() => {
            setLoading(false)
            onSuccess(formData.name)
        }, 2000)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-900 border border-gray-800 rounded-xl relative overflow-hidden">
            {/* Glossy Overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f2ff]/5 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32"></div>

            <h3 className="text-xl font-mono text-[#00f2ff] mb-4 uppercase flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00f2ff] rounded-full animate-pulse"></span>
                Secure Card Payment
            </h3>

            <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Cardholder Name</label>
                <input
                    name="name"
                    type="text"
                    required
                    placeholder="ALEX ARCHITECT"
                    className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[#00f2ff] outline-none transition-colors"
                    onChange={handleInput}
                />
            </div>

            <div>
                <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Card Number</label>
                <input
                    name="cardNumber"
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    maxLength={19}
                    className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[#00f2ff] outline-none transition-colors"
                    onChange={handleInput}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">Expiry</label>
                    <input
                        name="expiry"
                        type="text"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[#00f2ff] outline-none transition-colors"
                        onChange={handleInput}
                    />
                </div>
                <div>
                    <label className="block text-xs text-gray-400 mb-1 uppercase tracking-widest">CVV</label>
                    <input
                        name="cvv"
                        type="password"
                        required
                        placeholder="123"
                        maxLength={3}
                        className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white font-mono focus:border-[#00f2ff] outline-none transition-colors"
                        onChange={handleInput}
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-[#00f2ff] text-black font-bold py-4 rounded hover:bg-white hover:shadow-[0_0_20px_rgba(0,242,255,0.5)] transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Processing...' : `Pay NGN ${amount.toLocaleString()}`}
            </button>

            <p className="text-[10px] text-center text-gray-600 font-mono mt-2">
                Simulated Payment Environment. No real funds will be deducted.
            </p>
        </form>
    )
}
