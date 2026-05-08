'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Loader2, ImagePlus } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'
import { apiPost } from '@/lib/api'

export interface WhatsAppSendModalProps {
  open: boolean
  onClose: () => void
  defaultMessage: string
  defaultImageUrl?: string | null
  businessName?: string
  title?: string
}

export function WhatsAppSendModal({
  open,
  onClose,
  defaultMessage,
  defaultImageUrl,
  businessName = 'Prode Mundial 2026',
  title = 'Enviar por WhatsApp',
}: WhatsAppSendModalProps) {
  const [message, setMessage] = useState(defaultMessage)
  const [imageUrl, setImageUrl] = useState<string | null>(defaultImageUrl ?? null)
  const [uploading, setUploading] = useState(false)
  const [recipient, setRecipient] = useState('all')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })

  useEffect(() => {
    if (open) {
      setMessage(defaultMessage)
      setImageUrl(defaultImageUrl ?? null)
      setSent(false)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open, defaultMessage, defaultImageUrl])

  if (!open) return null

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
    setSending(true)
    try {
      await apiPost('/notifications/whatsapp', { message, imageUrl, recipients: recipient })
      setSent(true)
      setTimeout(() => { setSent(false); onClose() }, 2500)
    } catch (e: any) {
      alert(e.message ?? 'Error al enviar')
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ paddingTop: 'env(safe-area-inset-top, 16px)', background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'waSlideIn 0.3s cubic-bezier(0.34,1.1,0.64,1)' }}
      >
        <style>{`
          @keyframes waSlideIn {
            from { transform: scale(0.92) translateY(20px); opacity: 0; }
            to   { transform: none; opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-base font-black text-slate-900">
            💬 {title}
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center px-6 pt-5 pb-2">
          <div className="w-full max-w-[310px] rounded-[36px] p-2.5"
            style={{ background: '#000', boxShadow: '0 12px 48px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)' }}>
            <div className="w-20 h-[22px] bg-black rounded-b-2xl mx-auto mb-1" />
            <div className="rounded-[28px] overflow-hidden">
              {/* WA header */}
              <div className="flex items-center gap-2.5 px-3 py-2.5" style={{ background: '#075E54' }}>
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">⚽</div>
                <div className="flex-1">
                  <div className="text-white text-[11px] font-black leading-none">{businessName}</div>
                  <div className="text-white/60 text-[9px] font-bold">en línea</div>
                </div>
                <div className="text-white/80 text-[14px] flex gap-3">📞 ···</div>
              </div>

              {/* Chat */}
              <div className="px-3 py-4 min-h-[140px] flex flex-col justify-end"
                style={{
                  background: '#ECE5DD',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='0.03'%3E%3Cpath d='M20 20h4v4h-4zM0 0h4v4H0zM0 20h4v4H0zM20 0h4v4h-4z'/%3E%3C/g%3E%3C/svg%3E")`,
                }}>
                <div className="ml-auto max-w-[90%] bg-white rounded-2xl rounded-tr-none shadow-sm overflow-hidden w-fit">
                  {imageUrl && (
                    <img src={imageUrl} alt="" className="w-full max-h-[90px] object-cover" />
                  )}
                  <div className="px-3 py-2">
                    <p className="text-[11px] text-slate-800 leading-snug whitespace-pre-wrap break-words">
                      {message || '…'}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-[9px] text-slate-400">{time}</span>
                      <span className="text-[9px]" style={{ color: '#53BDEB' }}>✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* WA input bar */}
              <div className="flex items-center gap-2 px-2 py-2" style={{ background: '#F0F2F5' }}>
                <div className="flex-1 bg-white rounded-full px-3 py-1.5 text-[10px] text-slate-400">Mensaje</div>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[12px]"
                  style={{ background: '#075E54' }}>🎤</div>
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="px-6 pb-2 space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">¿A quién enviás?</label>
            <select
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none focus:border-[#075E54] transition-all"
            >
              <option value="all">Todos los participantes</option>
              <option value="no_pred">Solo los que no cargaron pronósticos</option>
              <option value="top10">El top 10 del ranking</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">Mensaje</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none resize-none focus:border-[#075E54] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">Imagen adjunta (opcional)</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <button onClick={() => setImageUrl(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors">
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
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-6 pb-6 pt-2">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={sending || sent || !message.trim()}
            className="flex-[2] py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            style={{
              background: sent ? '#18A06A' : '#25D366',
              boxShadow: sent ? '0 4px 16px rgba(24,160,106,0.3)' : '0 4px 16px rgba(37,211,102,0.3)',
            }}
          >
            {sending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
              : sent
              ? <>✓ ¡Enviado!</>
              : <>💬 Enviar por WhatsApp</>}
          </button>
        </div>
      </div>
    </div>
  )
}
