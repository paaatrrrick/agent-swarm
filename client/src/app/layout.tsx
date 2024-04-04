import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import { ErrorProvider } from '@/context/ErrorContext'
import { LoaderProvider } from '@/context/LoaderContext'
import { ThemeProvider } from '@/components/themeprovider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `Radah`,
  description: 'Deploy an agent that autonomously controls a computer in the click of a button',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} w-[100vw] h-[100vh]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ErrorProvider>
            <LoaderProvider>
              {children}
            </LoaderProvider>
          </ErrorProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
