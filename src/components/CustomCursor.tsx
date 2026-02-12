"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isVisible) setIsVisible(true)
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
            }
        }

        const onMouseDown = () => {
            if (cursorRef.current) {
                cursorRef.current.style.transform += ` scale(0.8)`
            }
        }

        const onMouseUp = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(1)`
            }
        }

        const onMouseEnter = () => setIsVisible(true)
        const onMouseLeave = () => setIsVisible(false)

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        document.body.addEventListener('mouseenter', onMouseEnter)
        document.body.addEventListener('mouseleave', onMouseLeave)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
            document.body.removeEventListener('mouseenter', onMouseEnter)
            document.body.removeEventListener('mouseleave', onMouseLeave)
        }
    }, [isVisible])

    if (!isVisible) return null

    return (
        <div
            ref={cursorRef}
            className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 pointer-events-none z-[999999] -ml-4 -mt-4 transition-transform duration-75 ease-out flex items-center justify-center ${resolvedTheme === 'dark' ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.5)]' : 'border-indigo-600 bg-indigo-600/20'
                }`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${resolvedTheme === 'dark' ? 'bg-cyan-400' : 'bg-indigo-600'}`}></div>
        </div>
    )
}
