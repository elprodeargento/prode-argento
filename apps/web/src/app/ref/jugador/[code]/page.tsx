import { cookies } from 'next/headers'
import { LandingHeader } from '@/components/marketing/LandingHeader'
import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingProblem } from '@/components/marketing/LandingProblem'
import { LandingFeatures } from '@/components/marketing/LandingFeatures'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingPricing } from '@/components/marketing/LandingPricing'
import { LandingCTA } from '@/components/marketing/LandingCTA'

export default async function PlayerRefPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const cookieStore = await cookies()
  cookieStore.set('player_referral_code', code, {
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#F5C518] text-[#002B72] text-center py-2.5 px-4 text-[13px] font-black">
        🎁 <span className="font-black">{code}</span> te invitó a crear tu prode — registrate y empezá gratis
      </div>
      <main className="min-h-screen pt-10">
        <LandingHeader />
        <LandingHero />
        <LandingProblem />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPricing />
        <LandingCTA />
      </main>
    </>
  )
}
