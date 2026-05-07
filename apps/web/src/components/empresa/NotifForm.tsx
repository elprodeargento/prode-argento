'use client'

import { useState, useRef } from 'react'
import { Loader2, ImagePlus, X } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'
import { WhatsAppSendModal } from './WhatsAppSendModal'

const DEFAULT_MSG = '¡Che! ¿Ya cargaste tus pronósticos para la Fecha 2? Quedan solo 4 días. No te quedes sin tus puntos 😅⚽'

function WhatsAppPreview({ message }: { message: string }) {
  const time = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* WA header */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: '#075E54' }}>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm">⚽</div>
        <div>
          <div className="text-white text-xs font-black leading-none">Prode Mundial 2026</div>
          <div className="text-white/60 text-[10px] font-bold">en línea</div>
        </div>
      </div>
      {/* WA chat */}
      <div className="px-4 py-4 min-h-[80px]" style={{ background: '#ECE5DD' }}>
        <div className="ml-auto max-w-[85%] bg-white rounded-2xl rounded-tr-none px-3 py-2 shadow-sm w-fit">
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
  )
}

function EmailPreview({ message }: { message: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="w-14 text-right text-slate-400">De:</span>
          <span className="text-slate-700">Prode Mundial 2026 &lt;no-reply@elprode.ar&gt;</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="w-14 text-right text-slate-400">Para:</span>
          <span className="text-slate-700">participantes@empresa.com</span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <span className="w-14 text-right text-slate-400">Asunto:</span>
          <span className="text-slate-900 font-black">Mensaje de tu prode ⚽</span>
        </div>
      </div>
      <div className="bg-white px-4 py-4 min-h-[80px]">
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap break-words">
          {message || '…'}
        </p>
      </div>
    </div>
  )
}

export function NotifForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [channel, setChannel] = useState<'email' | 'whatsapp'>('email')
  const [message, setMessage] = useState(DEFAULT_MSG)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [waOpen, setWaOpen] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

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

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    }, 1500)
  }

  return (
    <div className="card">
      <div className="px-[18px] py-[14px] bg-[#F1F3F9] border-b-[1.5px] border-[#DDE1EF] flex items-center gap-3">
        <span className="text-[20px]">📢</span>
        <h3 className="text-[14px] font-extrabold text-[#0D1A3A]">Enviar mensaje</h3>
      </div>

      <form onSubmit={handleSubmit} className="p-[20px] flex flex-col gap-5">
        <div className="field">
          <div className="field-label">¿A quién enviás?</div>
          <select className="field-input cursor-pointer">
            <option>Todos los participantes (87)</option>
            <option>Solo los que no cargaron fecha 2 (5)</option>
            <option>El top 10 del ranking</option>
          </select>
        </div>

        <div className="field">
          <div className="field-label">Canal</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setChannel('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all border-[1.5px] ${
                channel === 'email'
                ? 'bg-[#EBF4FC] border-[#003FA3] text-[#003FA3]'
                : 'bg-white border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9]'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => setChannel('whatsapp')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-[13px] font-bold transition-all border-[1.5px] ${
                channel === 'whatsapp'
                ? 'bg-[#EBF4FC] border-[#003FA3] text-[#003FA3]'
                : 'bg-white border-[#DDE1EF] text-[#5A6480] hover:bg-[#F1F3F9]'
              }`}
            >
              💬 WhatsApp
            </button>
          </div>
        </div>

        <div className="field">
          <div className="field-label">Mensaje</div>
          <textarea
            className="field-input min-h-[120px] resize-none leading-relaxed"
            placeholder="Escribí tu mensaje aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* IMAGE ATTACHMENT — solo WhatsApp */}
        {channel === 'whatsapp' && (
          <div className="field">
            <div className="field-label">Imagen adjunta (opcional)</div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 h-24">
                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-slate-200 text-sm font-bold text-slate-500 hover:border-[#075E54] hover:text-[#075E54] transition-all disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {uploading ? 'Subiendo...' : 'Agregar imagen'}
              </button>
            )}
          </div>
        )}

        {/* PREVIEW */}
        <div className="field">
          <div className="field-label uppercase text-[10px] tracking-widest text-[#8E96AE]">Vista previa</div>
          {channel === 'whatsapp' ? (
            <WhatsAppPreview message={message} />
          ) : (
            <EmailPreview message={message} />
          )}
        </div>

        {channel === 'whatsapp' ? (
          <button
            type="button"
            onClick={() => setWaOpen(true)}
            disabled={!message.trim()}
            className="w-full text-white text-[14px] font-black p-[14px] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-50"
            style={{ background: '#25D366', boxShadow: '0 4px 16px rgba(37,211,102,0.3)' }}
          >
            💬 Ver vista previa y enviar por WhatsApp
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || sent}
            className="w-full bg-[#002B72] text-white text-[14px] font-black p-[14px] rounded-xl flex items-center justify-center gap-2 hover:bg-[#00318A] transition-all shadow-lg shadow-[#002B72]/20 disabled:opacity-50"
          >
            {loading ? <>⏳ Enviando…</> : sent ? <>✓ ¡Enviado!</> : <>📤 Enviar mensaje</>}
          </button>
        )}
      </form>

      <WhatsAppSendModal
        open={waOpen}
        onClose={() => setWaOpen(false)}
        defaultMessage={message}
        defaultImageUrl={imageUrl}
        title="Enviar notificación por WhatsApp"
      />
    </div>
  )
}
