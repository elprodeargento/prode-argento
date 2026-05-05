export function DashboardNextMatch() {
  return (
    <div className="card">
      <div className="px-[20px] py-[14px] border-b border-[#DDE1EF] flex items-center justify-between">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] flex items-center gap-2">
          <span className="text-[18px]">⏰</span> Próximo partido
        </div>
        <span className="bg-[#E8F8F1] text-[#18A06A] text-[11px] font-black px-2.5 py-1 rounded-full animate-pulse flex items-center gap-1">
          🔴 En 4 días
        </span>
      </div>
      <div className="p-[20px] text-center">
        <div className="text-[32px] mb-[10px]">🇦🇷 🆚 🇪🇸</div>
        <div className="text-[16px] font-black text-[#0D1A3A] mb-[6px]">Argentina vs España</div>
        <div className="text-[13px] text-[#5A6480] mb-[14px] font-medium">Fecha 2 · 18 Jun · 18:00 hs</div>
        <div className="bg-[#FFF4E5] rounded-[10px] py-[10px] px-[14px] text-[13px] font-extrabold text-[#FF8A00] mb-[12px] border border-[#FF8A00]/10">
          ⚠️ 5 participantes sin cargar aún
        </div>
        <button className="w-full bg-[#002B72] text-white rounded-xl py-[12px] font-black text-[14px] hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20">
          📢 Recordar a los 5
        </button>
      </div>
    </div>
  )
}
