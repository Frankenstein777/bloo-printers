"use client"

import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const [isTouchDevice, setIsTouchDevice] = useState(true) // start hidden, detect after mount
    const { resolvedTheme } = useTheme()

    useEffect(() => {
        // Detect touch device after mount so hooks always run in the same order
        const isTouch = window.matchMedia('(pointer: coarse)').matches
        setIsTouchDevice(isTouch)
        if (isTouch) return

        const onMouseMove = (e: MouseEvent) => {
            setIsVisible(true)
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`
            }
        }

        const onMouseDown = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(0.8)`
            }
        }

        const onMouseUp = (e: MouseEvent) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) scale(1)`
            }
        }

        const onMouseLeave = () => setIsVisible(false)
        const onMouseEnter = () => setIsVisible(true)

        window.addEventListener('mousemove', onMouseMove)
        window.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        document.documentElement.addEventListener('mouseleave', onMouseLeave)
        document.documentElement.addEventListener('mouseenter', onMouseEnter)

        return () => {
            window.removeEventListener('mousemove', onMouseMove)
            window.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
            document.documentElement.removeEventListener('mouseleave', onMouseLeave)
            document.documentElement.removeEventListener('mouseenter', onMouseEnter)
        }
    }, [])

    if (isTouchDevice) return null

    return (
        <div
            ref={cursorRef}
            style={{ opacity: isVisible ? 1 : 0 }}
            className={`fixed top-0 left-0 w-8 h-8 rounded-full border-2 pointer-events-none z-[2147483647] -ml-4 -mt-4 transition-opacity duration-150 flex items-center justify-center ${
                resolvedTheme === 'dark'
                    ? 'border-cyan-400 bg-cyan-400/20 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                    : 'border-indigo-600 bg-indigo-600/20'
            }`}
        >
            <div className={`w-1.5 h-1.5 rounded-full ${resolvedTheme === 'dark' ? 'bg-cyan-400' : 'bg-indigo-600'}`}></div>
        </div>
    )
}
