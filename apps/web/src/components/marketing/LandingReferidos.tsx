export function LandingReferidos() {
  return (
    <section className="bg-[#002B72] py-16 px-5">
      <div className="max-w-4xl mx-auto">

        {/* Badge + heading */}
        <div className="text-center mb-10">
          <span className="inline-block bg-[#F5C518] text-[#002B72] text-xs font-black px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            💰 Programa de referidos
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            INVITÁ Y GANÁ PLATA
          </h2>
          <p className="text-white/70 mt-3 text-base max-w-xl mx-auto">
            Cada comercio que se sume gracias a vos te suma puntos canjeables por cashback real.
          </p>
        </div>

        {/* Cashback highlight card */}
        <div className="bg-[#F5C518] rounded-2xl px-6 py-5 text-center mb-8 max-w-sm mx-auto shadow-lg">
          <div className="text-[#002B72] text-5xl font-black leading-none">$12.000</div>
          <div className="text-[#002B72] text-sm font-bold mt-1">de cashback por cada referido pago</div>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-3 gap-3 mb-10 max-w-lg mx-auto">
          {[
            { pts: '100 pts', label: '$80.000', plan: 'Cashback', emoji: '⭐' },
            { pts: '50 pts', label: '$20.000', plan: 'Plan Pro', emoji: '🚀' },
            { pts: '100 pts', label: '$40.000', plan: 'Plan Premium', emoji: '👑' },
          ].map(item => (
            <div key={item.plan} className="bg-white/10 rounded-xl p-3 text-center border border-white/10">
              <div className="text-2xl mb-1">{item.emoji}</div>
              <div className="text-white font-black text-sm">{item.pts}</div>
              <div className="text-[#F5C518] font-black text-base">{item.label}</div>
              <div className="text-white/50 text-[10px] mt-0.5">{item.plan}</div>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-10">
          <h3 className="text-white/80 text-sm font-black uppercase tracking-widest text-center mb-6">
            Cómo funciona
          </h3>
          <div className="space-y-4 max-w-md mx-auto">
            {[
              { n: '1', title: 'Copiá tu link de referido', desc: 'Lo encontrás en el panel bajo "Referidos".' },
              { n: '2', title: 'Compartilo con otros comercios', desc: 'Envialo por WhatsApp, Instagram o donde quieras.' },
              { n: '3', title: 'Cobrás cuando pagan', desc: 'Acumulás puntos automáticamente al activarse el plan.' },
            ].map(step => (
              <div key={step.n} className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-full bg-[#F5C518] text-[#002B72] font-black text-base flex items-center justify-center shrink-0">
                  {step.n}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{step.title}</div>
                  <div className="text-white/60 text-xs mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <a
            href="/empresa/registro"
            className="inline-block bg-[#F5C518] text-[#002B72] font-black text-base px-8 py-3.5 rounded-xl shadow-lg hover:bg-yellow-300 transition-colors"
          >
            Crear mi prode gratis →
          </a>
          <p className="text-white/40 text-xs mt-3">Sin tarjeta. Sin compromiso.</p>
        </div>

      </div>
    </section>
  )
}
