export function DashboardNextMatch() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="font-black text-slate-900 flex items-center gap-2">⏰ Próximo partido</div>
        <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full animate-pulse">🔴 En 4 días</span>
      </div>
      <div className="p-5 text-center">
        <div className="text-4xl mb-3">🇦🇷 🆚 🇪🇸</div>
        <div className="font-black text-slate-900 mb-1">Argentina vs España</div>
        <div className="text-sm text-slate-400 mb-4">Fecha 2 · 18 Jun · 18:00 hs</div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-bold text-amber-700 mb-4">
          ⚠️ 5 participantes sin cargar aún
        </div>
        <button className="w-full bg-[#002B72] text-white rounded-xl py-3 font-black text-sm hover:bg-[#00318A] transition-all">
          📢 Recordar a los 5
        </button>
      </div>
    </div>
  )
}
