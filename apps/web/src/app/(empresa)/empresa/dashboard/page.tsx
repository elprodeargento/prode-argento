import { DashboardStats } from '@/components/empresa/DashboardStats'
import { DashboardLink } from '@/components/empresa/DashboardLink'
import { DashboardRanking } from '@/components/empresa/DashboardRanking'
import { DashboardNextMatch } from '@/components/empresa/DashboardNextMatch'
import { DashboardActivity } from '@/components/empresa/DashboardActivity'

export const metadata = { title: 'Dashboard' }

export default function EmpresaDashboardPage() {
  const empresa = { id: '1', slug: 'distribuidoragarcia', name: 'Distribuidora García' }
  const stats = { total_participants: 87, predictions_loaded: 82, coverage_pct: 94 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">¡Buen día, Daniel! 👋</h1>
        <p className="text-slate-400 text-sm">Acá está todo lo que pasa en tu prode hoy</p>
      </div>
      <DashboardStats stats={stats} empresa={empresa} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardLink empresa={empresa} />
        <DashboardNextMatch />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardActivity />
        <DashboardRanking empresaId={empresa.id} />
      </div>
    </div>
  )
}
