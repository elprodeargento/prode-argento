const data = [4, 8, 12, 6, 22, 18, 17]
const max = Math.max(...data)

export function DashboardActivity() {
  return (
    <div className="card">
      <div className="px-[20px] py-[14px] border-b border-[#DDE1EF] flex items-center justify-between">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] flex items-center gap-2">
          <span className="text-[18px]">📈</span> Crecimiento de tu comunidad
        </div>
        <button className="text-[13px] font-bold text-[#003FA3] hover:underline">Ver más</button>
      </div>
      <div className="p-[20px]">
        <div className="text-[12px] font-bold text-[#8E96AE] mb-[12px] uppercase tracking-wider">Clientes nuevos — últimos 7 días</div>
        <div className="flex items-end gap-2 h-[64px]">
          {data.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-1">
              <div
                className={`rounded-t-[4px] transition-all ${i === data.length - 1 ? 'bg-[#F5C518]' : 'bg-[#DDE1EF] hover:bg-[#B0B8CC]'}`}
                style={{ height: `${(v / max) * 100}%`, minHeight: 4 }}
                title={`${v} personas`}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-[8px]">
          <span className="text-[11px] font-bold text-[#B0B8CC]">Jun 8</span>
          <span className="text-[11px] font-bold text-[#B0B8CC]">Hoy</span>
        </div>
      </div>
    </div>
  )
}
