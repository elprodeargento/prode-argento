import type { Metadata } from 'next'
import { PrizeManager } from '@/components/empresa/PrizeManager'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export const metadata: Metadata = { title: 'Premios' }

export default async function PremiosPage() {
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

  return <PrizeManager businessId={business.id} />
}
