interface StatCardProps { icon: string; value: string | number; label: string; badge?: string; color?: string }
function StatCard({ icon, value, label, badge, color = 'bg-blue-50' }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center text-2xl`}>{icon}</div>
        {badge && <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">{badge}</span>}
      </div>
      <div className="font-bebas text-4xl text-slate-900 leading-none mb-1">{value}</div>
      <div className="text-sm font-semibold text-slate-400">{label}</div>
    </div>
  )
}
export function DashboardStats({ stats, empresa }: { stats: any; empresa: any }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard icon="👥" value={stats?.total_participants ?? 87} label="Participantes" badge="↑ +12 hoy" color="bg-blue-50" />
      <StatCard icon="✅" value={stats?.predictions_loaded ?? 82} label="Cargaron pronósticos" badge="94%" color="bg-green-50" />
      <StatCard icon="⚽" value={48} label="Partidos jugados" badge="Fecha 1" color="bg-yellow-50" />
      <StatCard icon="📊" value="1.8K" label="Pronósticos" badge="activo" color="bg-purple-50" />
    </div>
  )
}
