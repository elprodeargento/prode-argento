import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingProblem } from '@/components/marketing/LandingProblem'
import { LandingFeatures } from '@/components/marketing/LandingFeatures'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingHero />
      <LandingProblem />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingCTA />
    </main>
  )
}
