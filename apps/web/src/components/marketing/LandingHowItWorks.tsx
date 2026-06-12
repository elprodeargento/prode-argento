const steps = [
  { n: '1', title: 'Registrá tu negocio', desc: 'Solo el nombre. 30 segundos.' },
  { n: '2', title: 'Personalizá tu marca', desc: 'Logo, colores y premios para tus clientes.' },
  { n: '3', title: 'Compartí el link', desc: 'Tus clientes entran y empiezan a jugar.' },
  { n: '4', title: 'Seguí el ranking', desc: 'Se actualiza solo, partido a partido (puede demorar unos minutos).' },
  { n: '🎁', title: 'Notificá al ganador', desc: 'Avisale por WhatsApp y traelo al local a buscar su premio.' },
]

export function LandingHowItWorks() {
  return (
    <section className="py-16 px-6 bg-white">
      <h2 className="font-bebas text-4xl text-[#002B72] text-center tracking-wide mb-10">CÓMO FUNCIONA</h2>
      <div className="max-w-sm mx-auto flex flex-col gap-0">
        {steps.map((s, i) => (
          <div key={s.n} className="flex gap-4 relative">
            {i < steps.length - 1 && (
              <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-slate-100" />
            )}
            <div className="w-10 h-10 rounded-full bg-[#002B72] text-white flex items-center justify-center font-bebas text-lg flex-shrink-0 relative z-10">
              {s.n}
            </div>
            <div className="pb-8">
              <div className="font-black text-slate-900 mb-1">{s.title}</div>
              <div className="text-sm text-slate-500">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
