"use client"

import { useState, useEffect, useRef, useMemo } from 'react'
import { createPortal } from 'react-dom'

export interface EditorVertex {
    x: number
    y: number
    bulge?: number
}

interface SideMetadata {
    isEntrance?: boolean
    isExit?: boolean
}

interface FootprintEditorProps {
    initialVertices?: EditorVertex[]
    onChange: (value: string) => void
}

export function FootprintEditor({ initialVertices = [], onChange }: FootprintEditorProps) {
    const [vertices, setVertices] = useState<EditorVertex[]>(initialVertices)
    const [meta, setMeta] = useState<Record<number, SideMetadata>>({})
    const [hoveredSide, setHoveredSide] = useState<number | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoom, setZoom] = useState(1.0)
    const [pan, setPan] = useState({ x: 0, y: 0 })
    const isDragging = useRef(false)
    const lastMouse = useRef({ x: 0, y: 0 })

    // Re-initialize if props change (e.g. new file uploaded)
    useEffect(() => {
        if (initialVertices.length > 0) {
            setVertices(initialVertices)
            setMeta({})
        }
    }, [initialVertices])

    // Generate Path and Notify Parent
    useEffect(() => {
        const svgPath = generateSvgPath(vertices)
        const payload = JSON.stringify({ vertices, meta, svgPath })
        onChange(payload)
    }, [vertices, meta, onChange])

    const generateSvgPath = (verts: EditorVertex[]) => {
        if (verts.length === 0) return ""
        let path = `M ${verts[0].x.toFixed(2)} ${verts[0].y.toFixed(2)}`
        for (let i = 0; i < verts.length; i++) {
            const v1 = verts[i]
            const nextIdx = (i + 1) % verts.length
            const v2 = verts[nextIdx]
            if (nextIdx === 0 && i === verts.length - 1) {
                // Last segment closes the shape
            }
            const bulge = v1.bulge || 0
            if (Math.abs(bulge) < 0.001) {
                path += ` L ${v2.x.toFixed(2)} ${v2.y.toFixed(2)}`
            } else {
                const dx = v2.x - v1.x
                const dy = v2.y - v1.y
                const L = Math.sqrt(dx * dx + dy * dy)
                const r = (L / 2) * (1 + bulge * bulge) / (2 * Math.abs(bulge))
                const largeArc = Math.abs(bulge) > 1 ? 1 : 0
                const sweep = bulge < 0 ? 1 : 0
                path += ` A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArc} ${sweep} ${v2.x.toFixed(2)} ${v2.y.toFixed(2)}`
            }
        }
        return path + " Z"
    }

    const toggleFlip = (idx: number) => {
        setVertices(prev => prev.map((v, i) => i === idx ? { ...v, bulge: -(v.bulge || 0) } : v))
    }

    const toggleMeta = (idx: number, key: keyof SideMetadata) => {
        setMeta(prev => ({
            ...prev,
            [idx]: { ...prev[idx], [key]: !prev[idx]?.[key] }
        }))
    }

    // --- BOUNDS ---
    const bounds = useMemo(() => {
        if (vertices.length === 0) return { minX: -10, maxX: 10, minY: -10, maxY: 10, width: 20, height: 20 }
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        vertices.forEach(v => {
            minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x)
            minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y)
        })
        const padding = Math.max(maxX - minX, maxY - minY) * 0.2
        return {
            minX: minX - padding, maxX: maxX + padding,
            minY: minY - padding, maxY: maxY + padding,
            width: (maxX - minX) + padding * 2,
            height: (maxY - minY) + padding * 2
        }
    }, [vertices])

    const getSideCenter = (i: number) => {
        const v1 = vertices[i]
        const v2 = vertices[(i + 1) % vertices.length]
        return { x: (v1.x + v2.x) / 2, y: (v1.y + v2.y) / 2 }
    }

    // --- ZOOM / PAN ---
    const handleWheel = (e: React.WheelEvent) => {
        e.stopPropagation()
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setZoom(prev => Math.min(Math.max(prev * delta, 0.1), 20))
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        lastMouse.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return
        const dx = e.clientX - lastMouse.current.x
        const dy = e.clientY - lastMouse.current.y
        lastMouse.current = { x: e.clientX, y: e.clientY }
        const sensitivity = bounds.width / 500 / zoom
        setPan(prev => ({ x: prev.x - dx * sensitivity, y: prev.y + dy * sensitivity }))
    }

    const handleMouseUp = () => { isDragging.current = false }

    // Dynamic ViewBox for fullscreen
    const fullscreenViewBox = useMemo(() => {
        const cx = bounds.minX + bounds.width / 2
        const cy = bounds.minY + bounds.height / 2
        const vw = bounds.width / zoom
        const vh = bounds.height / zoom
        return `${cx - vw / 2 + pan.x} ${cy - vh / 2 + pan.y} ${vw} ${vh}`
    }, [bounds, zoom, pan])

    // --- SHARED SVG CONTENT ---
    const renderSvgContent = (isInteractive: boolean) => {
        const vb = isInteractive ? fullscreenViewBox : `${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`
        const sw = isInteractive ? bounds.width * 0.005 / zoom : bounds.width * 0.005

        return (
            <svg
                viewBox={vb}
                className={`w-full h-full ${isInteractive ? 'cursor-move touch-none' : ''}`}
                style={{ transform: 'scale(1, -1)' }}
                onWheel={isInteractive ? handleWheel : undefined}
                onMouseDown={isInteractive ? handleMouseDown : undefined}
                onMouseMove={isInteractive ? handleMouseMove : undefined}
                onMouseUp={isInteractive ? handleMouseUp : undefined}
                onMouseLeave={isInteractive ? handleMouseUp : undefined}
            >
                {/* Grid Axes */}
                <line x1={bounds.minX - 100000} y1={0} x2={bounds.maxX + 100000} y2={0} stroke="#e2e8f0" strokeWidth={sw * 0.4} />
                <line x1={0} y1={bounds.minY - 100000} x2={0} y2={bounds.maxY + 100000} stroke="#e2e8f0" strokeWidth={sw * 0.4} />

                {/* Footprint Path */}
                <path d={generateSvgPath(vertices)} fill="rgba(56, 189, 248, 0.1)" stroke="#0ea5e9" strokeWidth={sw} />

                {/* Sides */}
                {vertices.map((v, i) => {
                    const next = vertices[(i + 1) % vertices.length]
                    const isHovered = hoveredSide === i
                    const center = getSideCenter(i)
                    const hitWidth = isInteractive ? bounds.width * 0.05 / zoom : bounds.width * 0.05
                    const highlightWidth = isInteractive ? bounds.width * 0.01 / zoom : bounds.width * 0.01
                    const fontSize = isInteractive ? bounds.width * 0.03 / zoom : bounds.width * 0.03
                    const markerR = isInteractive ? bounds.width * 0.02 / zoom : bounds.width * 0.02

                    return (
                        <g key={i}>
                            <line x1={v.x} y1={v.y} x2={next.x} y2={next.y}
                                stroke="transparent" strokeWidth={hitWidth}
                                onMouseEnter={() => setHoveredSide(i)}
                            />
                            {isHovered && (
                                <line x1={v.x} y1={v.y} x2={next.x} y2={next.y}
                                    stroke="#f59e0b" strokeWidth={highlightWidth}
                                    strokeDasharray={(v.bulge && Math.abs(v.bulge) > 0.001) ? "5,5" : "0"}
                                />
                            )}
                            <text x={center.x} y={center.y}
                                fill={isHovered ? "#f59e0b" : "#64748b"} fontSize={fontSize}
                                textAnchor="middle"
                                transform={`scale(1, -1) translate(0, ${-2 * center.y})`}
                                pointerEvents="none"
                            >{i + 1}</text>
                            {meta[i]?.isEntrance && <circle cx={center.x} cy={center.y} r={markerR} fill="#22c55e" />}
                            {meta[i]?.isExit && <circle cx={center.x} cy={center.y} r={markerR} fill="#ef4444" />}
                        </g>
                    )
                })}
            </svg>
        )
    }

    // --- SIDE LIST ---
    const renderSideList = () => (
        <>
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300 mb-4 sticky top-0 bg-white dark:bg-slate-950 pb-2 border-b z-10">
                Sides ({vertices.length})
            </h3>
            <div className="space-y-2">
                {vertices.map((v, i) => (
                    <div key={i}
                        className={`p-3 rounded border text-sm transition-colors ${hoveredSide === i ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-900 dark:border-slate-800'}`}
                        onMouseEnter={() => setHoveredSide(i)}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-slate-500">Side {i + 1}</span>
                            <div className="flex gap-2">
                                {(v.bulge && Math.abs(v.bulge) > 0.001) && (
                                    <button onClick={() => toggleFlip(i)}
                                        className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200 font-medium">
                                        Flip Curve
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => toggleMeta(i, 'isEntrance')}
                                className={`flex-1 py-1 px-2 rounded text-xs border ${meta[i]?.isEntrance ? 'bg-green-100 text-green-700 border-green-300' : 'bg-white text-slate-500 border-slate-200'}`}>
                                {meta[i]?.isEntrance ? '✓ Entrance' : 'Mark Entrance'}
                            </button>
                            <button onClick={() => toggleMeta(i, 'isExit')}
                                className={`flex-1 py-1 px-2 rounded text-xs border ${meta[i]?.isExit ? 'bg-red-100 text-red-700 border-red-300' : 'bg-white text-slate-500 border-slate-200'}`}>
                                {meta[i]?.isExit ? '✓ Exit' : 'Mark Exit'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    )

    if (vertices.length === 0) return <div className="text-center text-gray-500 py-8">No footprint data loaded. Upload a DXF or generate a rectangle.</div>

    return (
        <>
            {/* Inline Editor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border rounded-xl p-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                {/* Preview */}
                <div className="md:col-span-2 bg-white dark:bg-slate-950 rounded-lg shadow-inner overflow-hidden border border-slate-200 dark:border-slate-800 relative h-96 flex items-center justify-center">
                    {renderSvgContent(false)}
                    <button
                        onClick={() => { setIsFullscreen(true); setZoom(1); setPan({ x: 0, y: 0 }) }}
                        className="absolute top-2 right-2 bg-white/90 dark:bg-slate-800/90 p-1.5 rounded-md shadow border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-colors z-10"
                        title="Open Fullscreen Editor"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" /></svg>
                    </button>
                    <div className="absolute bottom-2 left-2 text-xs text-slate-400 font-mono pointer-events-none">Preview</div>
                </div>
                {/* Side Controls */}
                <div className="bg-white dark:bg-slate-950 rounded-lg p-4 h-96 overflow-y-auto border border-slate-200 dark:border-slate-800">
                    {renderSideList()}
                </div>
            </div>

            {/* Fullscreen Portal */}
            {isFullscreen && typeof document !== 'undefined' && createPortal(
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, background: '#0f172a', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                    {/* Toolbar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexShrink: 0 }}>
                        <div style={{ color: '#94a3b8', fontSize: '12px', fontFamily: 'monospace' }}>
                            Zoom: {Math.round(zoom * 100)}% — Scroll to zoom, drag to pan
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
                                style={{ padding: '6px 12px', background: '#334155', color: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                Reset View
                            </button>
                            <button onClick={() => setIsFullscreen(false)}
                                style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                                Close
                            </button>
                        </div>
                    </div>
                    {/* Content */}
                    <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden' }}>
                        {/* SVG */}
                        <div style={{ flex: 1, background: '#020617', borderRadius: '12px', border: '1px solid #1e293b', overflow: 'hidden', position: 'relative' }}>
                            {renderSvgContent(true)}
                        </div>
                        {/* Side List */}
                        <div style={{ width: '300px', background: '#020617', borderRadius: '12px', border: '1px solid #1e293b', padding: '16px', overflowY: 'auto', flexShrink: 0 }}>
                            {renderSideList()}
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}
