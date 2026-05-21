'use client'

import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api'
import { Loader2, Plus, Trash2, Pencil, ArrowLeft } from 'lucide-react'

interface Campaign {
  id: string
  name: string
  description?: string
  invite_message?: string
  prizes: Array<{ rank: number; description: string }>
  milestone_every: number
  milestone_prize?: string
  is_active: boolean
}

interface LeaderboardEntry {
  id: string
  name: string
  referral_count: number
}

export function CampanaReferidosClient() {
  const [plan, setPlan] = useState<string>('free')
  const [businessSlug, setBusinessSlug] = useState<string>('')
  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [linkCopied, setLinkCopied] = useState(false)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', invite_message: '', prizes: [] as Array<{ rank: number; description: string }>, milestone_every: 3, milestone_prize: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [confirmDeactivate, setConfirmDeactivate] = useState(false)
  const [deactivating, setDeactivating] = useState(false)

  const isEditing = showForm && !!campaign

  useEffect(() => {
    Promise.all([
      apiGet<{ plan: string; slug: string }>('/businesses/me').catch(() => null),
      apiGet<{ campaign: Campaign | null; leaderboard: LeaderboardEntry[]; plan: string }>('/referral-campaigns/my').catch(() => null),
    ]).then(([biz, res]) => {
      setPlan((biz as any)?.plan ?? 'free')
      setBusinessSlug((biz as any)?.slug ?? '')
      if (res) {
        setCampaign(res.campaign)
        setLeaderboard(res.leaderboard ?? [])
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('El nombre es obligatorio'); return }
    setSaving(true)
    setError('')
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      invite_message: form.invite_message.trim() || undefined,
      prizes: form.prizes.filter(p => p.description.trim()),
      milestone_every: form.milestone_every,
      milestone_prize: form.milestone_prize.trim() || undefined,
    }
    try {
      if (isEditing && campaign) {
        const res = await apiPut<Campaign>(`/referral-campaigns/${campaign.id}`, payload)
        setCampaign(res)
      } else {
        const res = await apiPost<Campaign>('/referral-campaigns', payload)
        setCampaign(res)
        setLeaderboard([])
      }
      setShowForm(false)
    } catch (err: any) {
      setError(err?.message ?? 'Error al guardar la campaña')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async () => {
    if (!campaign) return
    setDeactivating(true)
    setError('')
    try {
      await apiDelete(`/referral-campaigns/${campaign.id}`)
      setCampaign(null)
      setLeaderboard([])
      setConfirmDeactivate(false)
    } catch (err: any) {
      setError(err?.message ?? 'Error al desactivar la campaña')
    } finally {
      setDeactivating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#8E96AE]" />
      </div>
    )
  }

  if (plan !== 'premium') {
    return (
      <div className="card p-8 text-center">
        <div className="text-[32px] mb-3">🔒</div>
        <div className="text-[16px] font-black text-[#0D1A3A] mb-2">Función exclusiva Premium</div>
        <p className="text-[13px] text-[#5A6480] font-medium mb-5">
          Las campañas de referidos entre participantes están disponibles solo en el plan Premium.
        </p>
        <a
          href="/empresa/planes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#002B72] text-white rounded-xl font-black text-[13px] hover:bg-[#00318A] transition-all"
        >
          Ver planes
        </a>
      </div>
    )
  }

  if (showForm) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            type="button"
            onClick={() => { setShowForm(false); setError('') }}
            className="p-2 rounded-xl hover:bg-[#F1F3F9] transition-colors text-[#5A6480]"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-[17px] font-black text-[#0D1A3A]">
            {isEditing ? 'Editar campaña' : 'Nueva campaña'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 font-semibold">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-black text-[#0D1A3A] uppercase tracking-wide">Nombre de la campaña</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Copa Amigos 2026"
              className="px-4 py-3 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-medium text-[#0D1A3A] bg-[#F1F3F9] focus:outline-none focus:border-[#002B72] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-black text-[#0D1A3A] uppercase tracking-wide">
              Descripción <span className="text-[#8E96AE] font-medium normal-case">(opcional)</span>
            </label>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Ej: Invitá amigos y ganá increíbles premios"
              className="px-4 py-3 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-medium text-[#0D1A3A] bg-[#F1F3F9] focus:outline-none focus:border-[#002B72] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-black text-[#0D1A3A] uppercase tracking-wide">
              Mensaje de invitación <span className="text-[#8E96AE] font-medium normal-case">(opcional)</span>
            </label>
            <textarea
              value={form.invite_message}
              onChange={e => setForm(f => ({ ...f, invite_message: e.target.value }))}
              placeholder="Ej: ¡Sumate al prode de la ferretería y ganá premios! 🏆"
              rows={2}
              className="px-4 py-3 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-medium text-[#0D1A3A] bg-[#F1F3F9] focus:outline-none focus:border-[#002B72] transition-colors resize-none"
            />
            <p className="text-[11px] text-[#8E96AE] font-medium">
              Aparece en el home del participante y cuando comparten su link
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[12px] font-black text-[#0D1A3A] uppercase tracking-wide">Premio por referidos</label>
            <div className="flex items-center gap-3">
              <span className="text-[13px] font-bold text-[#5A6480] shrink-0">Cada</span>
              <input
                type="number" min={1} max={50}
                value={form.milestone_every}
                onChange={e => setForm(f => ({ ...f, milestone_every: Math.max(1, Number(e.target.value)) }))}
                className="w-16 px-3 py-2 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-bold text-center text-[#0D1A3A] bg-[#F1F3F9] focus:outline-none focus:border-[#002B72]"
              />
              <span className="text-[13px] font-bold text-[#5A6480] shrink-0">referidos =</span>
            </div>
            <input
              value={form.milestone_prize}
              onChange={e => setForm(f => ({ ...f, milestone_prize: e.target.value }))}
              placeholder="Ej: Pizza gratis, Descuento 20%, Vale $5000"
              className="px-4 py-3 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-medium text-[#0D1A3A] bg-[#F1F3F9] focus:outline-none focus:border-[#002B72] transition-colors"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => { setShowForm(false); setError('') }}
              className="flex-1 py-3 rounded-xl border-2 border-[#DDE1EF] text-[#5A6480] font-bold text-[13px]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-[2] py-3 bg-[#002B72] text-white rounded-xl font-black text-[13px] hover:bg-[#00318A] transition-all disabled:opacity-60"
            >
              {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear campaña'}
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="card p-10 text-center">
        <div className="text-[48px] mb-4">🚀</div>
        <div className="text-[18px] font-black text-[#0D1A3A] mb-2">Creá tu primera campaña</div>
        <p className="text-[13px] text-[#5A6480] font-medium mb-6 max-w-sm mx-auto">
          Definí premios y tus participantes recibirán un link único para invitar a sus amigos al prode.
        </p>
        <button
          onClick={() => {
            setForm({ name: '', description: '', invite_message: '', prizes: [], milestone_every: 3, milestone_prize: '' })
            setError('')
            setShowForm(true)
          }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#002B72] text-white rounded-xl font-black text-[14px] hover:bg-[#00318A] transition-all"
        >
          <Plus size={16} /> Crear campaña
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Campaña activa */}
      <div className="card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="text-[16px] font-black text-[#0D1A3A]">{campaign.name}</div>
            {campaign.description && (
              <div className="text-[13px] text-[#5A6480] font-medium mt-0.5">{campaign.description}</div>
            )}
            {(campaign as any).invite_message && (
              <div className="text-[12px] text-[#8E96AE] font-medium mt-1 italic">
                "{(campaign as any).invite_message}"
              </div>
            )}
          </div>
          <span className="text-[11px] font-black text-[#18A06A] bg-[#E8F8F1] px-2.5 py-1 rounded-full shrink-0">✅ Activa</span>
        </div>

        {(campaign.milestone_prize || campaign.milestone_every) && (
          <div className="bg-[#F1F3F9] rounded-xl p-4 mb-4">
            <div className="text-[11px] font-black text-[#8E96AE] uppercase tracking-widest mb-2">Premio por milestone</div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-[#5A6480]">Cada</span>
              <span className="text-[14px] font-black text-[#002B72]">{campaign.milestone_every ?? 3}</span>
              <span className="text-[13px] font-bold text-[#5A6480]">referidos</span>
              <span className="text-[13px] font-bold text-[#5A6480]">=</span>
              <span className="text-[14px] font-black text-[#0D1A3A]">🎁 {campaign.milestone_prize ?? '—'}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[13px] text-red-700 font-semibold">
            {error}
          </div>
        )}

        {confirmDeactivate ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col gap-3">
            <p className="text-[13px] font-bold text-red-800">
              ¿Desactivar la campaña? Los links de los participantes dejarán de funcionar.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDeactivate(false)}
                className="flex-1 py-2.5 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-black text-[#5A6480]"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="flex-[2] py-2.5 rounded-xl bg-red-600 text-white text-[13px] font-black hover:bg-red-700 transition-all disabled:opacity-60"
              >
                {deactivating ? 'Desactivando...' : 'Sí, desactivar'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setForm({
                  name: campaign.name,
                  description: campaign.description ?? '',
                  invite_message: campaign.invite_message ?? '',
                  prizes: campaign.prizes,
                  milestone_every: campaign.milestone_every ?? 3,
                  milestone_prize: campaign.milestone_prize ?? '',
                })
                setError('')
                setShowForm(true)
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-[#DDE1EF] text-[13px] font-black text-[#5A6480] hover:border-[#002B72] hover:text-[#002B72] transition-all"
            >
              <Pencil size={13} /> Editar
            </button>
            <button
              onClick={() => { setError(''); setConfirmDeactivate(true) }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-red-200 text-[13px] font-black text-red-500 hover:bg-red-50 transition-all"
            >
              <Trash2 size={13} /> Desactivar
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard */}
      <div className="card p-5">
        <div className="text-[15px] font-extrabold text-[#0D1A3A] mb-4">🏅 Top referidores</div>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-[28px] mb-2">🤝</div>
            <div className="text-[13px] font-bold text-[#0D1A3A] mb-1">Aún no hay referidos</div>
            <div className="text-[12px] text-[#8E96AE] font-medium">
              Los participantes verán su link único en la app del prode
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-[#DDE1EF] divide-y divide-[#DDE1EF] overflow-hidden">
            {leaderboard.map((entry, i) => (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-base w-6 text-center shrink-0">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}°`}
                </span>
                <span className="flex-1 text-[13px] font-bold text-[#0D1A3A] truncate">{entry.name}</span>
                <span className="text-[14px] font-black text-[#002B72]">{entry.referral_count}</span>
                <span className="text-[11px] text-[#8E96AE] font-medium">referidos</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link del prode */}
      {businessSlug && (
        <div className="card p-5">
          <div className="text-[14px] font-extrabold text-[#0D1A3A] mb-3">🔗 Link de tu prode</div>
          <p className="text-[12px] text-[#5A6480] font-medium mb-3">
            Compartí este link para que tus participantes se unan. Cada uno tendrá su link único de referido dentro de la app.
          </p>
          <div className="flex gap-2 mb-3">
            <input
              readOnly
              value={`https://${businessSlug}.elprode.ar`}
              className="flex-1 rounded-xl border border-[#DDE1EF] bg-[#F1F3F9] px-3 py-2.5 text-[12px] text-[#0D1A3A] font-medium outline-none"
            />
            <button
              onClick={async () => {
                await navigator.clipboard?.writeText(`https://${businessSlug}.elprode.ar`)
                setLinkCopied(true)
                setTimeout(() => setLinkCopied(false), 2000)
              }}
              className="shrink-0 px-4 py-2.5 bg-[#002B72] text-white text-[13px] font-black rounded-xl hover:bg-[#00318A] transition-all"
            >
              {linkCopied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
          <button
            onClick={() => {
              const url = `https://${businessSlug}.elprode.ar`
              const text = (campaign as any).invite_message
                ? `${(campaign as any).invite_message} ${url}`
                : `¡Participá en nuestro prode del Mundial! Entrá acá: ${url}`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
            className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white text-[13px] font-black rounded-xl hover:opacity-90 transition-all"
          >
            💬 Compartir por WhatsApp
          </button>
        </div>
      )}

      {/* Cómo funciona */}
      <div className="card p-5">
        <div className="text-[14px] font-extrabold text-[#0D1A3A] mb-4">¿Cómo funciona?</div>
        <div className="space-y-3">
          {[
            { icon: '🔗', text: 'Cada participante recibe un link único con su ID' },
            { icon: '👥', text: 'Cuando alguien se registra con ese link, se cuenta como su referido' },
            { icon: '🎁', text: campaign.milestone_prize ? `Cada ${campaign.milestone_every ?? 3} referidos ganan: ${campaign.milestone_prize}` : 'Los que más inviten ganan los premios que definiste' },
          ].map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#E6EEF9] flex items-center justify-center text-[16px] shrink-0">
                {step.icon}
              </div>
              <div className="text-[13px] font-medium text-[#0D1A3A]">{step.text}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
