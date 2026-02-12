'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Design } from '@prisma/client'

// Types
interface Point { x: number, y: number }
interface SurveyLine {
    id: string
    distance: number
    degrees: number
    minutes: number
    isRoad: boolean
    flipRoad?: boolean // True for right, False for left (relative to line direction)
}

interface PlotFitterProps {
    design: Design
    isOpen: boolean
    onClose: () => void
}

export function SurveyPlotter({ design, isOpen, onClose }: PlotFitterProps) {
    // Standard Defaults
    const [units, setUnits] = useState<'millimeters' | 'meters' | 'feet'>('millimeters')
    const [lines, setLines] = useState<SurveyLine[]>([
        { id: '1', distance: 30000, degrees: 90, minutes: 0, isRoad: true, flipRoad: false }, // Default Front (30m)
        { id: '2', distance: 15000, degrees: 180, minutes: 0, isRoad: false },
        { id: '3', distance: 30000, degrees: 270, minutes: 0, isRoad: false },
        { id: '4', distance: 15000, degrees: 360, minutes: 0, isRoad: false }
    ])


    // Building Transform
    const [buildingPos, setBuildingPos] = useState<Point>({ x: 0, y: 0 }) // Relative to Center of Plot
    const [buildingRotation, setBuildingRotation] = useState(0)
    const [zoomLevel, setZoomLevel] = useState(1.0)

    // Canvas Refs
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isDragging = useRef(false)
    const lastMousePos = useRef<Point>({ x: 0, y: 0 })

    // --- GEOMETRY LOGIC ---

    useEffect(() => {
        console.log("SurveyPlotter received design:", design)
        console.log("Building Footprint Type:", typeof design.buildingFootprint)
        console.log("Building Footprint Value:", design.buildingFootprint)
    }, [design])

    // Footprint Path and Bounds Estimation
    const { buildingPath, buildingBounds, buildingMeta, buildingVertices } = useMemo(() => {
        let pathStr = ""
        let meta: Record<string, any> = {}
        let vertices: Point[] = []

        try {
            const footprint = design.buildingFootprint
            console.log('[SurveyPlotter] footprint type:', typeof footprint, 'isArray:', Array.isArray(footprint))

            if (typeof footprint === 'string') {
                const trimmed = footprint.trim()
                if (trimmed.startsWith('{')) {
                    const data = JSON.parse(trimmed)
                    if (data.svgPath) pathStr = data.svgPath
                    if (data.meta) meta = data.meta
                    if (data.vertices) vertices = data.vertices
                } else if (trimmed.startsWith('M')) {
                    pathStr = trimmed
                }
            } else if (Array.isArray(footprint)) {
                const pts = footprint as unknown as Point[]
                if (pts.length > 0) {
                    pathStr = `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ') + " Z"
                    vertices = pts
                }
            } else if (footprint && typeof footprint === 'object') {
                // Prisma auto-parses JSON columns into objects
                const data = footprint as any
                console.log('[SurveyPlotter] Parsed object footprint:', data)
                if (data.svgPath) pathStr = data.svgPath
                if (data.meta) meta = data.meta
                if (data.vertices) vertices = data.vertices
            }
        } catch (e) {
            console.error("Footprint parse error", e)
        }

        // Default: 10x10m square if empty
        if (!pathStr) {
            pathStr = "M -5000 -5000 L 5000 -5000 L 5000 5000 L -5000 5000 Z"
            vertices = [
                { x: -5000, y: -5000 }, { x: 5000, y: -5000 }, { x: 5000, y: 5000 }, { x: -5000, y: 5000 }
            ]
        }

        const pathObj = new Path2D(pathStr)

        // Bounding box estimation
        const matches = pathStr.match(/[+-]?\d+(\.\d+)?/g)
        const coords = matches ? matches.map(Number) : []
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        for (let i = 0; i < coords.length - 1; i += 2) {
            const x = coords[i], y = coords[i + 1]
            minX = Math.min(minX, x); maxX = Math.max(maxX, x)
            minY = Math.min(minY, y); maxY = Math.max(maxY, y)
        }

        const bounds = (minX === Infinity)
            ? { minX: -5000, maxX: 5000, minY: -5000, maxY: 5000 }
            : { minX, maxX, minY, maxY }

        return {
            buildingPath: pathObj,
            buildingBounds: bounds,
            buildingMeta: meta,
            buildingVertices: vertices
        }
    }, [design.buildingFootprint])

    const plotPolygon = useMemo(() => {
        const poly: Point[] = [{ x: 0, y: 0 }]
        let current = { x: 0, y: 0 }

        lines.forEach(line => {
            const angleDeg = line.degrees + (line.minutes / 60)
            const angleRad = (90 - angleDeg) * (Math.PI / 180)
            let dist = line.distance
            if (units === 'meters') dist = line.distance * 1000
            if (units === 'feet') dist = line.distance * 304.8

            const next = {
                x: current.x + Math.cos(angleRad) * dist,
                y: current.y - Math.sin(angleRad) * dist
            }
            poly.push(next)
            current = next
        })
        return poly
    }, [lines, units])


    // --- CANVAS DRAWING ---

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Fill Parent
        if (containerRef.current) {
            canvas.width = containerRef.current.clientWidth
            canvas.height = containerRef.current.clientHeight
        }

        // Clear
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // Calculate Bounds to Center View (Include both plot and building)
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity

        plotPolygon.forEach(p => {
            minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x)
            minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y)
        })

        // Include building extent (rough estimation based on rotated bounding box)
        const br = buildingRotation * (Math.PI / 180)
        const cos = Math.abs(Math.cos(br))
        const sin = Math.abs(Math.sin(br))
        const bw = buildingBounds.maxX - buildingBounds.minX
        const bh = buildingBounds.maxY - buildingBounds.minY
        const rotatedWidth = bw * cos + bh * sin
        const rotatedHeight = bw * sin + bh * cos

        minX = Math.min(minX, buildingPos.x - rotatedWidth / 2)
        maxX = Math.max(maxX, buildingPos.x + rotatedWidth / 2)
        minY = Math.min(minY, buildingPos.y - rotatedHeight / 2)
        maxY = Math.max(maxY, buildingPos.y + rotatedHeight / 2)

        const plotWidth = maxX - minX || 10
        const plotHeight = maxY - minY || 10
        const scaleX = (canvas.width * 0.8) / plotWidth
        const scaleY = (canvas.height * 0.8) / plotHeight
        const baseScale = Math.min(scaleX, scaleY) // px per millimeter
        const scale = baseScale * zoomLevel

        // Helper: World (Meters) -> Screen (Px)
        const centerX = canvas.width / 2
        const centerY = canvas.height / 2
        const plotCenterX = minX + plotWidth / 2
        const plotCenterY = minY + plotHeight / 2

        const toScreen = (p: Point) => ({
            x: centerX + (p.x - plotCenterX) * scale,
            y: centerY + (p.y - plotCenterY) * scale
        })

        // Draw Grid (1m)
        ctx.strokeStyle = '#334155'
        ctx.lineWidth = 0.5
        // (Simplified Grid - just a crosshair for now)
        ctx.beginPath()
        ctx.moveTo(centerX, 0); ctx.lineTo(centerX, canvas.height)
        ctx.moveTo(0, centerY); ctx.lineTo(canvas.width, centerY)
        ctx.stroke()

        // Draw Plot
        ctx.beginPath()
        ctx.strokeStyle = '#4ade80' // Green-400
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        plotPolygon.forEach((p, i) => {
            const sp = toScreen(p)
            if (i === 0) ctx.moveTo(sp.x, sp.y)
            else ctx.lineTo(sp.x, sp.y)
        })
        // Don't close path automatically, per request
        ctx.stroke()

        // Draw Road Surfaces and Labels
        plotPolygon.forEach((p, i) => {
            if (i < lines.length && lines[i].isRoad) {
                const p1 = p
                const p2 = plotPolygon[i + 1]

                if (p2) {
                    const sp1 = toScreen(p1)
                    const sp2 = toScreen(p2)

                    // 1. Calculate Perpendicular Vector for Offset
                    const dx = p2.x - p1.x
                    const dy = p2.y - p1.y
                    const len = Math.sqrt(dx * dx + dy * dy)
                    if (len > 0) {
                        // Perpendicular Normal (N)
                        // By default, (-dy, dx) points one way, (dy, -dx) the other.
                        const flip = lines[i].flipRoad ? -1 : 1
                        const nx = (-dy / len) * flip
                        const ny = (dx / len) * flip

                        // Key Dimensions in mm
                        const offsetStart = 1500 // 1.5m Gap
                        const roadWidth = 8000 // 8m Width
                        const offsetEnd = offsetStart + roadWidth

                        // Road Polygon (Cartesian/World space)
                        const roadPoints = [
                            { x: p1.x + nx * offsetStart, y: p1.y + ny * offsetStart },
                            { x: p2.x + nx * offsetStart, y: p2.y + ny * offsetStart },
                            { x: p2.x + nx * offsetEnd, y: p2.y + ny * offsetEnd },
                            { x: p1.x + nx * offsetEnd, y: p1.y + ny * offsetEnd }
                        ]

                        const sRoad = roadPoints.map(toScreen)

                        // Draw Road Surface
                        ctx.save()
                        ctx.beginPath()
                        ctx.fillStyle = '#1e293b' // slate-800 dark road
                        ctx.moveTo(sRoad[0].x, sRoad[0].y)
                        sRoad.forEach(pt => ctx.lineTo(pt.x, pt.y))
                        ctx.closePath()
                        ctx.fill()

                        // Road Boundary (Subtle highlight)
                        ctx.strokeStyle = '#334155'
                        ctx.lineWidth = 1
                        ctx.stroke()

                        // Center Lane Marker
                        const midOffset = offsetStart + roadWidth / 2
                        const smp1 = toScreen({ x: p1.x + nx * midOffset, y: p1.y + ny * midOffset })
                        const smp2 = toScreen({ x: p2.x + nx * midOffset, y: p2.y + ny * midOffset })

                        ctx.beginPath()
                        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
                        ctx.setLineDash([15, 20])
                        ctx.lineWidth = 2
                        ctx.moveTo(smp1.x, smp1.y)
                        ctx.lineTo(smp2.x, smp2.y)
                        ctx.stroke()

                        // Access Road Label
                        const midX = (sRoad[0].x + sRoad[2].x) / 2
                        const midY = (sRoad[0].y + sRoad[2].y) / 2
                        ctx.translate(midX, midY)
                        const angle = Math.atan2(sp2.y - sp1.y, sp2.x - sp1.x)
                        ctx.rotate(angle)
                        ctx.fillStyle = '#fbbf24'
                        ctx.font = 'bold 10px font-mono'
                        ctx.textAlign = 'center'
                        ctx.textBaseline = 'middle'
                        ctx.fillText('ACCESS ROAD (8.0m)', 0, 0)

                        ctx.restore()
                    }
                }
            }
        })


        // Draw Building
        ctx.save()
        // 1. Position Building in World Space
        // Move to Screen Center + (WorldPos - PlotCenter) * scale
        ctx.translate(centerX + (buildingPos.x - plotCenterX) * scale, centerY + (buildingPos.y - plotCenterY) * scale)
        // 2. Apply Build Rotation and Scale (Millimeters to Pixels)
        ctx.rotate(buildingRotation * (Math.PI / 180))
        ctx.scale(scale, scale)

        ctx.fillStyle = 'rgba(56, 189, 248, 0.5)' // Sky-400, Transparent
        ctx.strokeStyle = '#38bdf8'
        ctx.lineWidth = 2 / scale // Border width stays constant in pixels regardless of zoom

        ctx.fill(buildingPath)
        ctx.stroke(buildingPath)

        // Draw Meta Markers (Entrances/Exits)
        if (buildingVertices.length > 0) {
            Object.entries(buildingMeta).forEach(([idxStr, meta]) => {
                const i = parseInt(idxStr)
                const m = meta as { isEntrance?: boolean, isExit?: boolean }
                if (!m.isEntrance && !m.isExit) return

                const v1 = buildingVertices[i]
                const v2 = buildingVertices[(i + 1) % buildingVertices.length]

                // Midpoint in Local Space
                const mx = (v1.x + v2.x) / 2
                const my = (v1.y + v2.y) / 2

                ctx.save()
                ctx.translate(mx, my)
                // Counter-rotate markers so they stay upright relative to screen? 
                // Or rotate with building? Let's keep them upright relative to screen for readability
                ctx.rotate(-buildingRotation * (Math.PI / 180))
                const iconScale = 1 / scale // Keep icons constant size

                // Draw Markers
                if (m.isEntrance) {
                    ctx.fillStyle = '#22c55e'
                    ctx.beginPath()
                    ctx.arc(0, -15 * iconScale, 6 * iconScale, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.fillStyle = 'white'
                    ctx.font = `bold ${8 * iconScale}px sans-serif`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('IN', 0, -15 * iconScale)

                    // Pointer
                    ctx.beginPath()
                    ctx.fillStyle = '#22c55e'
                    ctx.moveTo(0, 0)
                    ctx.lineTo(-4 * iconScale, -8 * iconScale)
                    ctx.lineTo(4 * iconScale, -8 * iconScale)
                    ctx.fill()
                }

                if (m.isExit) {
                    const yOffset = m.isEntrance ? 20 * iconScale : 0
                    ctx.fillStyle = '#ef4444'
                    ctx.beginPath()
                    ctx.arc(0, -15 * iconScale + yOffset, 6 * iconScale, 0, Math.PI * 2)
                    ctx.fill()
                    ctx.fillStyle = 'white'
                    ctx.font = `bold ${8 * iconScale}px sans-serif`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillText('OUT', 0, -15 * iconScale + yOffset)
                }

                ctx.restore()
            })
        }

        ctx.restore()

        // Center Marker for Building
        const buildingCenter = toScreen(buildingPos)
        ctx.fillStyle = '#fff'
        ctx.beginPath()
        ctx.arc(buildingCenter.x, buildingCenter.y, 4, 0, Math.PI * 2)
        ctx.fill()

    }, [plotPolygon, buildingPath, buildingPos, buildingRotation, containerRef.current?.clientWidth, zoomLevel])

    // --- INTERACTIONS ---

    // Simple Mouse Drag for Building Position
    const handleMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current) return

        // Convert px delta to meter delta (Approximate scale for interactivity)
        // Ideally we use the exact scale calculated in render, but a constant is "good enough" for feel
        // Convert px delta to millimeter delta
        // scale Factor needs adjustment for mm. If 0.05 was for meters, mm needs ~50
        const scaleFactor = 50

        const dx = (e.clientX - lastMousePos.current.x) * scaleFactor
        const dy = (e.clientY - lastMousePos.current.y) * scaleFactor

        setBuildingPos(prev => ({ x: prev.x + dx, y: prev.y + dy }))
        lastMousePos.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseUp = () => {
        isDragging.current = false
    }

    const handleWheel = (e: React.WheelEvent) => {
        const delta = e.deltaY > 0 ? 0.9 : 1.1
        setZoomLevel(prev => {
            const next = prev * delta
            return Math.min(Math.max(next, 0.2), 5) // Clamp zoom
        })
    }


    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-6xl h-[90vh] rounded-xl flex overflow-hidden shadow-2xl">

                {/* Left: Input Panel */}
                <div className="w-1/3 bg-slate-950 border-r border-slate-800 p-6 flex flex-col overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white font-mono">Survey Data</h2>
                        <div className="flex bg-slate-800 rounded p-1">
                            <button
                                onClick={() => setUnits('millimeters')}
                                className={`px-2 py-1 text-[10px] rounded ${units === 'millimeters' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
                            >mm</button>
                            <button
                                onClick={() => setUnits('meters')}
                                className={`px-2 py-1 text-[10px] rounded ${units === 'meters' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
                            >m</button>
                            <button
                                onClick={() => setUnits('feet')}
                                className={`px-2 py-1 text-[10px] rounded ${units === 'feet' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
                            >ft</button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {lines.map((line, idx) => (
                            <div key={line.id} className="bg-slate-900 p-3 rounded border border-slate-800">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Line {idx + 1}</span>
                                    {lines.length > 3 && (
                                        <button onClick={() => setLines(lines.filter(l => l.id !== line.id))} className="text-red-400 hover:text-red-300">
                                            ×
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">Distance</label>
                                        <input
                                            type="number"
                                            value={line.distance}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value) || 0
                                                setLines(lines.map(l => l.id === line.id ? { ...l, distance: val } : l))
                                            }}
                                            className="w-full bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
                                        />
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <label className="flex items-center space-x-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={line.isRoad}
                                                onChange={e => setLines(lines.map(l => l.id === line.id ? { ...l, isRoad: e.target.checked } : l))}
                                                className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                                            />
                                            <span className="text-xs text-slate-400">Road</span>
                                        </label>

                                        {line.isRoad && (
                                            <button
                                                onClick={() => setLines(lines.map(l => l.id === line.id ? { ...l, flipRoad: !l.flipRoad } : l))}
                                                className="bg-slate-800 hover:bg-slate-700 p-1 rounded border border-slate-700 text-[10px] text-cyan-400 flex items-center gap-1 transition-colors"
                                                title="Flip Road Side"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                                                Flip
                                            </button>
                                        )}
                                    </div>

                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">Degrees</label>
                                        <input
                                            type="number"
                                            value={line.degrees}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value) || 0
                                                setLines(lines.map(l => l.id === line.id ? { ...l, degrees: val } : l))
                                            }}
                                            className="w-full bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-slate-500 block">Minutes</label>
                                        <input
                                            type="number"
                                            value={line.minutes}
                                            onChange={e => {
                                                const val = parseFloat(e.target.value) || 0
                                                setLines(lines.map(l => l.id === line.id ? { ...l, minutes: val } : l))
                                            }}
                                            className="w-full bg-slate-800 border-slate-700 text-white text-sm rounded px-2 py-1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => setLines([...lines, { id: Math.random().toString(), distance: 10, degrees: 0, minutes: 0, isRoad: false }])}
                        className="mt-4 w-full py-2 border-2 border-dashed border-slate-700 text-slate-400 hover:border-cyan-500 hover:text-cyan-500 rounded transition-colors text-sm font-bold uppercase tracking-wider"
                    >
                        + Add Survey Line
                    </button>
                </div>

                {/* Right: Canvas */}
                <div className="w-2/3 relative bg-[#020617]" ref={containerRef}>
                    {/* Toolbar */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between z-10 pointer-events-none">
                        <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded border border-slate-700 shadow-xl pointer-events-auto">
                            <h3 className="text-white font-bold text-sm">Site Visualizer</h3>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-xs text-slate-400">Drag to move building</p>
                                <div className="h-3 w-[1px] bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setZoomLevel(prev => Math.max(prev * 0.8, 0.2))}
                                        className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded text-xs border border-slate-700 pointer-events-auto"
                                    >—</button>
                                    <span className="text-[10px] text-slate-400 font-mono w-8 text-center">{Math.round(zoomLevel * 100)}%</span>
                                    <button
                                        onClick={() => setZoomLevel(prev => Math.min(prev * 1.2, 5))}
                                        className="w-5 h-5 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white rounded text-xs border border-slate-700 pointer-events-auto"
                                    >+</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/90 backdrop-blur px-4 py-2 rounded border border-slate-700 shadow-xl pointer-events-auto flex items-center space-x-4">
                            <span className="text-xs text-slate-400 uppercase font-bold">Rotation</span>
                            <input
                                type="range"
                                min="0" max="360"
                                value={buildingRotation}
                                onChange={e => setBuildingRotation(parseInt(e.target.value))}
                                className="w-32 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                            <span className="text-white font-mono text-sm w-8">{buildingRotation}°</span>
                        </div>

                        <button
                            onClick={onClose}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded font-bold text-sm uppercase pointer-events-auto"
                        >
                            Close
                        </button>
                    </div>

                    <canvas
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onWheel={handleWheel}
                        className="w-full h-full cursor-move"
                    />

                    {/* Compass Rose */}
                    <div className="absolute bottom-4 right-4 pointer-events-none opacity-50">
                        <div className="w-16 h-16 border-2 border-slate-600 rounded-full flex items-center justify-center relative">
                            <div className="absolute top-0 text-xs text-slate-400 font-bold bg-[#020617] px-1 -mt-2">N</div>
                            <div className="w-0.5 h-8 bg-slate-600"></div>
                            <div className="w-8 h-0.5 bg-slate-600 absolute"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
