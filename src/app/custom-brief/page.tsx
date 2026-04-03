'use client'

import { useState } from 'react'

export default function CustomBriefPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const [communicationPref, setCommunicationPref] = useState('whatsapp')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setIsSubmitting(true)

        try {
            const formData = new FormData(e.currentTarget)
            
            const res = await fetch('/api/custom-brief', {
                method: 'POST',
                body: formData // multipart/form-data
            })

            const data = await res.json()
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to submit request')
            }

            setSuccess(true)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-gray-900 dark:text-white flex items-center justify-center">
                <div className="max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/40 text-green-500 rounded-full flex items-center justify-center mx-auto border-2 border-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <h1 className="text-3xl font-black font-mono uppercase text-[#00a3ad] dark:text-[#00f2ff]">Request Received</h1>
                    <p className="font-mono text-gray-600 dark:text-gray-400">
                        We have successfully stored your custom brief. One of our lead architects will review your details and reach out via {communicationPref === 'whatsapp' ? 'WhatsApp' : 'Email'} shortly.
                    </p>
                    <button onClick={() => setSuccess(false)} className="px-6 py-2 border border-[#00f2ff] text-[#00f2ff] hover:bg-[#00f2ff]/10 font-mono text-sm uppercase tracking-widest mt-8">
                        Submit Another
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-24 px-4 text-gray-900 dark:text-white">
            <div className="max-w-3xl mx-auto space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-[#00a3ad] dark:text-[#00f2ff] uppercase">
                        Custom Design Brief
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 font-mono">
                        Tell us exactly what you need. Our expert architects will craft a custom design tailored to your vision.
                    </p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-xl shadow-sm">
                    {error && (
                        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 font-mono text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Full Name</label>
                                <input type="text" name="name" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Email Address <span className="text-gray-400 font-normal text-xs">(optional)</span></label>
                                <input type="email" name="email" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" placeholder="john@example.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Project Type</label>
                                <select name="projectType" required className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]">
                                    <option value="Residential">Residential (Duplex, Bungalow, etc)</option>
                                    <option value="Commercial">Commercial (Plaza, Office Building)</option>
                                    <option value="Industrial">Industrial (Warehouse, Factory)</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Preferred Plot Size</label>
                                <input type="text" name="plotSize" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" placeholder="e.g. 50ft x 100ft" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Key Features Required</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {['Penthouse', 'BQ / Boys Quarters', 'Swimming Pool', 'Cinema', 'Study / Office', 'Gym', 'Laundry Room', 'Courtyard'].map(feat => (
                                    <label key={feat} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                                        <input type="checkbox" name="features" value={feat} className="rounded border-slate-300 text-[#00f2ff] focus:ring-[#00f2ff] bg-transparent" />
                                        <span>{feat}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Detailed Description</label>
                            <textarea name="description" rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff] resize-none" placeholder="Please describe the number of bedrooms, specific styling (e.g. modern minimalism, contemporary luxury), and any distinct architectural features you want..."></textarea>
                        </div>

                        <div className="border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-900/10 p-5 rounded-lg border-dashed">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Attach Survey Plan <span className="text-gray-500 font-normal italic lowercase">(optional)</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-3 font-mono">If you already have a survey for your plot, upload it here to help us design around your boundaries seamlessly.</p>
                            <input 
                                type="file" 
                                name="surveyPlan" 
                                accept="image/*,.pdf"
                                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#00f2ff]/10 file:text-[#00a3ad] dark:file:text-[#00f2ff] hover:file:bg-[#00f2ff]/20"
                            />
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-800 pt-8">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">How should we contact you?</label>
                            <div className="flex gap-6 mb-4">
                                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="communicationPref" 
                                        value="whatsapp" 
                                        checked={communicationPref === 'whatsapp'} 
                                        onChange={() => setCommunicationPref('whatsapp')}
                                        className="text-[#00f2ff] focus:ring-[#00f2ff]"
                                    />
                                    <span>WhatsApp</span>
                                </label>
                                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="communicationPref" 
                                        value="email" 
                                        checked={communicationPref === 'email'} 
                                        onChange={() => setCommunicationPref('email')}
                                        className="text-[#00f2ff] focus:ring-[#00f2ff]"
                                    />
                                    <span>Email</span>
                                </label>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-400 mb-2">
                                    {communicationPref === 'whatsapp' ? 'Your WhatsApp Number' : 'Your Email Address'}
                                </label>
                                <input 
                                    type={communicationPref === 'whatsapp' ? 'tel' : 'email'} 
                                    name="contactHandle" 
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00f2ff]" 
                                    placeholder={communicationPref === 'whatsapp' ? '+234 800 000 0000' : 'name@example.com'} 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full ${isSubmitting ? 'bg-gray-400' : 'bg-[#00a3ad] dark:bg-[#00f2ff] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)]'} text-black font-black py-4 rounded-lg text-lg uppercase tracking-widest transition-all`}
                        >
                            {isSubmitting ? 'Uploading & Sending...' : 'Submit Request'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
