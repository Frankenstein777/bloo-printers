import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from "@/components/theme-provider"
import { AquariumBackground } from "@/components/aquarium-background"
import CustomCursor from "@/components/CustomCursor"
import { GlobalProtection } from "@/components/GlobalProtection"
import AmbientAudio from '@/components/AmbientAudio'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Octoplans - Architectural Design Marketplace',
    description: 'Premium architectural blueprints, precision plans, and AI concepts by Octoplans.',
}

import { Providers } from "@/components/providers"

import GuidedChatbot from "@/components/GuidedChatbot"

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        forcedTheme="dark"
                        enableSystem={false}
                        disableTransitionOnChange
                    >
                        <AquariumBackground />
                        <CustomCursor />
                        <GlobalProtection />
                        <AmbientAudio />
                        <Navbar />
                        <GuidedChatbot />
                        <main className="pt-16">
                            {children}
                        </main>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    )
}
