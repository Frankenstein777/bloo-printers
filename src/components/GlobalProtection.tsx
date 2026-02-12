'use client'

import { useEffect } from 'react'

export function GlobalProtection() {
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => {
            if (e.target instanceof HTMLImageElement) {
                e.preventDefault()
            }
        }

        const handleDragStart = (e: DragEvent) => {
            if (e.target instanceof HTMLImageElement) {
                e.preventDefault()
            }
        }

        document.addEventListener('contextmenu', handleContextMenu)
        document.addEventListener('dragstart', handleDragStart)

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu)
            document.removeEventListener('dragstart', handleDragStart)
        }
    }, [])

    return null
}
