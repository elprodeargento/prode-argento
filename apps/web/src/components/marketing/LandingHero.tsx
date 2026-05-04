'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingHero() {
  return (
    <section className="relative bg-[#002B72] overflow-hidden min-h-[80vh] flex items-center">
      <div className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(116,172,223,0.25) 0%, transparent 70%)',
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-1.5"
        style={{ background: 'repeating-linear-gradient(90deg,#74ACDF 0,#74ACDF 50%,#fff 50%,#fff 100%)', backgroundSize: '14px 6px' }}
      />
      <div className="relative z-10 max-w-md mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
          <span className="text-white text-xs font-bold tracking-widest uppercase">Mundial 2026 · Para Empresas</span>
          <div className="w-2 h-2 rounded-full bg-[#F5C518]" />
        </div>
        <div className="text-7xl mb-4 animate-bounce">⚽</div>
        <h1 className="font-bebas text-7xl text-white leading-none tracking-wide mb-2">
          PRODE<br /><span className="text-[#F5C518]">MUNDIAL</span><br />2026
        </h1>
        <p className="text-white/70 text-lg font-semibold mb-8 leading-relaxed">
          Armá el prode oficial de tu empresa en minutos. Tus empleados juegan, vos los fidelizás.
        </p>
        <Link href="/empresa/registro">
          <Button size="lg" className="w-full rounded-full font-black text-[#002B72] !bg-[#F5C518] hover:!bg-yellow-300 shadow-xl">
            🚀 Crear el prode de mi empresa
          </Button>
        </Link>
        <div className="flex justify-center gap-8 mt-10">
          {[["5'", "Para configurar"], ["∞", "Participantes"], ["$0", "Para empezar"]].map(([num, label]) => (
            <div key={label} className="text-center">
              <div className="font-bebas text-3xl text-[#F5C518]">{num}</div>
              <div className="text-white/50 text-xs font-bold uppercase tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
