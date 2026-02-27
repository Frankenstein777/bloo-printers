import { AquariumBackground } from '@/components/aquarium-background'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Aquarium — Octoplans',
    description: 'Sit back and enjoy the deep.',
}

export default function AquariumPage() {
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center select-none">
            {/* Subtle centre prompt */}
            <div className="relative z-10 text-center pointer-events-none">
                <p className="font-mono text-xs tracking-[0.4em] text-[#00f2ff]/30 uppercase animate-pulse">
                    Enjoy the deep
                </p>
            </div>

            {/* Unobtrusive back link */}
            <Link
                href="/"
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10 font-mono text-[10px] tracking-[0.3em] text-[#00f2ff]/30 hover:text-[#00f2ff]/70 transition-colors uppercase"
            >
                ← surface
            </Link>
        </div>
    )
}
