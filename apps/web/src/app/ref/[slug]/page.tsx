import { redirect } from 'next/navigation'
import { LandingHeader } from '@/components/marketing/LandingHeader'
import { LandingHero } from '@/components/marketing/LandingHero'
import { LandingProblem } from '@/components/marketing/LandingProblem'
import { LandingFeatures } from '@/components/marketing/LandingFeatures'
import { LandingHowItWorks } from '@/components/marketing/LandingHowItWorks'
import { LandingPricing } from '@/components/marketing/LandingPricing'
import { LandingCTA } from '@/components/marketing/LandingCTA'
import { RefCookieSetter } from './RefCookieSetter'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

async function getBusiness(slug: string) {
  try {
    const res = await fetch(`${API_URL}/businesses/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function RefPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const business = await getBusiness(slug)

  if (!business) redirect('/')

  return (
    <>
      <RefCookieSetter slug={slug} />
      <div className="fixed top-0 left-0 right-0 z-[60] bg-[#F5C518] text-[#002B72] text-center py-2.5 px-4 text-[13px] font-black">
        🎁 <span className="font-black">{business.name}</span> te invitó a crear tu prode — registrate y empezá gratis
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
