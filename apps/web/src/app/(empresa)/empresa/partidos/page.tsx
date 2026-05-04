import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Partidos' }

export default function PartidosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 mb-1">
          ⚽ Partidos
        </h1>
        <p className="text-sm text-slate-400">Conectado a Supabase en producción</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
        <div className="text-5xl mb-4">🚧</div>
        <div className="font-black text-slate-900 mb-2">En desarrollo</div>
        <div className="text-sm text-slate-400">
          Esta sección se construye sobre la lógica del panel HTML existente
        </div>
      </div>
    </div>
  )
}
