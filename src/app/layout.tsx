import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'
import './globals.css'

export const metadata: Metadata = {
  title: 'Teacher Portal – Classroom Command Center',
  description: 'Upload books, extract topics, present infographics beautifully.',
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e3a2f',
              color: '#faf8f3',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#f59e0b',
                secondary: '#1e3a2f',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#faf8f3',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
