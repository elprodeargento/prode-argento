import type { Metadata } from 'next'
import { ParticipantesTable } from '@/components/empresa/ParticipantesTable'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Participantes' }

export default async function ParticipantesPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Fetch current business
  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('admin_user_id', user.id)
    .single()

  if (!business) {
    redirect('/empresa/dashboard')
  }

  // Fetch count for header
  const { count } = await supabase
    .from('participants')
    .select('*', { count: 'exact', head: true })
    .eq('business_id', business.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Participantes
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">{count || 0} personas juegan en tu prode</p>
        </div>
        <div className="flex gap-2.5">
          <button className="bg-white border-[1.5px] border-[#DDE1EF] text-[#5A6480] text-[13px] font-bold px-4 py-[9px] rounded-[10px] hover:bg-[#F1F3F9] transition-all">
            📥 Exportar CSV
          </button>
          <button className="bg-[#002B72] text-white text-[13px] font-black px-4 py-[9px] rounded-[10px] hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20">
            📢 Notificar a todos
          </button>
        </div>
      </div>
      <ParticipantesTable businessId={business.id} />
    </div>
  )
}
