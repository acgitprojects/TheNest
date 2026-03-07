import type { Metadata } from 'next'
import { Noto_Sans_TC, Noto_Serif_TC } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const notoSans = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
})

const notoSerif = Noto_Serif_TC({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-noto-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'The Nest | 雀巢',
  description: '旺角派對室預訂系統',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" className={`${notoSans.variable} ${notoSerif.variable}`}>
      <body className="font-sans bg-bg text-text-main antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#3C3C3C',
              color: '#F5F1E8',
              fontFamily: 'var(--font-noto-sans)',
              borderRadius: '12px',
              padding: '12px 20px',
            },
            success: {
              iconTheme: { primary: '#A8D5A2', secondary: '#3C3C3C' },
            },
            error: {
              iconTheme: { primary: '#E8704A', secondary: '#F5F1E8' },
            },
          }}
        />
      </body>
    </html>
  )
}
