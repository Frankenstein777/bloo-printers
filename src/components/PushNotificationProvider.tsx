'use client'

import { useEffect, useState } from 'react'
import { useToast } from './ToastProvider'

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
    const { toast } = useToast()
    const [permissionRequested, setPermissionRequested] = useState(false)

    useEffect(() => {
        // Request notification permissions for announcements if not already requested
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default' && !permissionRequested) {
                // We delay it slightly so it isn't too annoying on first load
                const timer = setTimeout(() => {
                    Notification.requestPermission().then(permission => {
                        if (permission === 'granted') {
                            toast('Push notifications enabled for latest design announcements!', 'success')
                        }
                    }).catch(err => console.error("Notification permission error:", err))
                    setPermissionRequested(true)
                }, 5000)

                return () => clearTimeout(timer)
            }
        }
    }, [permissionRequested, toast])

    return <>{children}</>
}
