import type { Metadata } from 'next'
import { LandingHeader } from '@/components/marketing/LandingHeader'
import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingProblem } from '@/components/marketing/LandingProblem'
import { LandingFeatures } from '@/components/marketing/LandingFeatures'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingReferidos } from '@/components/marketing/LandingReferidos'
import { LandingPricing } from '@/components/marketing/LandingPricing'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export const metadata: Metadata = {
  title: 'elprode.ar — Prode del Mundial 2026 para comercios',
  description: 'Creá el prode del Mundial 2026 con la imagen de tu comercio. Fidelizá clientes, generá visitas y aumentá tus ventas. Gratis, listo en 5 minutos.',
  openGraph: {
    title: 'elprode.ar — Prode del Mundial 2026 para tu comercio',
    description: 'Tus clientes juegan, vos vendés más. Creá tu prode gratis en 5 minutos.',
    url: 'https://elprode.ar',
    images: [{ url: '/og-icon-nuevo.png', width: 512, height: 512 }],
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <LandingHero />
      <LandingProblem />
      <LandingFeatures />
      <LandingReferidos />
      <LandingHowItWorks />
      <LandingPricing />
      <LandingCTA />
    </main>
  )
}
