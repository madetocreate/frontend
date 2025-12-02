import './css/style.css'

import { Inter } from 'next/font/google'
import Theme from './theme-provider'
import AppProvider from './app-provider'
import { Providers } from '@/components/Providers'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata = {
  title: 'Aklow – Digitale Assistenten',
  description: 'Deine digitalen Begleiter mit künstlicher Intelligenz und eigenem Memory.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={inter.variable} suppressHydrationWarning>
      <body className="font-inter antialiased bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400">
        <Theme>
          <AppProvider>
            <Providers>
              {children}
            </Providers>
          </AppProvider>
        </Theme>
      </body>
    </html>
  )
}
