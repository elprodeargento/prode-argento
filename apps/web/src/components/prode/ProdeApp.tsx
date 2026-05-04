'use client'
import { useState } from 'react'

type Tab = 'home' | 'pronosticar' | 'ranking' | 'resultados' | 'perfil'

const MATCHES = [
  { id: 1, home: '🇦🇷', hName: 'Argentina', away: '🇲🇦', aName: 'Marruecos', time: '12 Jun 18:00', locked: true,  realH: 2, realA: 0, predH: 2, predA: 0 },
  { id: 2, home: '🇧🇷', hName: 'Brasil',    away: '🇩🇪', aName: 'Alemania',  time: '12 Jun 21:00', locked: true,  realH: 1, realA: 1, predH: 2, predA: 0 },
  { id: 3, home: '🇦🇷', hName: 'Argentina', away: '🇪🇸', aName: 'España',    time: '18 Jun 18:00', locked: false, realH: null, realA: null, predH: null, predA: null },
  { id: 4, home: '🇺🇾', hName: 'Uruguay',   away: '🇵🇹', aName: 'Portugal',  time: '18 Jun 21:00', locked: false, realH: null, realA: null, predH: null, predA: null },
]

const RANKING = [
  { pos: 1, name: 'Martina López', pts: 22, me: false },
  { pos: 2, name: 'Carlos Ruiz',   pts: 18, me: false },
  { pos: 3, name: 'Lucas García',  pts: 14, me: true  },
  { pos: 4, name: 'Ana Torres',    pts: 12, me: false },
  { pos: 5, name: 'Pedro Ruiz',    pts: 10, me: false },
]

const PRIZES = [
  { medal: '🥇', pos: '1° Puesto', desc: 'AirPods Pro + Diploma' },
  { medal: '🥈', pos: '2° Puesto', desc: 'Voucher $30.000' },
  { medal: '🥉', pos: '3° Puesto', desc: 'Almuerzo en la empresa' },
]

export function ProdeApp({ empresa, participant }: { empresa: any; participant: any }) {
  const [tab, setTab] = useState<Tab>('home')
  const [preds, setPreds] = useState<Record<number, { h: string; a: string }>>({})
  const color = empresa.primary_color ?? '#002B72'

  const navItems: { id: Tab; icon: string; label: string }[] = [
    { id: 'home',         icon: '🏠', label: 'Inicio' },
    { id: 'pronosticar',  icon: '⚽', label: 'Pronosticar' },
    { id: 'ranking',      icon: '🏆', label: 'Ranking' },
    { id: 'resultados',   icon: '📊', label: 'Resultados' },
    { id: 'perfil',       icon: '👤', label: 'Perfil' },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto relative">
      {/* Header */}
      <div className="text-white px-5 py-4 pb-5" style={{ background: color }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center text-lg">⚽</div>
            <div>
              <div className="font-bebas text-base tracking-widest">{empresa.name.toUpperCase()}</div>
              <div className="text-white/50 text-xs font-semibold">Prode Mundial 2026</div>
            </div>
          </div>
          <button onClick={() => setTab('perfil')} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-base">👤</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-20">

        {/* HOME */}
        {tab === 'home' && (
          <div>
            {/* Promos carrusel simple */}
            <div className="px-4 pt-4">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
                Promos cerca tuyo
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { name: 'Pizzería Don Carlo', desc: '2x1 en pizzas los miércoles', km: '350m', bg: '#1a3a5c' },
                  { name: 'Café Central', desc: 'Café + medialuna $800', km: '580m', bg: '#3d1a00' },
                ].map(p => (
                  <div key={p.name} className="flex-shrink-0 w-48 h-20 rounded-xl relative overflow-hidden cursor-pointer"
                    style={{ background: p.bg }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
                    <div className="absolute inset-0 p-3 flex flex-col justify-between">
                      <span className="text-[10px] font-black text-yellow-300 bg-yellow-300/20 px-2 py-0.5 rounded-full self-start">📍 {p.km}</span>
                      <div>
                        <div className="text-white text-xs font-black">{p.name}</div>
                        <div className="text-white/70 text-[10px]">{p.desc}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 px-4 pt-4">
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="font-bebas text-4xl text-[#002B72]">14</div>
                <div className="text-xs font-bold text-slate-400">Mis puntos</div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                <div className="font-bebas text-4xl text-[#002B72]">3°</div>
                <div className="text-xs font-bold text-slate-400">Posición</div>
              </div>
            </div>

            {/* Próximo partido */}
            <div className="mx-4 mt-4 rounded-2xl p-4 text-white relative overflow-hidden" style={{ background: color }}>
              <div className="text-xs font-bold text-white/60 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse inline-block" /> Próximo partido · Fecha 2
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-center"><div className="text-3xl">🇦🇷</div><div className="text-xs font-black">Argentina</div></div>
                <div className="font-bebas text-2xl text-yellow-300">VS</div>
                <div className="text-center"><div className="text-3xl">🇪🇸</div><div className="text-xs font-black">España</div></div>
              </div>
              <div className="flex justify-between text-xs text-white/60 mb-3">
                <span>📅 18 Jun 2026</span><span>🕕 18:00 hs</span><span>⏰ 4d 12h</span>
              </div>
              <button onClick={() => setTab('pronosticar')}
                className="w-full bg-yellow-400 text-[#002B72] rounded-xl py-2.5 font-black text-sm hover:bg-yellow-300 transition-all">
                ⚡ Cargar mi pronóstico
              </button>
            </div>

            {/* Premios */}
            <div className="px-4 pt-5">
              <div className="text-sm font-black text-slate-900 mb-3">🏆 Premios</div>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {(empresa.prizes ?? PRIZES).map((p: any) => (
                  <div key={p.pos} className="flex-shrink-0 w-32 bg-white rounded-2xl p-3 border border-slate-100 shadow-sm text-center">
                    <div className="text-3xl mb-1">{p.medal}</div>
                    <div className="font-bebas text-sm text-[#002B72]">{p.pos}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 leading-tight">{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PRONOSTICAR */}
        {tab === 'pronosticar' && (
          <div className="p-4">
            <div className="text-sm font-black text-slate-900 mb-4">Cargá tus pronósticos</div>
            <div className="flex flex-col gap-3">
              {MATCHES.map(m => (
                <div key={m.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden
                  ${m.locked ? 'opacity-60 border-slate-100' : 'border-[#002B72]/20'}`}>
                  <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-500">{m.time}</span>
                    {m.locked ? <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">🔒 Cerrado</span>
                      : <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Abierto</span>}
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-2xl">{m.home}</span>
                      <span className="text-sm font-black text-slate-900">{m.hName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input type="number" min={0} max={20} disabled={m.locked}
                        value={m.locked ? (m.predH ?? '') : (preds[m.id]?.h ?? '')}
                        onChange={e => setPreds(p => ({...p, [m.id]: {...p[m.id], h: e.target.value}}))}
                        className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:border-[#002B72] focus:outline-none disabled:bg-slate-50" />
                      <span className="font-bebas text-xl text-slate-400">:</span>
                      <input type="number" min={0} max={20} disabled={m.locked}
                        value={m.locked ? (m.predA ?? '') : (preds[m.id]?.a ?? '')}
                        onChange={e => setPreds(p => ({...p, [m.id]: {...p[m.id], a: e.target.value}}))}
                        className="w-10 h-10 text-center border-2 border-slate-200 rounded-xl font-bebas text-xl focus:border-[#002B72] focus:outline-none disabled:bg-slate-50" />
                    </div>
                    <div className="flex items-center gap-2 flex-1 justify-end">
                      <span className="text-sm font-black text-slate-900">{m.aName}</span>
                      <span className="text-2xl">{m.away}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 rounded-2xl py-4 text-white font-black text-base shadow-lg hover:opacity-90 transition-all"
              style={{ background: color }}>
              💾 Guardar pronósticos
            </button>
          </div>
        )}

        {/* RANKING */}
        {tab === 'ranking' && (
          <div className="p-4">
            <div className="rounded-2xl p-4 text-white mb-4 flex items-center gap-4" style={{ background: color }}>
              <div className="font-bebas text-5xl text-yellow-300">3°</div>
              <div>
                <div className="text-white/60 text-xs font-bold uppercase tracking-wide">Tu posición</div>
                <div className="font-bebas text-2xl">14 puntos</div>
                <div className="text-white/60 text-xs">5 exactos · 3 ganadores</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {RANKING.map(r => (
                <div key={r.pos} className={`flex items-center gap-3 bg-white rounded-xl px-4 py-3 border shadow-sm
                  ${r.me ? 'border-[#002B72] bg-blue-50' : 'border-slate-100'}`}>
                  <span className="text-xl w-8 text-center">{r.pos === 1 ? '🥇' : r.pos === 2 ? '🥈' : r.pos === 3 ? '🥉' : r.pos}</span>
                  <span className="flex-1 font-bold text-sm text-slate-900">
                    {r.name} {r.me && <span className="text-[10px] bg-[#002B72] text-white px-2 py-0.5 rounded-full ml-1">Vos</span>}
                  </span>
                  <span className="font-bebas text-2xl text-[#002B72]">{r.pts}</span>
                  <span className="text-xs text-slate-400 font-semibold">pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RESULTADOS */}
        {tab === 'resultados' && (
          <div className="p-4">
            <div className="text-sm font-black text-slate-900 mb-4">Resultados — Fecha 1</div>
            <div className="flex flex-col gap-3">
              {MATCHES.filter(m => m.locked).map(m => {
                const pts = m.predH === m.realH && m.predA === m.realA ? 3
                  : Math.sign((m.predH ?? 0) - (m.predA ?? 0)) === Math.sign((m.realH ?? 0) - (m.realA ?? 0)) ? 1 : 0
                return (
                  <div key={m.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500">{m.time}</span>
                      <span className={`text-xs font-black px-2 py-1 rounded-full ${pts === 3 ? 'bg-green-100 text-green-700' : pts === 1 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                        {pts === 3 ? '+3 pts 🎯 Exacto' : pts === 1 ? '+1 pt 👍 Ganador' : '0 pts'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3">
                      <span className="text-2xl">{m.home}</span>
                      <span className="flex-1 text-sm font-black">{m.hName}</span>
                      <div className="flex items-center gap-2">
                        <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bebas text-xl">{m.realH}</span>
                        <span className="font-bebas text-xl text-slate-400">:</span>
                        <span className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center font-bebas text-xl">{m.realA}</span>
                      </div>
                      <span className="flex-1 text-sm font-black text-right">{m.aName}</span>
                      <span className="text-2xl">{m.away}</span>
                    </div>
                    <div className="px-4 pb-3 text-xs text-slate-400">Tu pronóstico: {m.predH} - {m.predA}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PERFIL */}
        {tab === 'perfil' && (
          <div className="p-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 text-center mb-4">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center text-3xl mx-auto mb-3"
                style={{ borderColor: color }}>👤</div>
              <div className="font-black text-xl text-slate-900 mb-1">{participant.name}</div>
              <div className="text-sm text-slate-400">{participant.email}</div>
              <div className="grid grid-cols-3 gap-4 mt-5">
                {[['14', 'Puntos'], ['5', 'Exactos'], ['3°', 'Posición']].map(([v, l]) => (
                  <div key={l} className="text-center">
                    <div className="font-bebas text-3xl text-[#002B72]">{v}</div>
                    <div className="text-xs font-bold text-slate-400">{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
              <div className="text-sm font-black text-slate-900 mb-3">🔔 Notificaciones</div>
              <div className="text-sm text-slate-500">
                Te avisamos antes de cada fecha para que no pierdas tus pronósticos.
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t border-slate-100 flex shadow-lg z-50">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setTab(item.id)}
            className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all
              ${tab === item.id ? 'text-[#002B72]' : 'text-slate-400'}`}>
            <span className={`text-xl transition-transform ${tab === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
            <span className="text-[10px] font-black">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
