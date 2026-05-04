const top = [
  { pos: '🥇', name: 'Martina López', pts: 22 },
  { pos: '🥈', name: 'Carlos Ruiz', pts: 18 },
  { pos: '🥉', name: 'Lucas Fernández', pts: 14 },
  { pos: '4', name: 'Ana García', pts: 12 },
  { pos: '5', name: 'Pedro Sánchez', pts: 10 },
]

export function DashboardRanking({ empresaId }: { empresaId: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="font-black text-slate-900">🏆 Top 5 del ranking</div>
        <a href="/empresa/ranking" className="text-xs font-bold text-[#002B72]">Ver completo</a>
      </div>
      <div className="p-4 flex flex-col gap-2">
        {top.map(r => (
          <div key={r.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:bg-slate-50
            ${r.pos === '🥇' ? 'bg-green-50 border border-green-100' : 'bg-slate-50'}`}>
            <span className="text-xl w-7 text-center">{r.pos}</span>
            <span className="flex-1 font-bold text-sm text-slate-800">{r.name}</span>
            <span className="font-bebas text-2xl text-[#002B72]">{r.pts}</span>
            <span className="text-xs font-semibold text-slate-400">pts</span>
          </div>
        ))}
      </div>
    </div>
  )
}
