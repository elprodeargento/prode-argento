const data = [4, 8, 12, 6, 22, 18, 17]
const max = Math.max(...data)

export function DashboardActivity() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="font-black text-slate-900">📈 Participantes por día</div>
        <button className="text-xs font-bold text-[#002B72]">Ver más</button>
      </div>
      <div className="p-5">
        <div className="text-xs font-semibold text-slate-400 mb-3">Últimos 7 días</div>
        <div className="flex items-end gap-2 h-16">
          {data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <div
                className={`rounded-t-md transition-all ${i === data.length - 1 ? 'bg-[#F5C518]' : 'bg-[#002B72]/20 hover:bg-[#002B72]/40'}`}
                style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
                title={`${v} personas`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-300">Jun 8</span>
          <span className="text-xs text-slate-300">Hoy</span>
        </div>
      </div>
    </div>
  )
}
