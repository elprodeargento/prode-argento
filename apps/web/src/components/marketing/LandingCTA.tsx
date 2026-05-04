import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingCTA() {
  return (
    <section className="bg-[#002B72] py-16 px-6 text-center">
      <h2 className="font-bebas text-4xl text-white tracking-wide mb-3">¿LISTA TU EMPRESA?</h2>
      <p className="text-white/60 text-sm mb-8">El Mundial arranca pronto. No te quedes afuera.</p>
      <Link href="/empresa/registro">
        <Button size="lg" className="rounded-full font-black text-[#002B72] !bg-[#F5C518] hover:!bg-yellow-300">
          Crear mi prode gratis ⚽
        </Button>
      </Link>
    </section>
  )
}
