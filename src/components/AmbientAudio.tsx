'use client'

import { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX } from 'lucide-react'

export default function AmbientAudio() {
    const [isMuted, setIsMuted] = useState(true)
    const [volume, setVolume] = useState(0.5) // Master volume 0.0 - 1.0
    const [hasInteracted, setHasInteracted] = useState(false)
    const [showSlider, setShowSlider] = useState(false)
    const ambientRef = useRef<HTMLAudioElement | null>(null)
    const rippleRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        // Initialize Audio
        ambientRef.current = new Audio('/sounds/underwater.mp3')
        ambientRef.current.loop = true
        // Base volume is lower for ambient (background)
        ambientRef.current.volume = isMuted ? 0 : volume * 0.15
        ambientRef.current.onerror = (e) => console.error("Error loading ambient:", e)

        rippleRef.current = new Audio('/sounds/ripple.mp3')
        // Base volume is max for ripple (foreground)
        rippleRef.current.volume = isMuted ? 0 : volume * 1.0
        rippleRef.current.onerror = (e) => console.error("Error loading ripple:", e)

        return () => {
            ambientRef.current?.pause()
            ambientRef.current = null
            rippleRef.current = null
        }
    }, [])

    // Sync volume/mute changes
    useEffect(() => {
        if (ambientRef.current) {
            ambientRef.current.volume = isMuted ? 0 : volume * 0.15
            if (!isMuted && hasInteracted && ambientRef.current.paused) {
                ambientRef.current.play().catch(() => { })
            } else if (isMuted) {
                ambientRef.current.pause()
            }
        }
        if (rippleRef.current) {
            rippleRef.current.volume = isMuted ? 0 : volume * 1.0
        }
    }, [volume, isMuted, hasInteracted])

    useEffect(() => {
        const handleGlobalClick = () => {
            // Auto-unmute on first valid interaction if user hasn't manually muted
            if (!hasInteracted) {
                setHasInteracted(true)
                if (isMuted) {
                    setIsMuted(false)
                }
            }

            // Play Ripple - Clone for overlapping sounds
            if (!isMuted && rippleRef.current && volume > 0.05) {
                const sound = rippleRef.current.cloneNode() as HTMLAudioElement
                sound.volume = volume * 1.0
                sound.play().catch(e => console.warn("Ripple failed:", e))
            }
        }

        window.addEventListener('click', handleGlobalClick)
        return () => window.removeEventListener('click', handleGlobalClick)
    }, [isMuted, hasInteracted, volume])

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-2"
            onMouseEnter={() => setShowSlider(true)}
            onMouseLeave={() => setShowSlider(false)}
        >
            {/* Volume Slider - Vertical */}
            <div className={`
                transition-all duration-300 overflow-hidden
                ${showSlider ? 'h-32 opacity-100' : 'h-0 opacity-0'}
            `}>
                <div className="bg-black/40 backdrop-blur-md p-3 rounded-full border border-gray-700 h-full flex items-center justify-center">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={volume}
                        onChange={(e) => {
                            setVolume(parseFloat(e.target.value))
                            if (isMuted && parseFloat(e.target.value) > 0) setIsMuted(false)
                        }}
                        className="h-24 w-2 appearance-none bg-gray-600 rounded-lg cursor-pointer accent-[#00f2ff]"
                        style={{
                            writingMode: 'vertical-lr',
                            WebkitAppearance: 'slider-vertical'
                        }}
                    />
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    toggleMute()
                }}
                className={`
                    p-3 rounded-full backdrop-blur-md border transition-all duration-300
                    ${isMuted || volume === 0
                        ? 'bg-black/20 border-gray-600 text-gray-400 hover:bg-black/40'
                        : 'bg-[#00f2ff]/10 border-[#00f2ff] text-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.3)] animate-pulse-slow'}
                `}
                aria-label={isMuted ? "Unmute Ambient Sound" : "Mute Ambient Sound"}
            >
                {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
    )
}
