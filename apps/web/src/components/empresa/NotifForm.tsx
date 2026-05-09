'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, ImagePlus, X, Bell } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'
import { apiGet, apiPost } from '@/lib/api'

const DEFAULT_MSG = '⚽ ¡Hola! Recordá cargar tus pronósticos antes del próximo partido. ¡No te quedés afuera del ranking! 🏆'

const RECIPIENTS = [
  { value: 'all',     label: 'Todos los participantes' },
  { value: 'no_pred', label: 'Solo los que no cargaron pronósticos' },
  { value: 'top10',   label: 'Top 10 del ranking' },
] as const

type Recipient = typeof RECIPIENTS[number]['value']

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
          <div className="text-[16px] font-black text-[#0D1A3A] mb-1">
            Función exclusiva de plan Premium y Pro
          </div>
          <div className="text-[13px] text-[#5A6480] font-medium leading-relaxed">
            Con el plan Free no podés enviar notificaciones a tus participantes.
            Pasate a Premium o Pro para notificarlos con recordatorios, resultados y mensajes personalizados.
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
            <div key={f} className="text-[13px] font-medium text-[#5A6480] flex items-center gap-2">
              <span>{f}</span>
            </div>
          ))}
        </div>
        <a
          href="/empresa/planes"
          className="w-full py-[14px] rounded-xl text-[14px] font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #FF8A00, #FF6B00)', boxShadow: '0 4px 16px rgba(255,138,0,0.3)' }}
        >
          ⚡ Ver planes y precios
        </a>
      </div>
    </div>
  )
}

function WhatsAppPreview({ message, imageUrl }: { message: string; imageUrl?: string | null }) {
  const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">⚽</div>
        <div>
          <div className="text-white text-xs font-black leading-none">Prode Mundial 2026</div>
          <div className="text-white/60 text-[10px] font-bold">en línea</div>
        </div>
      </div>
      <div className="px-4 py-4 min-h-[80px]" style={{ background: '#ECE5DD' }}>
        <div className="ml-auto max-w-[85%] bg-white rounded-2xl rounded-tr-none shadow-sm overflow-hidden w-fit">
          {imageUrl && (
            <img src={imageUrl} alt="" className="w-full max-h-[80px] object-cover" />
          )}
          <div className="px-3 py-2">
            <p className="text-[13px] text-slate-800 leading-snug whitespace-pre-wrap break-words">
              {message || '…'}
            </p>
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[10px] text-slate-400">{time}</span>
              <span className="text-[10px]" style={{ color: '#53BDEB' }}>✓✓</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function NotifForm() {
  const [plan, setPlan] = useState<string | null>(null)

  // WhatsApp state
  const [message, setMessage] = useState(DEFAULT_MSG)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<Recipient>('all')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; skipped: number; failed: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Push state
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

  if (plan === null) return (
    <div className="card flex items-center justify-center py-12">
      <Loader2 className="h-6 w-6 animate-spin text-[#8E96AE]" />
    </div>
  )

  if (plan === 'free') return <UpgradeGate />

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadToR2(file)
      setImageUrl(url)
    } catch {
      alert('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSend = async () => {
    if (!message.trim()) return
    setSending(true)
    setResult(null)
    try {
      const res = await apiPost<{ sent: number; skipped: number; failed: number }>('/notifications/whatsapp', {
        message,
        imageUrl: imageUrl ?? undefined,
        recipients,
      })
      setResult(res)
      setTimeout(() => setResult(null), 5000)
    } catch (e: any) {
      alert(e.message ?? 'Error al enviar')
    } finally {
      setSending(false)
    }
  }

  const handlePushImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPushUploading(true)
    try {
      const url = await uploadToR2(file)
      setPushImageUrl(url)
    } catch {
      alert('Error al subir la imagen')
    } finally {
      setPushUploading(false)
    }
  }

  const handleSendPush = async () => {
    if (!pushTitle.trim() || !pushBody.trim()) return
    setPushSending(true)
    setPushResult(null)
    try {
      const res = await apiPost<{ sent: number; failed: number }>('/notifications/push', {
        title: pushTitle,
        body: pushBody,
        recipients: pushRecipients,
        imageUrl: pushImageUrl ?? undefined,
      })
      setPushResult(res)
      setTimeout(() => setPushResult(null), 5000)
    } catch (e: any) {
      alert(e.message ?? 'Error al enviar push')
    } finally {
      setPushSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── WHATSAPP ── */}
      <div className="card">
        <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
          <span className="text-[20px]">💬</span>
          <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Enviar por WhatsApp</h3>
        </div>

        <div className="p-[20px] flex flex-col gap-5">
          <div className="field">
            <div className="field-label">¿A quién enviás?</div>
            <select
              value={recipients}
              onChange={e => setRecipients(e.target.value as Recipient)}
              className="field-input cursor-pointer"
            >
              {RECIPIENTS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="field-label">Mensaje</div>
            <textarea
              className="field-input min-h-[120px] resize-none leading-relaxed"
              placeholder="Escribí tu mensaje aquí..."
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-label">Imagen adjunta (opcional)</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setImageUrl(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#075E54] hover:text-[#075E54] transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? 'Subiendo...' : 'Agregar imagen'}
              </button>
            )}
          </div>

          <div className="field">
            <div className="field-label uppercase text-[10px] tracking-widest text-[#8E96AE]">Vista previa</div>
            <WhatsAppPreview message={message} imageUrl={imageUrl} />
          </div>

          {result && (
            <div className={`rounded-xl px-4 py-3 text-[13px] font-bold flex flex-col gap-1 ${result.sent > 0 ? 'bg-[#E8F8F1] border border-[#18A06A]/20 text-[#18A06A]' : 'bg-[#FDECEB] border border-[#D93025]/20 text-[#D93025]'}`}>
              {result.sent > 0 && <span>✅ Enviado a {result.sent} participante{result.sent !== 1 ? 's' : ''}</span>}
              {result.skipped > 0 && <span className="text-[#8E96AE]">⚠️ {result.skipped} sin teléfono válido registrado</span>}
              {result.failed > 0 && <span className="text-[#D93025]">❌ {result.failed} fallaron — verificá las credenciales de Meta en el servidor</span>}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !message.trim()}
            className="w-full text-white text-[14px] font-black p-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60"
            style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
          >
            {sending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              : <>💬 Enviar por WhatsApp</>}
          </button>
        </div>
      </div>

      {/* ── WEB PUSH ── */}
      <div className="card">
        <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
          <Bell className="h-5 w-5 text-[#0D1A3A]" />
          <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Notificación push web</h3>
          <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#002B72]/10 text-[#002B72]">Navegador</span>
        </div>

        <div className="p-[20px] flex flex-col gap-5">
          <div className="field">
            <div className="field-label">¿A quién enviás?</div>
            <select
              value={pushRecipients}
              onChange={e => setPushRecipients(e.target.value as Recipient)}
              className="field-input cursor-pointer"
            >
              {RECIPIENTS.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <div className="field-label">Título <span className="text-[#8E96AE] font-normal">({pushTitle.length}/65)</span></div>
            <input
              type="text"
              className="field-input"
              placeholder="Ej: ⚽ Recordatorio de pronósticos"
              maxLength={65}
              value={pushTitle}
              onChange={e => setPushTitle(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-label">Cuerpo del mensaje <span className="text-[#8E96AE] font-normal">({pushBody.length}/240)</span></div>
            <textarea
              className="field-input min-h-[80px] resize-none leading-relaxed"
              placeholder="Ej: Los partidos de mañana arrancan a las 18hs. ¡Cargá tus predicciones!"
              maxLength={240}
              value={pushBody}
              onChange={e => setPushBody(e.target.value)}
            />
          </div>

          <div className="field">
            <div className="field-label">Imagen adjunta (opcional)</div>
            <input ref={pushFileRef} type="file" accept="image/*" className="hidden" onChange={handlePushImageUpload} />
            {pushImageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                <img src={pushImageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => setPushImageUrl(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => pushFileRef.current?.click()}
                disabled={pushUploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#002B72] hover:text-[#002B72] transition-all disabled:opacity-50"
              >
                {pushUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {pushUploading ? 'Subiendo...' : 'Agregar imagen'}
              </button>
            )}
          </div>

          {pushResult && (
            <div className={`rounded-xl px-4 py-3 text-[13px] font-bold flex flex-col gap-1 ${pushResult.sent > 0 ? 'bg-[#E8F8F1] border border-[#18A06A]/20 text-[#18A06A]' : 'bg-[#FDECEB] border border-[#D93025]/20 text-[#D93025]'}`}>
              {pushResult.sent > 0 && <span>✅ Push enviado a {pushResult.sent} dispositivo{pushResult.sent !== 1 ? 's' : ''}</span>}
              {pushResult.sent === 0 && <span>⚠️ Ningún participante tiene notificaciones activadas aún</span>}
              {pushResult.failed > 0 && <span className="text-[#D93025]">❌ {pushResult.failed} fallaron</span>}
            </div>
          )}

          <button
            onClick={handleSendPush}
            disabled={pushSending || !pushTitle.trim() || !pushBody.trim()}
            className="w-full text-white text-[14px] font-black p-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #002B72, #1a5bbf)', boxShadow: '0 4px 16px rgba(0,43,114,0.25)' }}
          >
            {pushSending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              : <><Bell className="h-4 w-4" /> Enviar notificación push</>}
          </button>
        </div>
      </div>
    </div>
  )
}
