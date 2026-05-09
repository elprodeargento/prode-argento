import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export function LandingCTA() {
  return (
    <>
      <section className="bg-[#002B72] py-16 px-6 text-center">
        <h2 className="font-bebas text-4xl text-white tracking-wide mb-3">¿LISTO PARA VENDER MÁS CON EL MUNDIAL?</h2>
        <p className="text-white/60 text-sm mb-8">El Mundial es la excusa perfecta para que tus clientes vuelvan semana a semana. Configuralo en 5 minutos, gratis.</p>
        <Link href="/empresa/registro">
          <Button size="lg" className="rounded-full font-black text-[#002B72] !bg-[#F5C518] hover:!bg-yellow-300">
            Crear mi prode gratis ⚽
          </Button>
        </Link>
      </section>
      <footer className="bg-slate-900 py-6 px-6 text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-400">
          <span>© 2025 elprode.ar — Todos los derechos reservados.</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
          <span className="hidden sm:inline text-slate-600">|</span>
          <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
          <span className="hidden sm:inline text-slate-600">|</span>
          <a href="mailto:aestheriontech@gmail.com" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </footer>
    </>
  )
}
