const stats = [
  { icon: '📲', number: '+8x', label: 'más interacción\ncon tu marca' },
  { icon: '🔁', number: '5x',  label: 'más visitas\ndurante el torneo' },
  { icon: '💰', number: '$0', label: 'costo de adquisición\npor cliente' },
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

        <div className="mt-10 text-left">
          <h3 className="font-bebas text-2xl text-[#002B72] tracking-wide text-center mb-1">
            LLEGÁ AL CELULAR DE TUS CLIENTES EN EL MOMENTO JUSTO
          </h3>
          <p className="text-[13px] text-slate-500 text-center mb-6 leading-relaxed">
            Las notificaciones push llegan directo al celular, aunque no tengan el prode abierto.
          </p>

          <div className="flex flex-col gap-4">
            {[
              {
                label: '🍕 Pizzeria / Gastronomia',
                title: '¡Argentina juega hoy!',
                body: 'Cargá tu pronóstico y hacé tu pedido — de la comida nos encargamos nosotros.',
              },
              {
                label: '👗 Indumentaria / Ropa',
                title: '¡Hoy juega Argentina!',
                body: 'Cargá tu pronóstico y aprovechá 10% off en toda la tienda. ¡Solo hoy!',
              },
              {
                label: '☕ Cafeteria / Bar',
                title: '¡Partido hoy a las 18:00!',
                body: 'Cargá tu pronóstico y pasá a buscar tu café antes del juego.',
              },
              {
                label: '🏆 Resultado del partido',
                title: 'Resultado: Argentina 2 - Francia 1',
                body: 'Acertaste el ganador. +1 punto para vos. Ver ranking.',
              },
            ].map((notif, i) => (
              <div key={i}>
                <p className="text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">
                  {notif.label}
                </p>
                <div className="rounded-2xl p-4 flex gap-3 items-start"
                  style={{ background: 'rgba(20,20,35,0.90)' }}>
                  <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-black">
                    <img
                      src="/web-app-manifest-192x192.png"
                      alt="elprode.ar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-bold text-white">elprode.ar</span>
                      <span className="text-[11px] text-white/50">ahora</span>
                    </div>
                    <p className="text-[13px] font-bold text-white mb-0.5">{notif.title}</p>
                    <p className="text-[12px] text-white/70 leading-snug">{notif.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
