import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { StaffAuthProvider } from '@/contexts/StaffAuthContext'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Cleanoo - Professional Cleaning Services',
  description: 'Professional cleaning services for homes and offices. Book your cleaning service today!',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StaffAuthProvider>
            <LanguageProvider>
              {/* Global header with clickable logo to go home */}
              <header className="bg-white/80 backdrop-blur border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center">
                  <Link href="/" className="inline-flex items-center group">
                    <Sparkles className="h-7 w-7 text-blue-600 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-gray-900 group-hover:text-blue-700">Cleanoo</span>
                  </Link>
                </div>
              </header>
              {children}
              <Toaster />
            </LanguageProvider>
          </StaffAuthProvider>
        </AuthProvider>
      </body>
    </html>
  )
} 