'use client'

import { useState } from 'react'
import { EmpresaSidebar } from '@/components/layout/EmpresaSidebar'
import { EmpresaHeader } from '@/components/layout/EmpresaHeader'
import { EmpresaBottomNav } from '@/components/layout/EmpresaBottomNav'

import { usePathname } from 'next/navigation'

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const isOnboarding = pathname === '/empresa/configuracion'

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
