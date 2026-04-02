import React from 'react'

export function WatermarkOverlay() {
    return (
        <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden select-none flex flex-wrap opacity-40 mix-blend-overlay content-center justify-center gap-12 p-8">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center justify-center transform -rotate-45">
                    <span className="text-white/50 font-black text-xl md:text-2xl whitespace-nowrap uppercase tracking-[0.2em]"
                        style={{ textShadow: '0 0 4px rgba(0,0,0,0.6)' }}>

                    </span>
                </div>
            ))}
        </div>
    )
}
