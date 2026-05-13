'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, ChevronUp, ChevronDown, ChevronsUpDown, Download } from 'lucide-react'
import { apiGet } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'

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

interface PredictionRow {
  match_id: number
  home_pred: number
  away_pred: number
  points_earned: number | null
  matches: {
    home_team: string
    away_team: string
    home_flag: string
    away_flag: string
    home_score: number | null
    away_score: number | null
    status: string
    kickoff_at: string
  }
}

type SortCol = 'total_points' | 'rank' | 'name' | 'registered_at'
type SortDir = 'asc' | 'desc'

function Flag({ value }: { value: string }) {
  if (!value) return null
  if (value.startsWith('http')) {
    return <img src={value} alt="" className="w-5 h-4 object-contain shrink-0" />
  }
  return <span>{value}</span>
}

function waLink(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function SortIcon({ col, current, dir }: { col: SortCol; current: SortCol; dir: SortDir }) {
  if (col !== current) return <ChevronsUpDown className="w-3 h-3 opacity-40" />
  return dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
}

function PointsBadge({ pts }: { pts: number | null }) {
  if (pts === null) return <span className="text-[11px] text-[#8E96AE] font-bold">—</span>
  const color = pts === 3 ? 'text-[#F5C518] bg-[#FFF9E5]' : pts === 1 ? 'text-[#18A06A] bg-[#E8F8F1]' : 'text-[#E34646] bg-[#FEF0F0]'
  const label = pts === 3 ? '🎯 +3' : pts === 1 ? '+1' : '0'
  return <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${color}`}>{label}</span>
}

function ParticipantDrawer({ participant, onClose }: { participant: Participant; onClose: () => void }) {
  const [predictions, setPredictions] = useState<PredictionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    fetch(`${API_URL}/predictions/participant/${participant.id}`)
      .then(r => r.json())
      .then(data => setPredictions(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [participant.id])

  const finished = predictions.filter(p => p.matches?.status === 'finished')
  const pending = predictions.filter(p => p.matches?.status !== 'finished')

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative z-10 w-full max-w-md bg-white h-full flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#DDE1EF] flex items-start justify-between gap-4 bg-[#F8F9FC]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-[#EBF4FC] border-2 border-[#DDE1EF] flex items-center justify-center text-[16px] font-black text-[#003FA3] shrink-0">
              {participant.name.charAt(0)}
            </div>
            <div>
              <div className="font-black text-[15px] text-[#0D1A3A] leading-tight">{participant.name}</div>
              <div className="text-[12px] text-[#8E96AE] font-medium">{participant.email}</div>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8E96AE] hover:text-[#0D1A3A] transition-colors mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 divide-x divide-[#DDE1EF] border-b border-[#DDE1EF]">
          {([
            [participant.total_points ?? 0, 'Puntos'],
            [participant.rank ? `${participant.rank}°` : '—', 'Posición'],
            [`${participant.predictions_count}/${participant.total_matches}`, 'Pronóst.'],
          ] as [string | number, string][]).map(([v, l]) => (
            <div key={l} className="py-3 text-center">
              <div className="font-bebas text-[22px] text-[#003FA3] leading-none">{v}</div>
              <div className="text-[10px] font-bold text-[#8E96AE] uppercase tracking-wide mt-0.5">{l}</div>
            </div>
          ))}
        </div>

        <div className="px-5 py-3 flex gap-2 border-b border-[#DDE1EF]">
          {participant.phone && (
            <a href={waLink(participant.phone)} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#25D366] text-white text-[12px] font-black hover:opacity-90 transition-all">
              💬 WhatsApp
            </a>
          )}
          <a href={`mailto:${participant.email}`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#DDE1EF] text-[#5A6480] text-[12px] font-bold hover:bg-[#F1F3F9] transition-all">
            ✉️ Email
          </a>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-[#DDE1EF]" />
            </div>
          ) : predictions.length === 0 ? (
            <div className="text-center py-12 text-[#8E96AE] text-[13px] font-semibold">Sin pronósticos cargados</div>
          ) : (
            <div>
              {finished.length > 0 && (
                <div className="px-5 pt-4 pb-2">
                  <div className="text-[10px] font-black text-[#8E96AE] uppercase tracking-widest mb-3">Partidos jugados</div>
                  <div className="flex flex-col gap-2">
                    {finished.map(p => (
                      <div key={p.match_id} className="flex items-center gap-3 py-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[12px] font-bold text-[#0D1A3A]">
                            <Flag value={p.matches.home_flag} />
                            <span className="truncate">{p.matches.home_team}</span>
                            <span className="text-[#8E96AE] mx-0.5">vs</span>
                            <span className="truncate">{p.matches.away_team}</span>
                            <Flag value={p.matches.away_flag} />
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] text-[#5A6480]">Predijo: <span className="font-black">{p.home_pred}-{p.away_pred}</span></span>
                            <span className="text-[#DDE1EF]">·</span>
                            <span className="text-[11px] text-[#5A6480]">Real: <span className="font-black">{p.matches.home_score}-{p.matches.away_score}</span></span>
                          </div>
                        </div>
                        <PointsBadge pts={p.points_earned} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {pending.length > 0 && (
                <div className="px-5 pt-4 pb-4 border-t border-[#F1F3F9]">
                  <div className="text-[10px] font-black text-[#8E96AE] uppercase tracking-widest mb-3">Próximos partidos</div>
                  <div className="flex flex-col gap-2">
                    {pending.map(p => (
                      <div key={p.match_id} className="flex items-center gap-3 py-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 text-[12px] font-bold text-[#0D1A3A]">
                            <Flag value={p.matches.home_flag} />
                            <span className="truncate">{p.matches.home_team}</span>
                            <span className="text-[#8E96AE] mx-0.5">vs</span>
                            <span className="truncate">{p.matches.away_team}</span>
                            <Flag value={p.matches.away_flag} />
                          </div>
                          <div className="text-[11px] text-[#5A6480] mt-0.5">Predijo: <span className="font-black">{p.home_pred}-{p.away_pred}</span></div>
                        </div>
                        <span className="text-[10px] text-[#8E96AE] font-bold">pendiente</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#DDE1EF] bg-[#F8F9FC]">
          <span className="text-[11px] text-[#8E96AE] font-medium">Se unió el {formatDate(participant.registered_at)}</span>
        </div>
      </div>
    </div>
  )
}

function exportCSV(participants: Participant[]) {
  const headers = ['Nombre', 'Email', 'Teléfono', 'Puntos', 'Posición', 'Pronósticos', 'Total partidos', 'Unido']
  const rows = participants.map(p => [
    p.name,
    p.email,
    p.phone || '',
    p.total_points ?? 0,
    p.rank || '',
    p.predictions_count ?? 0,
    p.total_matches ?? 0,
    p.registered_at ? formatDate(p.registered_at) : '',
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `participantes-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function ParticipantesTable() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [sortCol, setSortCol] = useState<SortCol>('total_points')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<Participant | null>(null)
  const [exporting, setExporting] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const router = useRouter()
  const pageSize = 10

  useEffect(() => {
    apiGet<{ name: string }>('/businesses/me').then(b => setBusinessName(b.name)).catch(() => {})
  }, [])

  useEffect(() => {
    async function fetchParticipants() {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          sortBy: sortCol,
          sortDir,
        })
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
  }, [search, page, sortCol, sortDir])

  function toggleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('desc')
    }
    setPage(1)
  }

  async function handleExport() {
    setExporting(true)
    try {
      const params = new URLSearchParams({ page: '1', limit: '10000', sortBy: sortCol, sortDir })
      if (search) params.set('search', search)
      const res = await apiGet<{ data: Participant[] }>(`/participants/me?${params}`)
      trackEvent('biz_participants_exported')
      exportCSV(res.data || [])
    } catch (e) {
      console.error('Export error:', e)
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const ThSort = ({ col, label }: { col: SortCol; label: string }) => (
    <th
      className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] cursor-pointer select-none hover:text-[#003FA3] transition-colors"
      onClick={() => toggleSort(col)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <SortIcon col={col} current={sortCol} dir={sortDir} />
      </span>
    </th>
  )

  if (loading && participants.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#DDE1EF]" />
      </div>
    )
  }

  return (
    <>
      {selected && <ParticipantDrawer participant={selected} onClose={() => setSelected(null)} />}

      <div className="card">
        <div className="p-[18px] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-[400px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E96AE]" />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              className="w-full pl-11 pr-4 py-[10px] bg-[#F1F3F9] border-[1.5px] border-[#DDE1EF] rounded-[10px] text-[13px] font-medium text-[#0D1A3A] outline-none focus:border-[#003FA3] focus:bg-white transition-all"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button
            onClick={handleExport}
            disabled={exporting || total === 0}
            className="flex items-center gap-2 px-4 py-[10px] bg-white border-[1.5px] border-[#DDE1EF] rounded-[10px] text-[13px] font-bold text-[#5A6480] hover:bg-[#F1F3F9] disabled:opacity-50 transition-all whitespace-nowrap"
          >
            {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Exportar CSV
          </button>
          <button
            onClick={() => router.push('/empresa/notificaciones')}
            className="flex items-center gap-2 px-4 py-[10px] bg-[#002B72] text-white rounded-[10px] text-[13px] font-black hover:bg-[#00318A] transition-all whitespace-nowrap"
          >
            📢 Notificar a todos
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF]">
                <ThSort col="name" label="Participante" />
                <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em]">Estado</th>
                <ThSort col="rank" label="Posición" />
                <ThSort col="total_points" label="Puntos" />
                <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-center">Pronósticos</th>
                <ThSort col="registered_at" label="Unido" />
                <th className="px-5 py-[12px] text-[11px] font-[900] text-[#8E96AE] uppercase tracking-[0.08em] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DDE1EF]">
              {participants.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EBF4FC] flex items-center justify-center text-[14px] font-extrabold text-[#003FA3] border-[1.5px] border-[#DDE1EF] shrink-0">
                        {p.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-extrabold text-[#0D1A3A] truncate">{p.name}</span>
                        <span className="text-[11px] font-medium text-[#8E96AE] truncate">{p.email}</span>
                        {p.phone && (
                          <a href={waLink(p.phone)} target="_blank" rel="noopener noreferrer"
                            className="text-[11px] text-[#25D366] font-bold hover:underline"
                            onClick={e => e.stopPropagation()}>
                            {p.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
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
                  <td className="px-5 py-3.5 text-[12px] text-[#8E96AE] font-medium whitespace-nowrap">
                    {formatDate(p.registered_at)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelected(p)}
                        className="px-3 py-1.5 text-[11px] font-black text-[#003FA3] bg-[#EBF4FC] border-[1.5px] border-[#003FA3]/20 rounded-lg hover:bg-[#003FA3] hover:text-white transition-all"
                      >
                        Ver
                      </button>
                      {p.phone && (
                        <a href={waLink(p.phone)} target="_blank" rel="noopener noreferrer"
                          className="px-3 py-1.5 text-[11px] font-black text-[#25D366] bg-[#E8F8F1] border-[1.5px] border-[#25D366]/20 rounded-lg hover:bg-[#25D366] hover:text-white transition-all">
                          💬
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t-[1.5px] border-[#DDE1EF] flex items-center justify-between flex-wrap gap-4">
          <span className="text-[13px] font-semibold text-[#5A6480]">
            {total > 0
              ? `Mostrando ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} de ${total} participantes`
              : 'Sin participantes'}
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border-[1.5px] border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9] disabled:opacity-50 transition-all">
                ‹
              </button>
              {[...Array(Math.min(totalPages, 7))].map((_, i) => {
                const p = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-[13px] font-black transition-all ${
                      page === p ? 'bg-[#002B72] text-white shadow-lg shadow-[#002B72]/20' : 'bg-white border-[1.5px] border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9]'
                    }`}>
                    {p}
                  </button>
                )
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border-[1.5px] border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9] disabled:opacity-50 transition-all">
                ›
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
