"use client"

import React, { useEffect, useRef } from 'react'
import { useTheme } from 'next-themes'

// --- Types ---
interface Point {
    x: number
    y: number
}

// Adapted from user provided code
class Ripple {
    x: number
    y: number
    radius: number
    maxRadius: number
    opacity: number
    speed: number
    strength: number
    color: string

    constructor(x: number, y: number, isStrong: boolean, color: string) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = 3000
        this.opacity = isStrong ? 0.7 : 0.3
        this.speed = isStrong ? 14 : 7
        this.strength = isStrong ? 130 : 45
        this.color = color
    }

    update() {
        this.radius += this.speed
        this.strength *= 0.985
        this.opacity *= 0.992
        return this.strength > 0.1 && this.radius < this.maxRadius
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        // Convert rgba/hex to opacity control if needed
        // Assuming incoming color is rgba string like 'rgba(r,g,b,1)' or hex
        // We will just replace the alpha for simplicity if it matches standard patterns
        // but since we control colors, we can just use globalAlpha or constructed string
        ctx.globalAlpha = this.opacity
        ctx.strokeStyle = this.color
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.restore()
    }
}

class Fish {
    x: number
    y: number
    angle: number
    speed: number
    turnSpeed: number
    size: number
    targetAngle: number
    fleeing: boolean
    fleeDistance: number
    baseSpeed: number
    distToMouse: number
    sway: number
    color: string

    constructor(w: number, h: number, color: string) {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.angle = Math.random() * Math.PI * 2
        this.targetAngle = this.angle
        this.baseSpeed = 1.0
        this.speed = 1.0
        this.turnSpeed = 0.04
        // Varied sizes: 40px to 140px (Previous: 120-170)
        this.size = 40 + Math.random() * 100

        this.fleeing = false
        this.fleeDistance = 0
        this.sway = Math.random() * Math.PI * 2
        this.color = color
        this.distToMouse = 9999

        // Init base speed based on size (smaller = faster)
        this.baseSpeed = Math.max(0.6, 150 / this.size)
        this.speed = this.baseSpeed
    }

    // ... (update method unchanged)
    update(mouseX: number, mouseY: number, isClicking: boolean, w: number, h: number) {
        const dx = mouseX - this.x
        const dy = mouseY - this.y
        this.distToMouse = Math.sqrt(dx * dx + dy * dy)

        this.sway += 0.04 + (this.speed * 0.02) // Sway faster when moving fast

        // 1. Trigger Flee (Touch)
        // If cursor touches fish (approx 60px radius) and not already in full flight
        if (this.distToMouse < 80 && !this.fleeing) {
            this.fleeing = true
            this.fleeDistance = 0
            this.speed = 12 // RUN FAST!
            // Turn away immediately
            this.targetAngle = Math.atan2(this.y - mouseY, this.x - mouseX)
            this.angle = this.targetAngle // Snap turn for responsiveness
        }

        // 2. Flee Logic
        if (this.fleeing) {
            // Dash away
            this.fleeDistance += this.speed

            // Check if we fled enough (800px)
            if (this.fleeDistance > 800) {
                this.fleeing = false // Calm down
            }
        } else {
            // 3. Normal Behavior or Return to Normal
            if (this.speed > this.baseSpeed) {
                this.speed *= 0.95 // Decelerate smoothly
            } else {
                this.speed = this.baseSpeed // Maintain cruise

                // Random wander
                if (Math.random() < 0.005) {
                    this.targetAngle += (Math.random() - 0.5) * 3
                }
            }

            // Soft avoid mouse if close but not touching (optional, keeps them skittish)
            if (this.distToMouse < 200) {
                const avoidAngle = Math.atan2(this.y - mouseY, this.x - mouseX)
                // Gently steer away
                let diff = avoidAngle - this.angle
                while (diff < -Math.PI) diff += Math.PI * 2
                while (diff > Math.PI) diff -= Math.PI * 2
                this.targetAngle += diff * 0.1
            }
        }

        let diff = this.targetAngle - this.angle
        while (diff < -Math.PI) diff += Math.PI * 2
        while (diff > Math.PI) diff -= Math.PI * 2
        this.angle += diff * this.turnSpeed

        const actualAngle = this.angle + Math.sin(this.sway) * 0.05
        this.x += Math.cos(actualAngle) * this.speed
        this.y += Math.sin(actualAngle) * this.speed

        const margin = this.size
        if (this.x < -margin) this.x = w + margin
        if (this.x > w + margin) this.x = -margin
        if (this.y < -margin) this.y = h + margin
        if (this.y > h + margin) this.y = -margin
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.angle)

        // Shadow for depth
        ctx.shadowBlur = 40
        ctx.shadowColor = 'rgba(0,0,0,0.2)'

        const swayOffset = Math.sin(this.sway) * (this.size * 0.1)

        // Subtle silhouette look
        ctx.globalAlpha = 0.6
        ctx.fillStyle = this.color

        // Body (Quadratic Curve from user example)
        ctx.beginPath()
        ctx.moveTo(this.size / 2, 0)
        ctx.quadraticCurveTo(-this.size / 2, this.size / 4, -this.size / 2, swayOffset)
        ctx.quadraticCurveTo(-this.size / 2, -this.size / 4, this.size / 2, 0)
        ctx.fill()

        // Tail
        ctx.beginPath()
        ctx.moveTo(-this.size / 2, swayOffset)
        ctx.lineTo(-this.size * 0.8, (this.size / 6) + swayOffset)
        ctx.lineTo(-this.size * 0.7, swayOffset)
        ctx.lineTo(-this.size * 0.8, (-this.size / 6) + swayOffset)
        ctx.closePath()
        ctx.fill()

        ctx.restore()
    }
}

class Particle {
    x: number
    y: number
    originX: number
    originY: number
    vx: number
    vy: number
    baseLength: number
    size: number
    currentSpeed: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.originX = x
        this.originY = y
        this.vx = 0
        this.vy = 0
        this.size = 1.8
        this.baseLength = 6 + Math.random() * 8
        this.currentSpeed = 0
    }

    update(mouse: { x: number; y: number }, ripples: Ripple[], fish: Fish[], scrollOffset: number, width: number, height: number) {
        const displayY = (this.originY - scrollOffset) % (height + 100)
        const finalY = displayY < -50 ? displayY + height + 100 : displayY;

        this.x = this.originX + this.vx
        this.y = finalY + this.vy

        const dx = mouse.x - this.x
        const dy = mouse.y - this.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const forceDist = 350

        // Mouse Repulsion (Normal)
        if (dist < forceDist) {
            const force = (forceDist - dist) / forceDist
            const angle = Math.atan2(dy, dx)
            const push = force * 5
            this.vx -= Math.cos(angle) * push
            this.vy -= Math.sin(angle) * push
        }

        // Ripple Influence
        ripples.forEach(ripple => {
            const rx = this.x - ripple.x
            const ry = this.y - ripple.y
            const rDist = Math.sqrt(rx * rx + ry * ry)
            const waveWidth = 80

            if (Math.abs(rDist - ripple.radius) < waveWidth) {
                const rAngle = Math.atan2(ry, rx)
                const rForce = (ripple.strength / 7) * (1 - Math.abs(rDist - ripple.radius) / waveWidth)
                this.vx += Math.cos(rAngle) * rForce
                this.vy += Math.sin(rAngle) * rForce
            }
        })

        // Fish Displacement (New Logic)
        fish.forEach(f => {
            const fx = this.x - f.x
            const fy = this.y - f.y
            const fDist = Math.sqrt(fx * fx + fy * fy)
            const fishRadius = f.size * 0.6 // AOE roughly half size

            if (fDist < fishRadius) {
                const fAngle = Math.atan2(fy, fx)
                const fForce = ((fishRadius - fDist) / fishRadius) * 2
                this.vx += Math.cos(fAngle) * fForce
                this.vy += Math.sin(fAngle) * fForce
            }
        })

        this.vx *= 0.91 // Damping
        this.vy *= 0.91
        this.currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy)
    }

    draw(ctx: CanvasRenderingContext2D, mouse: { x: number; y: number }, themeColor: string) {
        const angleToMouse = Math.atan2(mouse.y - this.y, mouse.x - this.x)
        const distToMouse = Math.sqrt((mouse.x - this.x) ** 2 + (mouse.y - this.y) ** 2)
        const focusBoost = Math.max(0, 1 - distToMouse / 500)
        const motionIntensity = Math.min(this.currentSpeed / 6, 1)
        const combinedIntensity = Math.max(motionIntensity, focusBoost)

        const alpha = Math.max(0.1, 0.8 * combinedIntensity)

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(angleToMouse)

        ctx.globalAlpha = alpha
        ctx.strokeStyle = themeColor
        ctx.fillStyle = themeColor
        ctx.lineWidth = this.size

        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(this.baseLength * (1 + combinedIntensity * 0.5), 0)
        ctx.stroke()

        ctx.restore()
    }
}

export function AquariumBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { resolvedTheme } = useTheme()

    // Using refs for mutable game state
    const particlesRef = useRef<Particle[]>([])
    const fishRef = useRef<Fish[]>([])
    const ripplesRef = useRef<Ripple[]>([])
    const mouseRef = useRef({ x: -9999, y: -9999, isClicking: false })
    const lastMousePos = useRef({ x: -9999, y: -9999 })
    const mouseIdleTime = useRef(0)
    const scrollY = useRef(0)
    const logoImgRef = useRef<HTMLImageElement | null>(null)
    // Glow animation state: phase 0=idle, 1=glowing
    const glowRef = useRef({ active: false, progress: 0, direction: 1 })

    // Pre-load octopus SVG as bitmap for canvas drawing
    useEffect(() => {
        const img = new window.Image()
        img.src = '/logo.svg'
        img.onload = () => { logoImgRef.current = img }

        // Schedule random glow pulses every 2-5 seconds
        let glowTimeout: ReturnType<typeof setTimeout>
        const scheduleGlow = () => {
            const delay = 2000 + Math.random() * 3000
            glowTimeout = setTimeout(() => {
                glowRef.current = { active: true, progress: 0, direction: 1 }
                scheduleGlow()
            }, delay)
        }
        scheduleGlow()
        return () => clearTimeout(glowTimeout)
    }, [])

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number
        let width = 0
        let height = 0
        let rippleTimeout: number

        // Color Palette
        // Color Palette
        const getColors = () => {
            const isDark = true // Enforced Dark Mode
            return {
                particle: 'rgba(56, 189, 248, 0.2)', // Sky-400, very faint
                bg: '#020617', // Slate-950 (Deep Ocean)
                ripple: 'rgba(56, 189, 248, 0.05)',
                fish: '#0f172a' // Slate-900 (Just slightly lighter than bg)
            }
        }

        const init = () => {
            width = window.innerWidth
            height = window.innerHeight

            // DPR handling
            const dpr = window.devicePixelRatio || 1
            canvas.width = width * dpr
            canvas.height = height * dpr
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`
            ctx.scale(dpr, dpr)

            // Init Particles
            particlesRef.current = []
            const gap = 45
            const cols = Math.ceil(width / gap) + 1
            const rows = Math.ceil(height / gap) + 1

            for (let x = 0; x < cols; x++) {
                for (let y = 0; y < rows; y++) {
                    particlesRef.current.push(new Particle(x * gap, y * gap))
                }
            }

            // Init Fish
            const colors = getColors()
            fishRef.current = []
            for (let k = 0; k < 15; k++) {
                fishRef.current.push(new Fish(width, height, colors.fish))
            }
        }

        const autoRipple = () => {
            const colors = getColors()
            ripplesRef.current.push(new Ripple(
                Math.random() * width,
                Math.random() * height,
                false,
                colors.ripple
            ))
            const nextDelay = 5000 + Math.random() * 7000
            rippleTimeout = window.setTimeout(autoRipple, nextDelay)
        }

        const animate = () => {
            const colors = getColors()

            // Clear and BG
            ctx.fillStyle = colors.bg
            ctx.fillRect(0, 0, width, height)

            const scrollOffset = scrollY.current * 0.3

            // Update & Draw Fish
            fishRef.current.forEach(f => {
                f.color = colors.fish // Ensure theme update
                f.update(mouseRef.current.x, mouseRef.current.y, mouseRef.current.isClicking, width, height)
                f.draw(ctx)
            })

            // Update & Draw Ripples
            ripplesRef.current = ripplesRef.current.filter(r => {
                const active = r.update()
                if (active) r.draw(ctx)
                return active
            })

            // Draw single centred octopus with glow pulse
            if (logoImgRef.current) {
                const logo = logoImgRef.current
                const glow = glowRef.current

                // Advance glow animation (~60fps: 0→1 in ~45 frames = ~0.75s up, 0.75s down)
                if (glow.active) {
                    glow.progress += 0.022 * glow.direction
                    if (glow.progress >= 1) { glow.progress = 1; glow.direction = -1 }
                    if (glow.progress <= 0) { glow.progress = 0; glow.active = false; glow.direction = 1 }
                }

                // Opacity: 0.04 baseline → up to 0.18 at peak glow
                const glowAlpha = 0.04 + Math.sin(glow.progress * Math.PI) * 0.14

                ctx.save()
                ctx.globalAlpha = glowAlpha
                ctx.filter = 'invert(1)'
                const s = Math.min(width, height) * 1.04
                ctx.drawImage(logo, width / 2 - s / 2, height / 2 - s / 2, s, s)

                // Extra cyan glow halo at peak
                if (glow.active && glow.progress > 0.3) {
                    ctx.globalAlpha = Math.sin(glow.progress * Math.PI) * 0.07
                    ctx.filter = 'invert(1) sepia(1) saturate(10) hue-rotate(160deg)'
                    ctx.drawImage(logo, width / 2 - s / 2 - 8, height / 2 - s / 2 - 8, s + 16, s + 16)
                }

                ctx.filter = 'none'
                ctx.restore()
            }

            // ... (inside animate loop)

            // Track Mouse Velocity / Idle
            const dx = mouseRef.current.x - lastMousePos.current.x
            const dy = mouseRef.current.y - lastMousePos.current.y
            const distMoved = Math.sqrt(dx * dx + dy * dy)

            if (distMoved < 3) {
                mouseIdleTime.current += 1
            } else {
                mouseIdleTime.current = 0
            }
            lastMousePos.current = { x: mouseRef.current.x, y: mouseRef.current.y }

            // Spawn Idle Ripples (Continuous visual waves)
            if (mouseIdleTime.current > 30 && mouseIdleTime.current % 40 === 0) {
                const colors = getColors()
                // Spawn slow ripple
                const r = new Ripple(mouseRef.current.x, mouseRef.current.y, false, colors.ripple)
                r.speed = 2.5 // Slower than normal (7-14)
                r.strength = 200 // Visible push
                ripplesRef.current.push(r)
            }

            // Update & Draw Particles
            particlesRef.current.forEach(p => {
                p.update(mouseRef.current, ripplesRef.current, fishRef.current, scrollOffset, width, height)
                p.draw(ctx, mouseRef.current, colors.particle)
            })
            // ...

            animationFrameId = requestAnimationFrame(animate)
        }

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX
            mouseRef.current.y = e.clientY
        }

        const handleMouseDown = (e: MouseEvent) => {
            mouseRef.current.isClicking = true
            const colors = getColors()
            ripplesRef.current.push(new Ripple(e.clientX, e.clientY, true, colors.ripple))
            setTimeout(() => { mouseRef.current.isClicking = false }, 200)
        }

        const handleScroll = () => {
            scrollY.current = window.scrollY
        }

        const handleResize = () => {
            init()
        }

        init()
        animate()
        autoRipple()

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mousedown', handleMouseDown)
        window.addEventListener('resize', handleResize)
        window.addEventListener('scroll', handleScroll)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mousedown', handleMouseDown)
            window.removeEventListener('resize', handleResize)
            window.removeEventListener('scroll', handleScroll)
            clearTimeout(rippleTimeout)
            cancelAnimationFrame(animationFrameId)
        }
    }, [])

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed top-0 left-0 w-full h-full pointer-events-none -z-20"
            />
            {/* Glass Blur Overlay */}
            <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 backdrop-blur-[1px] bg-white/5 dark:bg-black/10 transition-colors duration-500" />
        </>
    )
}
