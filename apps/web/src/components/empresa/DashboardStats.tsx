interface StatCardProps { icon: string; value: string | number; label: string; badge?: string; color?: string; badgeType?: 'up' | 'down' | 'neutral' }
function StatCard({ icon, value, label, badge, color = 'bg-[#E6EEF9]', badgeType = 'neutral' }: StatCardProps) {
  const badgeColors = {
    up: 'text-[#18A06A] bg-[#E8F8F1]',
    down: 'text-[#D93025] bg-[#FDECEB]',
    neutral: 'text-[#5A6480] bg-[#F1F3F9]',
  }
  return (
    <div className="bg-white rounded-[16px] p-[22px] border border-[#DDE1EF] shadow-sm transition-all hover:shadow-md group flex flex-col gap-[14px]">
      <div className="flex items-start justify-between">
        <div className={`w-[48px] h-[48px] ${color} rounded-[14px] flex items-center justify-center text-[22px] transition-transform group-hover:scale-110`}>{icon}</div>
        {badge && <span className={`text-[12px] font-extrabold px-[10px] py-[4px] rounded-full ${badgeColors[badgeType]}`}>{badge}</span>}
      </div>
      <div className="flex flex-col">
        <div className="font-bebas text-[44px] text-[#0D1A3A] leading-none">{value}</div>
        <div className="text-[13px] font-semibold text-[#5A6480] mt-1">{label}</div>
      </div>
    </div>
  )
}
export function DashboardStats({ stats, empresa }: { stats: any; empresa: any }) {
  const coverage = stats?.total_participants > 0 
    ? Math.round((stats.predictions_loaded / stats.total_participants) * 100) 
    : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" value={stats?.total_participants || 0} label="Clientes en tu prode" color="bg-[#E6EEF9]" />
      <StatCard icon="✅" value={stats?.predictions_loaded || 0} label="Participantes activos" badge={`${coverage}%`} badgeType="up" color="bg-[#E8F8F1]" />
      <StatCard icon="🆕" value={stats?.new_today || 0} label="Nuevos hoy" color="bg-[#FEF8D8]" badge={stats?.new_today > 0 ? '+' + stats.new_today : undefined} badgeType="up" />
      <StatCard icon="👁️" value={stats?.weekly_visits || 0} label="Visitas esta semana" color="bg-[#EBF4FC]" />
    </div>
  )
}
