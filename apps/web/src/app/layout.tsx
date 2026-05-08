import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/layout/Providers'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: { default: 'Prode Mundial 2026', template: '%s | Prode Mundial 2026' },
  description: 'El prode del Mundial para tu comercio. Gratis, personalizado y listo en 5 minutos.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
}

export const viewport: Viewport = {
  themeColor: '#002B72',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
