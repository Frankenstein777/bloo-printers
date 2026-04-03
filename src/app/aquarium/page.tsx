import { AquariumBackground } from "@/components/aquarium-background"

export default function AquariumPage() {
    return (
        <div className="relative min-h-screen">
            <AquariumBackground />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-center bg-black/40 backdrop-blur px-8 py-4 rounded-2xl border border-[#00f2ff]/20 pointer-events-auto">
                    <h1 className="text-4xl font-black text-[#00f2ff] font-mono tracking-tighter uppercase">Aquarium</h1>
                    <p className="text-gray-300 font-mono mt-2 text-sm">Relax and interact with the aquatic environment.</p>
                </div>
            </div>
        </div>
    )
}
