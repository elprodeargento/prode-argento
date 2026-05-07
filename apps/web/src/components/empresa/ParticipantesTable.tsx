'use client'

import { useState, useEffect } from 'react'
import { Search, Download, Send, ChevronLeft, ChevronRight, Loader2, Filter, SlidersHorizontal } from 'lucide-react'

interface Participant {
  id: string
  name: string
  email: string
  phone: string
  total_points: number
  rank: number
  registered_at: string
  predictions_count: number
  total_matches: number
}

export function ParticipantesTable() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    async function fetchParticipants() {
      setLoading(true)
      try {
        const { apiGet } = await import('@/lib/api')
        const params = new URLSearchParams({ page: String(page), limit: String(pageSize) })
        if (search) params.set('search', search)
        const res = await apiGet<{ data: Participant[]; total: number }>(`/participants/me?${params}`)
        setParticipants(res.data || [])
        setTotal(res.total || 0)
      } catch (error) {
        console.error('Error fetching participants:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchParticipants, 300)
    return () => clearTimeout(timer)
  }, [search, page])

  const paginated = participants
  const totalPages = Math.ceil(total / pageSize)

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DDE1EF]" />
      </div>
    )
  }

  return (
    <div className="card">
      {/* SEARCH & FILTERS BAR */}
      <div className="p-[18px] border-b-[1.5px] border-[#DDE1EF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Search */}
        <div className="relative flex-1 max-w-full sm:max-w-[400px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E96AE]" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            className="w-full pl-11 pr-4 py-[10px] bg-[#F1F3F9] border-[1.5px] border-[#DDE1EF] rounded-[10px] text-[13px] font-medium text-[#0D1A3A] outline-none focus:border-[#003FA3] focus:bg-white transition-all"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
          />
        </div>

        {/* Right: Minimalist Buttons */}
        <div className="flex items-center gap-2">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-[10px] bg-white border-[1.5px] border-[#DDE1EF] rounded-[10px] text-[13px] font-bold text-[#5A6480] hover:bg-[#F1F3F9] transition-all whitespace-nowrap">
            <Filter className="h-3.5 w-3.5" />
            <span>Filtrar</span>
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-[10px] bg-white border-[1.5px] border-[#DDE1EF] rounded-[10px] text-[13px] font-bold text-[#5A6480] hover:bg-[#F1F3F9] transition-all whitespace-nowrap">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Estado</span>
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF]">
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em]">Participante</th>
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em]">Celular</th>
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em]">Estado</th>
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Posición</th>
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Puntos</th>
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Pronósticos</th>
              <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DDE1EF]">
            {paginated.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#EBF4FC] flex items-center justify-center text-[14px] font-extrabold text-[#003FA3] border-[1.5px] border-[#DDE1EF]">
                      {p.name.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[13px] font-extrabold text-[#0D1A3A]">{p.name}</span>
                      <span className="text-[11px] font-medium text-[#8E96AE]">{p.email}</span>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-[#5A6480] font-bold">{p.phone}</td>
                <td className="px-5 py-3.5">
                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-black border ${
                    p.predictions_count > 0
                    ? 'bg-[#E8F8F1] text-[#18A06A] border-[#18A06A]/10'
                    : 'bg-[#F1F3F9] text-[#8E96AE] border-[#DDE1EF]'
                  }`}>
                    {p.predictions_count > 0 ? 'Jugando' : 'Sin pronósticos'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#F1F3F9] font-bebas text-[18px] text-[#0D1A3A] border-[1.5px] border-[#DDE1EF]">
                    {p.rank || '-'}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center font-bebas text-[20px] text-[#003FA3]">
                   {p.total_points || 0}
                </td>
                <td className="px-5 py-3.5 text-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black text-[#5A6480]">{p.predictions_count}/{p.total_matches}</span>
                    <div className="w-14 h-[6px] bg-[#DDE1EF] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-[#003FA3] rounded-full"
                        style={{ width: p.total_matches > 0 ? `${Math.min(100, (p.predictions_count / p.total_matches) * 100)}%` : '0%' }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button className="px-3 py-1.5 text-[11px] font-black text-[#5A6480] bg-white border-[1.5px] border-[#DDE1EF] rounded-lg hover:bg-[#F1F3F9] transition-all">
                      Ver
                    </button>
                    <button className="px-3 py-1.5 text-[11px] font-black text-[#5A6480] bg-white border-[1.5px] border-[#DDE1EF] rounded-lg hover:bg-[#F1F3F9] transition-all">
                      ✉️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div className="p-4 border-t-[1.5px] border-[#DDE1EF] flex items-center justify-between flex-wrap gap-4">
        <span className="text-[13px] font-semibold text-[#5A6480]">
          Mostrando {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} de {total} participantes
        </span>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="w-9 h-9 flex items-center justify-center rounded-lg border-[1.5px] border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9] disabled:opacity-50 transition-all"
          >
            ‹
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-black transition-all ${
                page === i + 1 
                ? 'bg-[#002B72] text-white shadow-lg shadow-[#002B72]/20' 
                : 'bg-white border-[1.5px] border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9]'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-lg border-[1.5px] border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9] disabled:opacity-50 transition-all"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  )
}
