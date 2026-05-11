'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Loader2, Download } from 'lucide-react'
import { apiPost } from '@/lib/api'
import { SOCIAL_ENABLED } from '@/lib/features'
import { toPng } from 'html-to-image'

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

interface PodiumItem {
  name: string
  points: number
  position: number
}

interface IgPublishModalProps {
  open: boolean
  onClose: () => void
  podium: PodiumItem[]
  empresa?: string
  igConnected?: boolean
  defaultHashtags?: string
  imageUrl?: string
}

const HASHTAG_OPTIONS = [
  '#ProdeMundial2026',
  '#Mundial2026',
  '#Prode',
  '#Argentina',
  '#MundialUSA',
  '#FutbolArgentino',
]

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}

export function IgPublishModal({
  open,
  onClose,
  podium,
  empresa = 'MI COMERCIO',
  igConnected = false,
  defaultHashtags = '#ProdeMundial2026 #Mundial2026',
  imageUrl,
}: IgPublishModalProps) {
  const [caption, setCaption] = useState(
    `🏆 ¡Terminó la fecha! Así quedó el podio del prode de ${empresa}.\n¡Felicitaciones a los campeones! ⚽`
  )
  const podiumRef = useRef<HTMLDivElement>(null)
  const [activeHashtags, setActiveHashtags] = useState<string[]>(['#ProdeMundial2026', '#Mundial2026'])
  const [posting, setPosting] = useState(false)
  const [posted, setPosted] = useState(false)
  const [postError, setPostError] = useState('')

  const p1 = podium.find((i) => i.position === 1)
  const p2 = podium.find((i) => i.position === 2)
  const p3 = podium.find((i) => i.position === 3)

  useEffect(() => {
    if (open) {
      setPosted(false)
      setPostError('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const toggleHashtag = (tag: string) => {
    setActiveHashtags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const fullCaption = `${caption}\n\n${activeHashtags.join(' ')}`

  const handlePost = async () => {
    if (!SOCIAL_ENABLED) {
      if (!podiumRef.current) return
      setPosting(true)
      try {
        const pixelRatio = 1080 / podiumRef.current.offsetWidth
        const image = await toPng(podiumRef.current, {
          backgroundColor: '#0a0a0a',
          pixelRatio,
          style: {
            margin: '0',
            transform: 'none'
          }
        })
        const link = document.createElement('a')
        link.href = image
        link.download = `podio-${empresa.toLowerCase().replace(/\\s+/g, '')}.png`
        link.click()
        setPosted(true)
        setTimeout(() => onClose(), 2000)
      } catch (e: any) {
        console.error('html-to-image error:', e)
        setPostError(`Error al exportar la imagen. ${e?.message || ''}`)
      } finally {
        setPosting(false)
      }
      return
    }

    if (!imageUrl) {
      setPostError('No hay imagen del podio para publicar. Generá la imagen primero.')
      return
    }
    setPosting(true)
    setPostError('')
    try {
      await apiPost('/instagram/publish', { image_url: imageUrl, caption: fullCaption })
      setPosted(true)
    } catch (e: any) {
      setPostError(e.message ?? 'Error al publicar en Instagram. Intentá de nuevo.')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)', paddingTop: 'env(safe-area-inset-top, 16px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ animation: 'igSlideIn 0.3s cubic-bezier(0.34,1.1,0.64,1)' }}
      >
        <style>{`
          @keyframes igSlideIn {
            from { transform: scale(0.92) translateY(20px); opacity: 0; }
            to   { transform: none; opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-base font-black text-slate-900">
            {SOCIAL_ENABLED ? <IgIcon className="h-5 w-5 text-pink-500" /> : <Download className="h-5 w-5 text-blue-500" />}
            {SOCIAL_ENABLED ? 'Publicar en Instagram' : 'Exportar para Instagram'}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center px-6 pt-5 pb-2">
          <div
            className="w-full max-w-[310px] rounded-[36px] p-2.5"
            style={{
              background: '#000',
              boxShadow: '0 12px 48px rgba(0,0,0,0.35), inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}
          >
            {/* Notch */}
            <div className="w-20 h-[22px] bg-black rounded-b-2xl mx-auto mb-1 relative z-10" />

            <div className="rounded-[28px] overflow-hidden bg-[#fafafa]">
              {/* IG app bar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-[#efefef]">
                <span className="text-[18px] font-black text-black" style={{ fontFamily: 'Georgia, serif', letterSpacing: '-0.5px' }}>
                  Instagram
                </span>
                <div className="flex gap-3.5 text-[17px]">💬 🔔</div>
              </div>

              {/* Post header */}
              <div className="flex items-center gap-2.5 px-3 py-2 bg-white">
                <div className="w-9 h-9 rounded-full flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', padding: '2px' }}
                >
                  <div className="w-full h-full rounded-full bg-[#002B72] flex items-center justify-center text-xs font-black text-white border-2 border-white">
                    {getInitials(empresa)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] font-black text-black leading-none">
                    {empresa.toLowerCase().replace(/\s+/g, '')}
                  </div>
                  <div className="text-[9px] text-[#8e8e8e]">Buenos Aires, Argentina</div>
                </div>
                <span className="text-base font-black text-black">···</span>
              </div>

              {/* Post image — podio CSS art */}
              <div ref={podiumRef} className="w-full aspect-[4/5] relative overflow-hidden flex items-end" style={{ background: '#0a0a0a' }}>
                {/* Gradient background */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(160deg, #001040 0%, #002B72 35%, #0a0a1a 70%, #000 100%)' }} />
                {/* Dot texture */}
                <div className="absolute inset-0"
                  style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.035) 1px, transparent 1px)', backgroundSize: '18px 18px' }}
                />
                {/* AFA stripes */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 z-30"
                  style={{ background: 'linear-gradient(90deg, #74ACDF 0%, #74ACDF 50%, #fff 50%, #fff 100%)', backgroundSize: '10px 6px' }}
                />

                {/* Content */}
                <div className="relative z-20 w-full flex flex-col items-center justify-between px-3 py-3.5 h-full">
                  {/* Company mini header */}
                  <div className="flex items-center gap-1.5 self-start">
                    <div className="w-5 h-5 rounded-[5px] bg-white/10 border border-white/20 flex items-center justify-center text-[9px]">⚽</div>
                    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest">{empresa}</span>
                  </div>

                  {/* Center block */}
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="text-2xl">🏆</span>
                    <div className="font-bebas text-[28px] text-white tracking-[4px] leading-none">CAMPEONES</div>
                    <div className="text-[8px] text-white/50 font-black uppercase tracking-widest">Prode Mundial 2026</div>
                  </div>

                  {/* Podium */}
                  <div className="flex items-end justify-center gap-1.5 w-full">
                    {/* 2nd */}
                    <div className="flex flex-col items-center gap-0.5 flex-1">
                      <div className="w-8 h-8 rounded-full border-2 bg-white/10 flex items-center justify-center text-[10px] font-black text-white"
                        style={{ borderColor: '#A0A8C0' }}>
                        {p2 ? getInitials(p2.name) : '2°'}
                      </div>
                      <div className="text-[7px] font-black text-white/90 max-w-[52px] text-center truncate">{p2?.name || 'TBD'}</div>
                      <div className="text-[9px] font-black" style={{ color: '#A0A8C0' }}>{p2?.points ?? 0}pts</div>
                      <div className="w-full h-8 rounded-t-[4px] flex items-center justify-center font-bebas text-[12px] text-white/70"
                        style={{ background: 'rgba(100,115,150,0.7)' }}>2°</div>
                    </div>
                    {/* 1st */}
                    <div className="flex flex-col items-center gap-0.5 flex-1">
                      <span className="text-[11px]">👑</span>
                      <div className="w-10 h-10 rounded-full border-[2.5px] bg-white/10 flex items-center justify-center text-[12px] font-black text-white"
                        style={{ borderColor: '#F5C518' }}>
                        {p1 ? getInitials(p1.name) : '1°'}
                      </div>
                      <div className="text-[7px] font-black text-white/90 max-w-[56px] text-center truncate">{p1?.name || 'TBD'}</div>
                      <div className="text-[10px] font-black" style={{ color: '#F5C518' }}>{p1?.points ?? 0}pts</div>
                      <div className="w-full h-11 rounded-t-[4px] flex items-center justify-center font-bebas text-[14px]"
                        style={{ background: 'rgba(245,197,24,0.85)', color: '#002B72' }}>1°</div>
                    </div>
                    {/* 3rd */}
                    <div className="flex flex-col items-center gap-0.5 flex-1">
                      <div className="w-7 h-7 rounded-full border-2 bg-white/10 flex items-center justify-center text-[9px] font-black text-white"
                        style={{ borderColor: '#B07850' }}>
                        {p3 ? getInitials(p3.name) : '3°'}
                      </div>
                      <div className="text-[7px] font-black text-white/90 max-w-[52px] text-center truncate">{p3?.name || 'TBD'}</div>
                      <div className="text-[9px] font-black" style={{ color: '#B07850' }}>{p3?.points ?? 0}pts</div>
                      <div className="w-full h-6 rounded-t-[4px] flex items-center justify-center font-bebas text-[11px] text-white/70"
                        style={{ background: 'rgba(120,80,50,0.7)' }}>3°</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Post actions */}
              <div className="flex items-center gap-3 px-3 pt-2 pb-1 bg-white text-[18px]">
                <span className="cursor-pointer">🤍</span>
                <span className="cursor-pointer">💬</span>
                <span className="cursor-pointer">↗️</span>
                <span className="cursor-pointer ml-auto">🔖</span>
              </div>
              <div className="px-3 pb-1 text-[11px] font-black text-black bg-white">14 Me gusta</div>
              <div className="px-3 pb-1.5 text-[10px] text-black bg-white leading-snug">
                <span className="font-black">{empresa.toLowerCase().replace(/\s+/g, '')}</span>{' '}
                {caption.slice(0, 60)}
                {caption.length > 60 ? '...' : ''}
              </div>
              <div className="px-3 pb-2.5 text-[9px] text-[#8e8e8e] bg-white uppercase tracking-widest">
                HACE 1 HORA
              </div>

              {/* IG bottom nav */}
              <div className="flex justify-around items-center py-2 bg-white border-t border-[#efefef] text-[18px]">
                <span>🏠</span><span>🔍</span><span>➕</span><span>🎬</span>
                <div className="w-5 h-5 rounded-full bg-[#002B72] border-2 border-black" />
              </div>
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="px-6 pb-2 space-y-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Opciones</p>

          {/* Caption editor */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-800 outline-none resize-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Hashtag chips */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">Hashtags</label>
            <div className="flex flex-wrap gap-2">
              {HASHTAG_OPTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleHashtag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    activeHashtags.includes(tag)
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Connect notice if not connected */}
          {SOCIAL_ENABLED && !igConnected && (
            <div className="flex items-start gap-2.5 bg-orange-50 border border-orange-200/60 rounded-xl p-3.5">
              <span className="text-xl flex-shrink-0">⚠️</span>
              <p className="text-xs font-semibold text-orange-700 leading-relaxed">
                <strong className="font-black">Instagram no conectado.</strong> Para publicar necesitás{' '}
                <span className="underline cursor-pointer" onClick={onClose}>conectar tu cuenta</span>{' '}
                desde Configuración.
              </p>
            </div>
          )}
        </div>

        {/* Post error */}
        {postError && (
          <div className="mx-6 mb-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-700 leading-relaxed">
            ⚠️ {postError}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2.5 px-6 pt-2" style={{ paddingBottom: 'max(1.5rem, calc(1rem + env(safe-area-inset-bottom)))' }}>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handlePost}
            disabled={posting || posted || (SOCIAL_ENABLED && !igConnected)}
            className="flex-[2] py-3 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-92 active:scale-[0.98]"
            style={{
              background: posted
                ? '#18A06A'
                : SOCIAL_ENABLED
                  ? 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366)'
                  : '#002B72',
              boxShadow: posted ? '0 4px 16px rgba(24,160,106,0.3)' : SOCIAL_ENABLED ? '0 4px 16px rgba(220,39,67,0.3)' : '0 4px 16px rgba(0,43,114,0.3)',
            }}
          >
            {posting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> {SOCIAL_ENABLED ? 'Publicando...' : 'Exportando...'}</>
            ) : posted ? (
              <>{SOCIAL_ENABLED ? '✓ Publicado en Instagram' : '✓ Imagen descargada'}</>
            ) : (
              <>{SOCIAL_ENABLED ? <><IgIcon className="h-4 w-4" /> Publicar en Instagram</> : <><Download className="h-4 w-4" /> Descargar imagen</>}</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
