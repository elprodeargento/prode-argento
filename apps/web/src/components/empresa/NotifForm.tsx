'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Loader2, ImagePlus, X, Bell } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'
import { apiGet, apiPost } from '@/lib/api'
import { trackEvent } from '@/lib/analytics'

const RECIPIENTS = [
  { value: 'all',     label: 'Todos los participantes' },
  { value: 'no_pred', label: 'Solo los que no cargaron pronósticos' },
  { value: 'top10',   label: 'Top 10 del ranking' },
] as const

type Recipient = typeof RECIPIENTS[number]['value']
type Tab = 'push'


function UpgradeGate() {
  return (
    <div className="card">
      <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
        <span className="text-[20px]">💬</span>
        <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Notificaciones</h3>
      </div>
      <div className="p-[20px] flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF4E5] flex items-center justify-center text-3xl">🔒</div>
        <div>
          <div className="text-[16px] font-black text-[#0D1A3A] mb-1">Función exclusiva de plan Premium y Pro</div>
          <div className="text-[13px] text-[#5A6480] font-medium leading-relaxed">
            Con el plan Free no podés enviar notificaciones a tus participantes.
          </div>
        </div>
        <div className="w-full rounded-2xl bg-[#FFF4E5] border border-[#FF8A00]/20 p-4 text-left flex flex-col gap-2">
          {[
            '📤 Mensajes masivos a todos tus participantes',
            '🎯 Filtrar por quien no cargó pronósticos',
            '🏆 Notificar al top 10 del ranking',
            '🖼️ Enviar imágenes adjuntas',
            '🔔 Notificaciones push web',
            '⏰ Recordatorios automáticos antes de cada partido',
          ].map(f => (
            <div key={f} className="text-[13px] font-medium text-[#5A6480]">{f}</div>
          ))}
        </div>
        <a
          href="/empresa/planes"
          className="w-full py-[14px] rounded-xl text-[14px] font-black text-white flex items-center justify-center gap-2 hover:opacity-90 transition-all"
          style={{ background: 'linear-gradient(135deg, #FF8A00, #FF6B00)', boxShadow: '0 4px 16px rgba(255,138,0,0.3)' }}
        >
          ⚡ Ver planes y precios
        </a>
      </div>
    </div>
  )
}


function NotifFormInner({ onSent }: { onSent?: () => void }) {
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('push')

  // Push
  const [pushTitle, setPushTitle] = useState('')
  const [pushBody, setPushBody] = useState('')
  const [pushImageUrl, setPushImageUrl] = useState<string | null>(null)
  const [pushRecipients, setPushRecipients] = useState<Recipient>('all')
  const [pushUploading, setPushUploading] = useState(false)
  const [pushSending, setPushSending] = useState(false)
  const [pushResult, setPushResult] = useState<{ sent: number; failed: number } | null>(null)
  const pushFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    apiGet<{ plan: string }>('/businesses/me')
      .then(b => setPlan(b.plan))
      .catch(() => setPlan('free'))
  }, [])

  useEffect(() => {
    const recipientsParam = searchParams.get('recipients')
    const channel = searchParams.get('channel')
    if (recipientsParam === 'no_pred') {
      setPushRecipients('no_pred')
    }
    if (channel === 'push') setTab('push')
  }, [searchParams])

  if (plan === null) return (
    <div className="card flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-[#8E96AE]" />
    </div>
  )

  if (plan === 'free') return <UpgradeGate />

  const handlePushImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPushUploading(true)
    try { setPushImageUrl(await uploadToR2(file)) }
    catch { alert('Error al subir la imagen') }
    finally { setPushUploading(false) }
  }

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) return
    setPushSending(true)
    setPushResult(null)
    try {
      const res = await apiPost<{ sent: number; failed: number }>('/notifications/push', {
        title: pushTitle, body: pushBody, recipients: pushRecipients, imageUrl: pushImageUrl ?? undefined,
      })
      trackEvent('biz_notification_sent', { channel: 'push' })
      setPushResult(res)
      onSent?.()
      setTimeout(() => setPushResult(null), 5000)
    } catch (e: any) {
      alert(e.message ?? 'Error al enviar push')
    } finally {
      setPushSending(false)
    }
  }

  return (
    <div className="card">
      {/* Push tab */}
      {tab === 'push' && (
        <div className="p-[20px] flex flex-col gap-5">
          <div className="field">
            <div className="field-label">¿A quién enviás?</div>
            <select value={pushRecipients} onChange={e => setPushRecipients(e.target.value as Recipient)} className="field-input cursor-pointer">
              {RECIPIENTS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="field">
            <div className="field-label">Título <span className="text-[#8E96AE] font-normal">({pushTitle.length}/65)</span></div>
            <input type="text" className="field-input" placeholder="Ej: ⚽ Recordatorio de pronósticos"
              maxLength={65} value={pushTitle} onChange={e => setPushTitle(e.target.value)} />
          </div>

          <div className="field">
            <div className="field-label">Mensaje <span className="text-[#8E96AE] font-normal">({pushBody.length}/240)</span></div>
            <textarea className="field-input min-h-[80px] resize-none leading-relaxed"
              placeholder="Ej: Los partidos de mañana arrancan a las 18hs. ¡Cargá tus predicciones!"
              maxLength={240} value={pushBody} onChange={e => setPushBody(e.target.value)} />
          </div>

          <div className="field">
            <div className="field-label">Imagen adjunta (opcional)</div>
            <input ref={pushFileRef} type="file" accept="image/*" className="hidden" onChange={handlePushImageUpload} />
            {pushImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                <img src={pushImageUrl} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setPushImageUrl(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button onClick={() => pushFileRef.current?.click()} disabled={pushUploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#002B72] hover:text-[#002B72] transition-all disabled:opacity-50">
                {pushUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {pushUploading ? 'Subiendo...' : 'Agregar imagen'}
              </button>
            )}
          </div>

          {pushResult && (
            <div className={`rounded-xl px-4 py-3 text-[13px] font-bold flex flex-col gap-1 ${pushResult.sent > 0 ? 'bg-[#E8F8F1] border border-[#18A06A]/20 text-[#18A06A]' : 'bg-[#FDECEB] border border-[#D93025]/20 text-[#D93025]'}`}>
              {pushResult.sent > 0 && <span>✅ Push enviado a {pushResult.sent} dispositivo{pushResult.sent !== 1 ? 's' : ''}</span>}
              {pushResult.sent === 0 && <span>⚠️ Ningún participante tiene notificaciones activadas</span>}
              {pushResult.failed > 0 && <span className="text-[#D93025]">❌ {pushResult.failed} fallaron</span>}
            </div>
          )}

          <button onClick={handleSendPush} disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
            className="w-full text-white text-[14px] font-black p-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #002B72, #1a5bbf)', boxShadow: '0 4px 16px rgba(0,43,114,0.25)' }}>
            {pushSending ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</> : <><Bell className="h-4 w-4" /> Enviar notificación push</>}
          </button>
        </div>
      )}
    </div>
  )
}

export function NotifForm({ onSent }: { onSent?: () => void }) {
  return (
    <Suspense fallback={null}>
      <NotifFormInner onSent={onSent} />
    </Suspense>
  )
}
