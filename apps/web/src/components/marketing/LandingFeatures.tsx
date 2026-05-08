const features = [
  { icon: '🎨', title: 'Tu marca', desc: 'Tus clientes ven tu logo y colores en cada partido' },
  { icon: '🏆', title: 'Premios', desc: 'Un regalo simple que trae al ganador de vuelta a tu local' },
  { icon: '📱', title: 'QR listo', desc: 'Pegalo en tu local o compartilo por WhatsApp en segundos' },
  { icon: '📊', title: 'Ranking vivo', desc: 'Tus clientes vuelven a ver cómo van — y se acuerdan de vos' },
  { icon: '🔔', title: 'Recordatorios', desc: 'Contacto directo con tus clientes antes de cada partido' },
  { icon: '📍', title: 'Promos geo', desc: 'Tu negocio visible para todos los clientes de la zona' },
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
