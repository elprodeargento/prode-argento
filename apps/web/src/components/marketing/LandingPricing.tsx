import Link from 'next/link'
import { SOCIAL_ENABLED } from '@/lib/features'

const checkGreen = <span className="text-green-500 font-black">✓</span>
const checkYellow = <span className="text-[#F5C518] font-black">✓</span>

export function LandingPricing() {
  return (
    <section className="bg-slate-50 py-16 px-5">
      <h2 className="font-bebas text-4xl text-[#002B72] text-center tracking-wide mb-2">
        PLANES Y PRECIOS
      </h2>
      <p className="text-[14px] text-slate-500 text-center mb-10">
        Pago único. Sin suscripción. Válido todo el Mundial 2026.
      </p>

      <div className="flex flex-col gap-4 max-w-sm mx-auto">
        {/* FREE */}
        <div className="bg-white rounded-2xl border-[1.5px] border-[#DDE1EF] p-5">
          <div className="text-[11px] font-black text-[#5A6480] uppercase tracking-widest">Free</div>
          <div className="font-bebas text-[36px] text-[#0D1A3A]">Gratis</div>
          <ul className="flex flex-col gap-2 mt-3">
            {['Hasta 5 participantes', 'Ranking en tiempo real', 'Página pública con tu marca'].map(f => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                {checkGreen} {f}
              </li>
            ))}
          </ul>
        </div>

        {/* PRO */}
        <div className="bg-[#002B72] rounded-2xl p-5 shadow-lg relative">
          <div className="inline-block bg-[#F5C518] text-[#002B72] text-[10px] font-black px-3 py-1 rounded-full mb-3">
            MÁS POPULAR
          </div>
          <div className="text-[11px] font-black text-white/60 uppercase tracking-widest">Pro</div>
          <div className="font-bebas text-[42px] text-white">$40.000</div>
          <div className="text-[12px] font-black text-[#F5C518] mt-0.5">🔒 Pago único · Todo el Mundial 2026</div>
          <p className="text-[11px] text-white/50 font-medium mt-0.5">No incluye IVA</p>
          <ul className="flex flex-col gap-2 mt-3">
            {[
              'Participantes ilimitados',
              'Premios semanales configurables',
              'Notificaciones push a tus clientes',
              'QR descargable para tu local',
              'Exportar lista de participantes',
            ].map((f: string) => {
              const isSoon = f.endsWith(' 🔜')
              const text = f.replace(' 🔜', '')
              return (
                <li key={f} className="flex items-center gap-2 text-[13px] text-white/80 font-medium">
                  {checkYellow} {text}
                  {isSoon && <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded-md ml-1 font-black uppercase tracking-wider">Próximamente</span>}
                </li>
              )
            })}
          </ul>
          <Link
            href="/empresa/registro"
            className="bg-[#F5C518] text-[#002B72] w-full py-3 rounded-xl font-black text-[14px] text-center mt-2 block"
          >
            Empezar con Pro →
          </Link>
        </div>

        {/* PREMIUM */}
        <div className="bg-white rounded-2xl border-[1.5px] border-[#DDE1EF] p-5">
          <div className="text-[11px] font-black text-[#F5C518] uppercase tracking-widest">Premium</div>
          <div className="font-bebas text-[42px] text-[#0D1A3A]">$80.000</div>
          <div className="text-[12px] font-black text-[#002B72] mt-0.5">🔒 Pago único · Todo el Mundial 2026</div>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">No incluye IVA</p>
          <ul className="flex flex-col gap-2 mt-3">
            {[
              'Todo lo del plan Pro',
              'Banner visible para jugadores a 5 km de tu local',
              'Estadísticas de visualizaciones',
              'Soporte por WhatsApp',
            ].map(f => (
              <li key={f} className="flex items-center gap-2 text-[13px] text-slate-600 font-medium">
                {checkGreen} {f}
              </li>
            ))}
          </ul>
          <Link
            href="/empresa/registro"
            className="bg-[#002B72] text-white w-full py-3 rounded-xl font-black text-[14px] text-center mt-2 block"
          >
            Empezar con Premium →
          </Link>
        </div>
      </div>
    </section>
  )
}
