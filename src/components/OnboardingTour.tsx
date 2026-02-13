'use client'

import { useState, useEffect } from 'react'

export function OnboardingTour() {
    const [showTour, setShowTour] = useState(false)
    const [step, setStep] = useState(0)

    useEffect(() => {
        const hasSeenTour = localStorage.getItem('bloo_onboarding_completed')
        if (!hasSeenTour) {
            // Small delay to let page load
            const timer = setTimeout(() => setShowTour(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const handleComplete = () => {
        setShowTour(false)
        localStorage.setItem('bloo_onboarding_completed', 'true')
    }

    if (!showTour) return null

    const steps = [
        {
            title: "Welcome to Ocean of Blueprints",
            content: "Your premier destination for architectural designs. Let us show you around quickly.",
            target: "body" // centered
        },
        {
            title: "Browse Designs",
            content: "Click 'Browse' to explore our catalog of professional blueprints.",
            target: "nav a[href='/browse']"
        },
        {
            title: "Secure Your Account",
            content: "Login or Sign Up to access your purchased designs and dashboard.",
            target: "nav a[href='/login']"
        },
        {
            title: "All Set!",
            content: "You're ready to go. Enjoy exploring!",
            target: "body"
        }
    ]

    const currentStep = steps[step]

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4 relative animate-in fade-in zoom-in duration-300">
                <button
                    onClick={handleComplete}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="mb-6">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
                        Step {step + 1} of {steps.length}
                    </span>
                </div>

                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentStep.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                    {currentStep.content}
                </p>

                <div className="flex justify-between items-center">
                    <button
                        onClick={handleComplete}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        Skip Tour
                    </button>

                    <button
                        onClick={() => {
                            if (step < steps.length - 1) {
                                setStep(step + 1)
                            } else {
                                handleComplete()
                            }
                        }}
                        className="bg-[#00a3ad] dark:bg-[#00f2ff] text-black font-bold py-2 px-6 rounded-lg hover:shadow-[0_0_15px_rgba(0,242,255,0.5)] transition-all"
                    >
                        {step < steps.length - 1 ? 'Next' : 'Get Started'}
                    </button>
                </div>
            </div>
        </div>
    )
}
