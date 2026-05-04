import { EmpresaSidebar } from '@/components/layout/EmpresaSidebar'
import { EmpresaHeader } from '@/components/layout/EmpresaHeader'

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <EmpresaSidebar />
      <EmpresaHeader />
      <main className="ml-64 mt-16 p-7">
        {children}
      </main>
    </div>
  )
}
