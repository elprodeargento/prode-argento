'use client'

import { useState, useEffect } from 'react'
import { EmpresaSidebar } from '@/components/layout/EmpresaSidebar'
import { EmpresaHeader } from '@/components/layout/EmpresaHeader'
import { EmpresaBottomNav } from '@/components/layout/EmpresaBottomNav'
import { useAdminPushNotifications } from '@/hooks/useAdminPushNotifications'
import { createClient } from '@/utils/supabase/client'
import { usePathname, useRouter } from 'next/navigation'

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  useAdminPushNotifications()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/empresa/login')
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  const isOnboarding = pathname === '/empresa/onboarding'

  if (isOnboarding) {
    return <div className="min-h-screen bg-[#F1F3F9]">{children}</div>
  }

  return (
    <div className="min-h-screen bg-[#F1F3F9]">
      <EmpresaSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <EmpresaHeader onOpenSidebar={() => setSidebarOpen(true)} />
      <main className="lg:ml-[260px] pt-[88px] px-5 pb-20 lg:pb-7 min-h-screen transition-all">
        {children}
      </main>
      <EmpresaBottomNav onOpenSidebar={() => setSidebarOpen(true)} />
    </div>
  )
}
