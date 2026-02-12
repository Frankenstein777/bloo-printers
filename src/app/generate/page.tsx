import AIRenderGenerator from "@/components/AIRenderGenerator"

export default function AIStudioPage() {
    return (
        <div className="min-h-screen pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-black">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl md:text-7xl font-black font-mono tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                        AI_STUDIO
                    </h1>
                    <p className="text-xl font-mono text-[#00f2ff]">
                        CONCEPTUALIZATION_ENGINE_ONLINE
                    </p>
                    <p className="max-w-xl mx-auto text-gray-400 text-sm font-mono">
                        Upload schematics or photos to visualize variants or receive algorithmic critique.
                        Our neural networks are trained on 10,000 years of architectural history.
                    </p>
                </div>

                <div className="relative z-10">
                    <AIRenderGenerator />
                </div>

                {/* Background Decoration */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#00f2ff]/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-[#ff0055]/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>
            </div>
        </div>
    )
}
