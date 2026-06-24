import type { Metadata } from 'next'
import { Poppins, Lora } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from "@/components/theme-provider"
import CustomCursor from "@/components/CustomCursor"
import { GlobalProtection } from "@/components/GlobalProtection"
import AmbientAudio from '@/components/AmbientAudio'
import AnnouncementBar from '@/components/AnnouncementBar'
import { getActiveAnnouncements } from '@/app/actions'
import { getSession } from '@/lib/auth'

const poppins = Poppins({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    variable: '--font-poppins',
})

const lora = Lora({
    subsets: ['latin'],
    weight: ['400', '500', '600', '700'],
    style: ['normal', 'italic'],
    variable: '--font-lora',
})

export const metadata: Metadata = {
    title: 'Octoplans - Architectural Design Marketplace',
    description: 'Premium architectural blueprints, precision plans, and AI concepts by Octoplans.',
}

import { Providers } from "@/components/providers"
import GuidedChatbot from "@/components/GuidedChatbot"
import { PushNotificationProvider } from '@/components/PushNotificationProvider'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/MobileBottomNav'

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [announcements, session] = await Promise.all([
        getActiveAnnouncements(),
        getSession(),
    ])
    const isAdmin = session?.user?.email === 'frankensteingary777@gmail.com'

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${poppins.variable} ${lora.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-[#00f2ff]/30`}>
                <Providers>
                    <PushNotificationProvider>
                        <ThemeProvider
                            attribute="class"
                            defaultTheme="light"
                            enableSystem={true}
                            disableTransitionOnChange
                        >
                            <CustomCursor />
                            <GlobalProtection />
                            <AmbientAudio />
                            <Navbar />
                            {announcements.length > 0 && (
                                <AnnouncementBar announcements={announcements} isAdmin={isAdmin} />
                            )}
                            <GuidedChatbot />
                            <main className="pt-16 flex-grow">
                                {children}
                            </main>
                            <MobileBottomNav />
                            <Footer />
                        </ThemeProvider>
                    </PushNotificationProvider>
                </Providers>
            </body>
        </html>
    )
}

