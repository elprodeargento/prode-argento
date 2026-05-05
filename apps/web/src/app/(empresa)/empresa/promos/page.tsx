import type { Metadata } from 'next'
import { PromoManager } from '@/components/empresa/PromoManager'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Mis Promos' }

export default async function MisPromosPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('admin_user_id', user.id)
    .single()

  if (!business) redirect('/empresa/dashboard')

  return <PromoManager businessId={business.id} />
}
