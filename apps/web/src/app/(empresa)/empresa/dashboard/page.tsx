import { DashboardStats } from '@/components/empresa/DashboardStats'
import { DashboardLink } from '@/components/empresa/DashboardLink'
import { DashboardRanking } from '@/components/empresa/DashboardRanking'
import { DashboardNextMatch } from '@/components/empresa/DashboardNextMatch'
import { DashboardActivity } from '@/components/empresa/DashboardActivity'
import { DashboardWeeklyPrize } from '@/components/empresa/DashboardWeeklyPrize'
import { DashboardUpgradeBanner } from '@/components/empresa/DashboardUpgradeBanner'
import { DashboardChecklist } from '@/components/empresa/DashboardChecklist'
import { DashboardTips } from '@/components/empresa/DashboardTips'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Dashboard' }

export default async function EmpresaDashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch current business
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('admin_user_id', user.id)
    .single()

  if (!business) {
    // If no business yet, redirect to creation or show empty state
    // For now, we'll assume they have one if they are in this layout
    return (
      <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-black text-slate-900 mb-2">No se encontró tu comercio</h2>
        <p className="text-slate-500">Asegurate de haber completado el registro correctamente.</p>
      </div>
    )
  }

  // Fetch real stats via RPC
  const { data: stats } = await supabase.rpc('get_empresa_stats', { 
    business_id: business.id 
  })

  const dashboardStats = stats?.[0] || { total_participants: 0, predictions_loaded: 0, coverage_pct: 0 }

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-[900] text-[#0D1A3A] mb-1">
            ¡Buen día, {(user.user_metadata?.full_name || user.user_metadata?.name || user.email)?.split(/[ @]/)[0]}! 👋
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">Tu comercio hoy</p>
        </div>
      </div>
      <DashboardChecklist business={business} />
      <DashboardStats stats={dashboardStats} empresa={business} />
      <DashboardUpgradeBanner plan={business.plan} total={dashboardStats.total_participants || 0} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardLink empresa={business} />
        <DashboardNextMatch />
      </div>
      <DashboardWeeklyPrize businessId={business.id} />
      <DashboardTips />
      <DashboardActivity />
    </div>
  )
}
