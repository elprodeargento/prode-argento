const stats = [
  { icon: '📲', number: '+8x', label: 'más interacción\ncon tu marca' },
  { icon: '🔁', number: '5x',  label: 'más visitas\ndurante el torneo' },
  { icon: '💬', number: '98%', label: 'tasa de apertura\nde WhatsApp' },
]

export function LandingProblem() {
  return (
    <section className="bg-white py-16 px-6">
      <div className="max-w-lg mx-auto text-center">
        <h2 className="font-bebas text-4xl text-[#002B72] tracking-wide">
          EL MUNDIAL ES UNA VEZ CADA 4 AÑOS.
        </h2>
        <p className="text-lg font-black text-slate-800 mt-2">
          Tus clientes van a estar pegados al teléfono semana a semana.
        </p>
        <p className="text-sm text-slate-500 mt-4 leading-relaxed">
          El prode es la excusa perfecta para que tu negocio esté presente
          en cada partido, en cada resultado, en cada conversación.
          Mientras ellos juegan, vos construís el hábito de que vuelvan.
        </p>

        <div className="grid grid-cols-3 gap-4 mt-10">
          {stats.map(s => (
            <div key={s.number} className="bg-[#002B72] rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="font-bebas text-4xl text-[#F5C518]">{s.number}</div>
              <div className="text-xs text-white/60 uppercase tracking-wide mt-1 whitespace-pre-line leading-tight">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-slate-400 mt-6 italic">
          * Datos basados en campañas de fidelización durante eventos deportivos.
        </p>
      </div>
    </section>
  )
}
