'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'

// ─── Tiny game-local types ────────────────────────────────────────────────────

interface FishEntity {
    x: number
    y: number
    angle: number
    targetAngle: number
    speed: number
    baseSpeed: number
    turnSpeed: number
    size: number
    sway: number
    fleeing: boolean
    fleeDistance: number
    caught: boolean
    catchAnim: number // 0→1 flash-out animation progress
    id: number
}

interface Ripple {
    x: number
    y: number
    radius: number
    opacity: number
    speed: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FISH_COUNT = 18
const CATCH_RADIUS = 55        // px from fish centre the cursor must be to catch
const GAME_DURATION = 60       // seconds
const BG = '#020617'
const CYAN = '#00f2ff'
const CYAN_GLOW = 'rgba(0,242,255,0.55)'
const CYAN_DIM = 'rgba(0,242,255,0.18)'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeFish(w: number, h: number, id: number): FishEntity {
    const size = 42 + Math.random() * 80
    const baseSpeed = Math.max(0.7, 130 / size)
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        angle: Math.random() * Math.PI * 2,
        targetAngle: Math.random() * Math.PI * 2,
        speed: baseSpeed,
        baseSpeed,
        turnSpeed: 0.04,
        size,
        sway: Math.random() * Math.PI * 2,
        fleeing: false,
        fleeDistance: 0,
        caught: false,
        catchAnim: 0,
        id,
    }
}

function angleDiff(a: number, b: number) {
    let d = a - b
    while (d < -Math.PI) d += Math.PI * 2
    while (d > Math.PI) d -= Math.PI * 2
    return d
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AquariumGame() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const fishRef = useRef<FishEntity[]>([])
    const ripplesRef = useRef<Ripple[]>([])
    const mouseRef = useRef({ x: -9999, y: -9999 })
    const logoRef = useRef<HTMLImageElement | null>(null)
    const glowRef = useRef({ progress: 0, dir: 1, active: false })
    const rafRef = useRef<number>(0)
    const nextId = useRef(0)

    // Game state (React-visible for the HUD)
    const [phase, setPhase] = useState<'idle' | 'playing' | 'done'>('idle')
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
    const [bestScore, setBestScore] = useState(0)

    // Refs that are read inside the animation loop
    const phaseRef = useRef<'idle' | 'playing' | 'done'>('idle')
    const scoreRef = useRef(0)
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

    // ── Canvas / loop setup ──────────────────────────────────────────────────

    useEffect(() => {
        // Pre-load octopus logo
        const img = new window.Image()
        img.src = '/logo.svg'
        img.onload = () => { logoRef.current = img }

        // Glow scheduler
        let glowTO: ReturnType<typeof setTimeout>
        const scheduleGlow = () => {
            glowTO = setTimeout(() => {
                glowRef.current = { progress: 0, dir: 1, active: true }
                scheduleGlow()
            }, 2000 + Math.random() * 4000)
        }
        scheduleGlow()

        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        let w = 0, h = 0

        const init = () => {
            w = window.innerWidth
            h = window.innerHeight
            const dpr = window.devicePixelRatio || 1
            canvas.width = w * dpr
            canvas.height = h * dpr
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            ctx.scale(dpr, dpr)

            fishRef.current = Array.from({ length: FISH_COUNT }, (_, i) =>
                makeFish(w, h, nextId.current++)
            )
        }

        // ── Draw helpers ─────────────────────────────────────────────────────

        const drawFish = (f: FishEntity) => {
            if (f.caught && f.catchAnim >= 1) return

            ctx.save()
            ctx.translate(f.x, f.y)
            ctx.rotate(f.angle)

            const swayOffset = Math.sin(f.sway) * (f.size * 0.1)
            const alpha = f.caught ? Math.max(0, 1 - f.catchAnim * 3) : 0.88

            // Glow
            ctx.shadowBlur = f.caught ? 60 + f.catchAnim * 80 : 32
            ctx.shadowColor = CYAN_GLOW

            ctx.globalAlpha = alpha
            ctx.fillStyle = CYAN

            // Body
            ctx.beginPath()
            ctx.moveTo(f.size / 2, 0)
            ctx.quadraticCurveTo(-f.size / 2, f.size / 4, -f.size / 2, swayOffset)
            ctx.quadraticCurveTo(-f.size / 2, -f.size / 4, f.size / 2, 0)
            ctx.fill()

            // Tail
            ctx.beginPath()
            ctx.moveTo(-f.size / 2, swayOffset)
            ctx.lineTo(-f.size * 0.8, f.size / 6 + swayOffset)
            ctx.lineTo(-f.size * 0.7, swayOffset)
            ctx.lineTo(-f.size * 0.8, -f.size / 6 + swayOffset)
            ctx.closePath()
            ctx.fill()

            // Eye
            ctx.shadowBlur = 0
            ctx.globalAlpha = alpha * 0.85
            ctx.fillStyle = BG
            ctx.beginPath()
            ctx.arc(f.size * 0.25, -f.size * 0.08, f.size * 0.07, 0, Math.PI * 2)
            ctx.fill()

            ctx.restore()

            // Catch-ring pulse when caught
            if (f.caught && f.catchAnim < 1) {
                ctx.save()
                ctx.globalAlpha = Math.max(0, 0.8 - f.catchAnim)
                ctx.strokeStyle = CYAN
                ctx.lineWidth = 3
                ctx.shadowBlur = 20
                ctx.shadowColor = CYAN
                ctx.beginPath()
                ctx.arc(f.x, f.y, f.size * 0.6 + f.catchAnim * 80, 0, Math.PI * 2)
                ctx.stroke()
                ctx.restore()
            }
        }

        const drawRipples = () => {
            ripplesRef.current = ripplesRef.current.filter(r => {
                r.radius += 5
                r.opacity *= 0.94
                if (r.opacity < 0.005) return false
                ctx.save()
                ctx.globalAlpha = r.opacity
                ctx.strokeStyle = CYAN_DIM
                ctx.lineWidth = 1.5
                ctx.beginPath()
                ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
                ctx.stroke()
                ctx.restore()
                return true
            })
        }

        const drawOctopus = () => {
            if (!logoRef.current) return
            const glow = glowRef.current

            if (glow.active) {
                glow.progress += 0.02 * glow.dir
                if (glow.progress >= 1) { glow.progress = 1; glow.dir = -1 }
                if (glow.progress <= 0) { glow.progress = 0; glow.active = false; glow.dir = 1 }
            }

            const baseAlpha = 0.12
            const peakAlpha = 0.38
            const glowAlpha = baseAlpha + Math.sin(glow.progress * Math.PI) * (peakAlpha - baseAlpha)
            const s = Math.min(w, h) * 1.0

            ctx.save()
            ctx.globalAlpha = glowAlpha
            // Force cyan tint: invert → sepia → hue-rotate to cyan
            ctx.filter = 'invert(1) sepia(1) saturate(20) hue-rotate(160deg)'
            ctx.shadowBlur = 60
            ctx.shadowColor = CYAN
            ctx.drawImage(logoRef.current, w / 2 - s / 2, h / 2 - s / 2, s, s)

            // Second halo pass at peak
            if (glow.active && glow.progress > 0.4) {
                ctx.globalAlpha = Math.sin(glow.progress * Math.PI) * 0.14
                ctx.drawImage(logoRef.current, w / 2 - s / 2 - 12, h / 2 - s / 2 - 12, s + 24, s + 24)
            }

            ctx.filter = 'none'
            ctx.restore()
        }

        const drawHole = () => {
            // Draw subtle cursor "hole" — a radial gradient void around the mouse
            const mx = mouseRef.current.x
            const my = mouseRef.current.y
            if (mx < 0 || my < 0) return

            const grad = ctx.createRadialGradient(mx, my, 0, mx, my, 70)
            grad.addColorStop(0, 'rgba(2,6,23,0.7)')
            grad.addColorStop(0.4, 'rgba(0,242,255,0.06)')
            grad.addColorStop(1, 'rgba(0,0,0,0)')

            ctx.save()
            ctx.fillStyle = grad
            ctx.beginPath()
            ctx.arc(mx, my, 70, 0, Math.PI * 2)
            ctx.fill()

            // Cursor ring
            ctx.globalAlpha = 0.5
            ctx.strokeStyle = CYAN
            ctx.lineWidth = 1.5
            ctx.shadowBlur = 10
            ctx.shadowColor = CYAN
            ctx.beginPath()
            ctx.arc(mx, my, CATCH_RADIUS, 0, Math.PI * 2)
            ctx.stroke()
            ctx.restore()
        }

        // ── Animation loop ───────────────────────────────────────────────────

        const animate = () => {
            ctx.fillStyle = BG
            ctx.fillRect(0, 0, w, h)

            drawOctopus()
            drawRipples()

            const mx = mouseRef.current.x
            const my = mouseRef.current.y
            const isPlaying = phaseRef.current === 'playing'

            fishRef.current.forEach(f => {
                if (f.caught) {
                    f.catchAnim = Math.min(1, f.catchAnim + 0.04)
                    drawFish(f)
                    return
                }

                // Fish AI update
                f.sway += 0.04 + f.speed * 0.02

                const dx = mx - f.x
                const dy = my - f.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                // Flee trigger
                if (dist < 100 && !f.fleeing) {
                    f.fleeing = true
                    f.fleeDistance = 0
                    f.speed = 11
                    f.targetAngle = Math.atan2(f.y - my, f.x - mx)
                    f.angle = f.targetAngle
                }

                if (f.fleeing) {
                    f.fleeDistance += f.speed
                    if (f.fleeDistance > 700) f.fleeing = false
                } else {
                    if (f.speed > f.baseSpeed) {
                        f.speed *= 0.95
                    } else {
                        f.speed = f.baseSpeed
                        if (Math.random() < 0.005) f.targetAngle += (Math.random() - 0.5) * 3
                    }
                    if (dist < 250) {
                        const avoid = Math.atan2(f.y - my, f.x - mx)
                        f.targetAngle += angleDiff(avoid, f.angle) * 0.08
                    }
                }

                f.angle += angleDiff(f.targetAngle, f.angle) * f.turnSpeed
                const actual = f.angle + Math.sin(f.sway) * 0.05
                f.x += Math.cos(actual) * f.speed
                f.y += Math.sin(actual) * f.speed

                // Wrap
                const m = f.size
                if (f.x < -m) f.x = w + m
                if (f.x > w + m) f.x = -m
                if (f.y < -m) f.y = h + m
                if (f.y > h + m) f.y = -m

                drawFish(f)

                // Catch check (game mode only)
                if (isPlaying && dist < CATCH_RADIUS) {
                    f.caught = true
                    scoreRef.current += 1
                    setScore(scoreRef.current)
                    // Ripple burst on catch
                    ripplesRef.current.push({ x: f.x, y: f.y, radius: 10, opacity: 0.9, speed: 5 })
                    ripplesRef.current.push({ x: f.x, y: f.y, radius: 30, opacity: 0.6, speed: 5 })
                }
            })

            // Respawn caught fish after anim completes (only in game mode)
            if (isPlaying) {
                fishRef.current = fishRef.current.map(f => {
                    if (f.caught && f.catchAnim >= 1) {
                        return makeFish(w, h, nextId.current++)
                    }
                    return f
                })
            }

            if (isPlaying) drawHole()

            rafRef.current = requestAnimationFrame(animate)
        }

        init()
        animate()

        const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY } }
        const onTouch = (e: TouchEvent) => {
            if (e.touches[0]) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
            }
        }
        const onResize = () => init()

        window.addEventListener('mousemove', onMove)
        window.addEventListener('touchmove', onTouch, { passive: true })
        window.addEventListener('resize', onResize)

        return () => {
            clearTimeout(glowTO)
            cancelAnimationFrame(rafRef.current)
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('touchmove', onTouch)
            window.removeEventListener('resize', onResize)
        }
    }, [])

    // ── Game controls ────────────────────────────────────────────────────────

    const startGame = useCallback(() => {
        scoreRef.current = 0
        setScore(0)
        setTimeLeft(GAME_DURATION)
        phaseRef.current = 'playing'
        setPhase('playing')

        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current!)
                    phaseRef.current = 'done'
                    setPhase('done')
                    setBestScore(b => Math.max(b, scoreRef.current))
                    return 0
                }
                return t - 1
            })
        }, 1000)
    }, [])

    const resetGame = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current)
        phaseRef.current = 'idle'
        setPhase('idle')
        setScore(0)
        setTimeLeft(GAME_DURATION)
    }, [])

    // ─── HUD ─────────────────────────────────────────────────────────────────

    return (
        <div className="relative w-full h-screen overflow-hidden" style={{ cursor: phase === 'playing' ? 'none' : 'default' }}>
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            {/* ── IDLE screen ───────────────────────────────────────────────── */}
            {phase === 'idle' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto text-center px-6 py-10 rounded-2xl border border-[#00f2ff]/20 bg-black/60 backdrop-blur-md max-w-md w-full mx-4 shadow-[0_0_60px_rgba(0,242,255,0.12)]">
                        <p className="text-[#00f2ff] font-mono text-xs uppercase tracking-[0.3em] mb-3 opacity-70">OCTOPLANS AQUARIUM</p>
                        <h1 className="text-5xl font-black font-mono text-white mb-2 tracking-tighter">
                            FISH<span className="text-[#00f2ff]">HUNT</span>
                        </h1>
                        <p className="text-gray-400 font-mono text-sm mb-8 leading-relaxed">
                            Move your cursor over fish to catch them.<br />
                            You have <span className="text-[#00f2ff] font-bold">60 seconds</span>. How many can you catch?
                        </p>
                        {bestScore > 0 && (
                            <p className="text-[#00f2ff]/60 font-mono text-xs mb-4">
                                BEST: <span className="text-[#00f2ff] font-bold text-sm">{bestScore}</span>
                            </p>
                        )}
                        <button
                            onClick={startGame}
                            className="w-full bg-[#00f2ff] hover:bg-white text-black font-black font-mono py-4 tracking-widest uppercase text-base transition-all hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]"
                        >
                            START →
                        </button>
                    </div>
                </div>
            )}

            {/* ── PLAYING HUD ───────────────────────────────────────────────── */}
            {phase === 'playing' && (
                <>
                    {/* Top bar */}
                    <div className="absolute top-20 left-0 right-0 flex justify-between items-start px-6 pointer-events-none">
                        <div className="bg-black/60 backdrop-blur border border-[#00f2ff]/20 px-5 py-3 rounded-xl">
                            <p className="text-[#00f2ff]/50 font-mono text-[10px] uppercase tracking-widest">CAUGHT</p>
                            <p className="text-[#00f2ff] font-black font-mono text-4xl leading-none">{score}</p>
                        </div>

                        <div className="bg-black/60 backdrop-blur border border-[#00f2ff]/20 px-5 py-3 rounded-xl text-right">
                            <p className="text-[#00f2ff]/50 font-mono text-[10px] uppercase tracking-widest">TIME</p>
                            <p className={`font-black font-mono text-4xl leading-none transition-colors ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-[#00f2ff]'}`}>
                                {timeLeft}s
                            </p>
                        </div>
                    </div>

                    {/* Quit button */}
                    <button
                        onClick={resetGame}
                        className="pointer-events-auto absolute bottom-8 left-1/2 -translate-x-1/2 border border-[#00f2ff]/20 text-[#00f2ff]/40 hover:text-[#00f2ff] font-mono text-xs uppercase tracking-widest px-6 py-2 transition-colors bg-black/30 backdrop-blur rounded"
                    >
                        Quit
                    </button>
                </>
            )}

            {/* ── DONE screen ───────────────────────────────────────────────── */}
            {phase === 'done' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="pointer-events-auto text-center px-8 py-10 rounded-2xl border border-[#00f2ff]/30 bg-black/70 backdrop-blur-md max-w-sm w-full mx-4 shadow-[0_0_80px_rgba(0,242,255,0.15)]">
                        <p className="text-[#00f2ff] font-mono text-xs uppercase tracking-[0.3em] mb-4 opacity-70">TIME'S UP</p>

                        <p className="text-gray-400 font-mono text-sm mb-1">You caught</p>
                        <p className="text-[#00f2ff] font-black font-mono text-7xl leading-none mb-1">{score}</p>
                        <p className="text-gray-400 font-mono text-sm mb-6">fish</p>

                        {score === bestScore && bestScore > 0 && (
                            <p className="text-yellow-400 font-mono text-xs uppercase tracking-widest mb-6">
                                🏆 New Best Score!
                            </p>
                        )}
                        {bestScore > 0 && score < bestScore && (
                            <p className="text-[#00f2ff]/50 font-mono text-xs mb-6">
                                Best: {bestScore}
                            </p>
                        )}

                        <div className="space-y-3">
                            <button
                                onClick={startGame}
                                className="w-full bg-[#00f2ff] hover:bg-white text-black font-black font-mono py-3 tracking-widest uppercase text-sm transition-all hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]"
                            >
                                Play Again
                            </button>
                            <button
                                onClick={resetGame}
                                className="w-full border border-[#00f2ff]/20 text-[#00f2ff]/60 hover:text-[#00f2ff] font-mono text-xs uppercase tracking-widest py-3 transition-colors"
                            >
                                Watch Aquarium
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
