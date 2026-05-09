'use client'

import { useState, useRef, useEffect } from 'react'
import { Loader2, ImagePlus, X } from 'lucide-react'
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
        <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Enviar por WhatsApp</h3>
      </div>
      <div className="p-[20px] flex flex-col items-center gap-5 text-center">
        <div className="w-16 h-16 rounded-full bg-[#FFF4E5] flex items-center justify-center text-3xl">🔒</div>
        <div>
          <div className="text-[16px] font-black text-[#0D1A3A] mb-1">
            Función exclusiva de plan Premium y Pro
          </div>
          <div className="text-[13px] text-[#5A6480] font-medium leading-relaxed">
            Con el plan Free no podés enviar mensajes de WhatsApp a tus participantes.
            Pasate a Premium o Pro para notificarlos con recordatorios, resultados y mensajes personalizados.
          </div>
        </div>
        <div className="w-full rounded-2xl bg-[#FFF4E5] border border-[#FF8A00]/20 p-4 text-left flex flex-col gap-2">
          {[
            '📤 Mensajes masivos a todos tus participantes',
            '🎯 Filtrar por quien no cargó pronósticos',
            '🏆 Notificar al top 10 del ranking',
            '🖼️ Enviar imágenes adjuntas',
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
  const [message, setMessage] = useState(DEFAULT_MSG)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [recipients, setRecipients] = useState<Recipient>('all')
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ sent: number; skipped: number; failed: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="card">
      <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
        <span className="text-[20px]">💬</span>
        <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Enviar por WhatsApp</h3>
      </div>

      <div className="p-[20px] flex flex-col gap-5">
        {/* RECIPIENTS */}
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

        {/* MESSAGE */}
        <div className="field">
          <div className="field-label">Mensaje</div>
          <textarea
            className="field-input min-h-[120px] resize-none leading-relaxed"
            placeholder="Escribí tu mensaje aquí..."
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>

        {/* IMAGE */}
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

        {/* PREVIEW */}
        <div className="field">
          <div className="field-label uppercase text-[10px] tracking-widest text-[#8E96AE]">Vista previa</div>
          <WhatsAppPreview message={message} imageUrl={imageUrl} />
        </div>

        {/* RESULT */}
        {result && (
          <div className={`rounded-xl px-4 py-3 text-[13px] font-bold flex flex-col gap-1 ${result.sent > 0 ? 'bg-[#E8F8F1] border border-[#18A06A]/20 text-[#18A06A]' : 'bg-[#FDECEB] border border-[#D93025]/20 text-[#D93025]'}`}>
            {result.sent > 0 && <span>✅ Enviado a {result.sent} participante{result.sent !== 1 ? 's' : ''}</span>}
            {result.skipped > 0 && <span className="text-[#8E96AE]">⚠️ {result.skipped} sin teléfono válido registrado</span>}
            {result.failed > 0 && <span className="text-[#D93025]">❌ {result.failed} fallaron — verificá las credenciales de Meta en el servidor</span>}
          </div>
        )}

        {/* SEND BUTTON */}
        <button
          onClick={handleSend}
          disabled={sending || !message.trim()}
          className="w-full text-white text-[14px] font-black p-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60"
          style={{
            background: '#25D366',
            boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
          }}
        >
          {sending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
            : <>💬 Enviar por WhatsApp</>}
        </button>
      </div>
    </div>
  )
}
