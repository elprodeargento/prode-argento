const features = [
  { icon: '🎨', title: 'Tu marca', desc: 'Logo, colores y link personalizado' },
  { icon: '🏆', title: 'Premios', desc: 'Configurá qué gana cada puesto' },
  { icon: '📱', title: 'QR listo', desc: 'Compartí al instante por WhatsApp' },
  { icon: '📊', title: 'Ranking vivo', desc: 'Actualizado partido a partido' },
  { icon: '🔔', title: 'Recordatorios', desc: 'WhatsApp antes de cada fecha' },
  { icon: '📍', title: 'Promos geo', desc: 'Tu negocio en el carrusel de la zona' },
]

export function LandingFeatures() {
  return (
    <section className="bg-slate-50 py-16 px-6">
      <h2 className="font-bebas text-4xl text-[#002B72] text-center tracking-wide mb-10">¿QUÉ INCLUYE?</h2>
      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
        {features.map(f => (
          <div key={f.title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-black text-sm text-[#002B72] mb-1">{f.title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
