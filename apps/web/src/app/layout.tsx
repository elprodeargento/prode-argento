import type { Metadata, Viewport } from 'next'
import { Providers } from '@/components/layout/Providers'
import { IOSInstallBanner } from '@/components/layout/IOSInstallBanner'
import { WhatsAppSupportButton } from '@/components/layout/WhatsAppSupportButton'
import { GoogleAnalytics } from '@next/third-parties/google'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'elprode.ar — Prode del Mundial 2026 para comercios',
    template: '%s | elprode.ar'
  },
  description: 'Creá el prode del Mundial 2026 con la imagen de tu comercio. Fidelizá clientes, generá visitas y aumentá tus ventas. Gratis, listo en 5 minutos.',
  keywords: ['prode mundial 2026', 'prode para comercios', 'fidelización clientes', 'mundial 2026 argentina', 'prode online gratis', 'marketing para comercios'],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://elprode.ar'),
  openGraph: {
    type: 'website',
    locale: 'es_AR',
    url: 'https://elprode.ar',
    siteName: 'elprode.ar',
    title: 'elprode.ar — Prode del Mundial 2026 para tu comercio',
    description: 'Tus clientes juegan, vos vendés más. Creá tu prode gratis en 5 minutos.',
    images: [
      {
        url: '/og-icon-nuevo.png',
        width: 512,
        height: 512,
        alt: 'elprode.ar',
      }
    ],
  },
  twitter: {
    card: 'summary',
    title: 'elprode.ar — Prode del Mundial 2026 para tu comercio',
    description: 'Tus clientes juegan, vos vendés más.',
    images: ['/og-icon-nuevo.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-nuevo-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-nuevo.png', sizes: '180x180' },
    ],
  },
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
        <link rel="icon" type="image/png" href="/favicon-nuevo-96x96.png" sizes="96x96" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-nuevo.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased bg-slate-50 text-slate-900">
        <Providers>
          {children}
          <IOSInstallBanner />
          <WhatsAppSupportButton />
        </Providers>
        <GoogleAnalytics gaId="G-EDEPKXWE2M" />
      </body>
    </html>
  )
}
