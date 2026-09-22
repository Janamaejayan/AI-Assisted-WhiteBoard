import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import type { Metadata } from 'next'
import Provider from './Provider'
import { Geist } from 'next/font/google'
import { Toaster } from '@/components/ui/toast'

const geist = Geist({
    variable: '--font-geist',
    subsets: ['latin'],
})

export const metadata: Metadata = {
    title: 'AI Whiteboard',
    description: 'AI powered collaborative whiteboard',
}

const isClerkConfigured =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    if (!isClerkConfigured) {
        return (
            <html
                lang="en"
                suppressHydrationWarning
            >
                <body className={geist.variable}>
                    {children}
                </body>
            </html>
        )
    }

    return (
        <ClerkProvider>
            <html lang="en">
                <body className={geist.variable}>
                    <Provider>
                        {children}
                    </Provider>

                    <Toaster />
                </body>
            </html>
        </ClerkProvider>
    )
}