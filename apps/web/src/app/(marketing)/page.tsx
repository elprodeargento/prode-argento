import { LandingHeader } from '@/components/marketing/LandingHeader'
import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingProblem } from '@/components/marketing/LandingProblem'
import { LandingFeatures } from '@/components/marketing/LandingFeatures'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingReferidos } from '@/components/marketing/LandingReferidos'
import { LandingPricing } from '@/components/marketing/LandingPricing'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <LandingHero />
      <LandingProblem />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingReferidos />
      <LandingPricing />
      <LandingCTA />
    </main>
  )
}
