'use client'

import { useState, useRef } from 'react'

interface AIRenderGeneratorProps {
    designId?: string
    initialImage?: string
}

export default function AIRenderGenerator({ designId, initialImage }: AIRenderGeneratorProps) {
    const [mode, setMode] = useState<'RENDER' | 'CRITIQUE'>('RENDER')
    const [image, setImage] = useState<string | null>(initialImage || null)
    const [prompt, setPrompt] = useState('modern')
    const [material, setMaterial] = useState('concrete')
    const [region, setRegion] = useState('Neo-Tokyo')
    const [creativity, setCreativity] = useState(50)

    const [generating, setGenerating] = useState(false)
    const [result, setResult] = useState<string | null>(null)
    const [critique, setCritique] = useState<{ judgement: string, actions: string[], praise: string } | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImage(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault()
        setGenerating(true)
        setResult(null)
        setCritique(null)

        // Simulation
        await new Promise(resolve => setTimeout(resolve, 3000))

        if (mode === 'RENDER') {
            setResult(`https://placehold.co/1024x1024/222222/00f2ff?text=${prompt.toUpperCase()}+${material.toUpperCase()}+${region.toUpperCase()}`)
        } else {
            setCritique({
                judgement: "STRUCTURAL INTEGRITY: 85%. DESIGN COHESION: 60%. DETECTED ANOMALIES IN LOAD-BEARING AESTHETICS.",
                actions: [
                    "Increase glazing ratio on northern facade.",
                    "Integrate biophilic elements to offset brutalist tendencies.",
                    "Optimize roof geometry for solar gain."
                ],
                praise: "VERTICALITY IS COMMENDABLE. BOLD USE OF NEGATIVE SPACE."
            })
        }
        setGenerating(false)
    }

    return (
        <div className="bg-white/5 backdrop-blur-md border border-gray-200 dark:border-gray-700/50 p-6 rounded-xl hover:border-[#00f2ff]/50 transition-all duration-500">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between mb-8 border-b border-gray-700 pb-4">
                <h3 className="text-xl font-bold font-mono text-gray-900 dark:text-white tracking-widest uppercase">
                    AI_ARCHITECT
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => setMode('RENDER')}
                        className={`px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded border ${mode === 'RENDER' ? 'bg-[#00f2ff] text-black border-[#00f2ff]' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        Visualize
                    </button>
                    <button
                        onClick={() => setMode('CRITIQUE')}
                        className={`px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider rounded border ${mode === 'CRITIQUE' ? 'bg-[#ff0055] text-white border-[#ff0055]' : 'text-gray-500 border-transparent hover:text-white'}`}
                    >
                        Critique
                    </button>
                </div>
            </div>

            <div className={`grid gap-8 ${image || result || critique ? 'md:grid-cols-2' : ''} transition-all duration-500`}>

                {/* CONTROLS */}
                <form onSubmit={handleGenerate} className="space-y-6">

                    {/* Image Upload / Reference */}
                    <div className="space-y-2">
                        <label className="block text-xs font-mono text-[#00a3ad] dark:text-[#00f2ff] uppercase">Reference Data</label>
                        {!image ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-600 hover:border-[#00f2ff] rounded-lg p-8 text-center cursor-pointer transition-colors group"
                            >
                                <span className="text-4xl block mb-2 group-hover:scale-110 transition-transform">📂</span>
                                <span className="text-xs font-mono text-gray-500 group-hover:text-white">UPLOAD_SCHEMATIC</span>
                            </div>
                        ) : (
                            <div className="relative group rounded-lg overflow-hidden border border-[#00f2ff]/30">
                                <img src={image} alt="Reference" className="w-full h-48 object-cover opacity-75 group-hover:opacity-100 transition-opacity" />
                                <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-black/80 text-white p-1 rounded hover:bg-red-500 transition-colors text-xs font-mono">
                                    CLR
                                </button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-mono text-[#00a3ad] dark:text-[#00f2ff] uppercase mb-1">Style Protocol</label>
                            <select value={prompt} onChange={e => setPrompt(e.target.value)} className="w-full bg-black/20 border border-gray-600 focus:border-[#00f2ff] text-sm font-mono text-white rounded p-2 outline-none">
                                <option value="modern">Modern Minimalist</option>
                                <option value="brutalist">Neo-Brutalist</option>
                                <option value="cyberpunk">Cyberpunk High-Tech</option>
                                <option value="organic">Organic Parametric</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-mono text-[#00a3ad] dark:text-[#00f2ff] uppercase mb-1">Materiality</label>
                            <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-black/20 border border-gray-600 focus:border-[#00f2ff] text-sm font-mono text-white rounded p-2 outline-none">
                                <option value="concrete">Reinforced Concrete</option>
                                <option value="glass">Smart Glass</option>
                                <option value="timber">Carbonized Timber</option>
                                <option value="neon">Holographic Mesh</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-[#00a3ad] dark:text-[#00f2ff] uppercase mb-1">Context Region</label>
                        <input
                            type="text"
                            value={region}
                            onChange={e => setRegion(e.target.value)}
                            className="w-full bg-black/20 border border-gray-600 focus:border-[#00f2ff] text-sm font-mono text-white rounded p-2 outline-none"
                            placeholder="EX: NEO-TOKYO, MARS, ANTARCTICA"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-xs font-mono text-[#00a3ad] dark:text-[#00f2ff] uppercase">Creativity Index</label>
                            <span className="text-xs font-mono text-gray-400">{creativity}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={creativity}
                            onChange={e => setCreativity(Number(e.target.value))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#00f2ff]"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-gray-600 uppercase">
                            <span>Strict</span>
                            <span>Hallucinate</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={generating || (!image && !designId)}
                        className={`w-full py-3 text-sm font-bold font-mono tracking-widest uppercase transition-all duration-300
                            ${generating
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                : mode === 'RENDER'
                                    ? 'bg-[#00f2ff] text-black hover:shadow-[0_0_20px_rgba(0,242,255,0.6)]'
                                    : 'bg-[#ff0055] text-white hover:shadow-[0_0_20px_rgba(255,0,85,0.6)]'
                            }
                        `}
                    >
                        {generating
                            ? 'PROCESSING_DATA...'
                            : mode === 'RENDER' ? 'INITIATE_VISUALIZATION' : 'RUN_CRITIQUE_ALGORITHM'
                        }
                    </button>
                    {(!image && !designId) && <p className="text-center text-xs text-red-400 font-mono">UPLOAD REFERENCE REQUIRED</p>}
                </form>

                {/* RESULTS AREA */}
                {(result || critique) && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {mode === 'RENDER' && result && (
                            <div className="relative group">
                                <div className="aspect-square w-full bg-black rounded-lg overflow-hidden border border-[#00f2ff]/30">
                                    <div className="absolute top-2 left-2 z-10 bg-black/70 px-2 py-1 text-[10px] font-mono text-[#00f2ff] uppercase border border-[#00f2ff]">
                                        Generation_v4.2
                                    </div>
                                    <img src={result} alt="AI Result" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                </div>
                                <div className="flex justify-end mt-2">
                                    <button onClick={() => setResult(null)} className="text-xs font-mono text-gray-500 hover:text-white uppercase">Disregard Output</button>
                                </div>
                            </div>
                        )}

                        {mode === 'CRITIQUE' && critique && (
                            <div className="h-full border border-[#ff0055]/30 bg-[#ff0055]/5 rounded-lg p-6 font-mono text-sm space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl text-[#ff0055] pointer-events-none font-black select-none">!</div>

                                <div>
                                    <h4 className="text-[#ff0055] font-bold uppercase mb-2">Analysis Log</h4>
                                    <p className="text-gray-300 leading-relaxed border-l-2 border-[#ff0055] pl-3">
                                        {critique.judgement}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-[#00f2ff] font-bold uppercase mb-2">Optimizations</h4>
                                    <ul className="space-y-2">
                                        {critique.actions.map((action, i) => (
                                            <li key={i} className="flex items-start text-gray-400">
                                                <span className="text-[#00f2ff] mr-2">/</span>
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="pt-4 border-t border-[#ff0055]/20">
                                    <h4 className="text-green-400 font-bold uppercase mb-2">Algorithm Praise</h4>
                                    <p className="text-green-400/80 italic">
                                        "{critique.praise}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
