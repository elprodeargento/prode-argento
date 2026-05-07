'use client'
import { useState } from 'react'
import { QrCode, Mail, MessageCircle, Copy, CheckCircle2, X } from 'lucide-react'

export function DashboardLink({ empresa }: { empresa: any }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  const url = `${empresa?.slug ?? 'miempresa'}.elprode.ar`
  const fullUrl = `https://${url}`

  const copy = () => {
    navigator.clipboard?.writeText(fullUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareWA = () => {
    const text = encodeURIComponent(`¡Súmate al prode de ${empresa.name}! ⚽🏆 Cargá tus resultados acá: ${fullUrl}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const shareEmail = () => {
    const subject = encodeURIComponent(`Prode Mundial 2026 - ${empresa.name}`)
    const body = encodeURIComponent(`Hola! Te invitamos a participar de nuestro prode. Podés cargar tus pronósticos acá: ${fullUrl}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  return (
    <>
      <div className="rounded-2xl p-6 text-white relative overflow-hidden h-full flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #002B72, #003FA3)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative z-10">
          <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4 italic">Tu link del prode</div>
          <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-4 py-3 mb-6 backdrop-blur-sm group hover:bg-white/15 transition-all">
            <span className="flex-1 font-black text-sm text-white truncate italic">{url}</span>
            <button
              onClick={copy}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all flex items-center gap-2 shadow-lg ${copied ? 'bg-emerald-500 text-white' : 'bg-[#F5C518] text-[#002B72] hover:scale-105 active:scale-95'}`}
            >
              {copied ? <><CheckCircle2 className="h-3 w-3" /> COPIADO</> : <><Copy className="h-3 w-3" /> COPIAR</>}
            </button>
          </div>
        </div>

        <div className="relative z-10 flex gap-2 flex-wrap">
          <button
            onClick={shareWA}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black text-white hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all uppercase tracking-tighter"
          >
            <MessageCircle className="h-4 w-4 text-emerald-400" />
            WhatsApp
          </button>
          <button
            onClick={shareEmail}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black text-white hover:bg-blue-400/20 hover:border-blue-400/40 transition-all uppercase tracking-tighter"
          >
            <Mail className="h-4 w-4 text-blue-300" />
            Email
          </button>
          <button
            onClick={() => setShowQR(true)}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black text-white hover:bg-white/20 transition-all uppercase tracking-tighter"
          >
            <QrCode className="h-4 w-4" />
            Ver QR
          </button>
        </div>
      </div>

      {/* QR MODAL */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowQR(false)} />
          <div className="relative bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <button onClick={() => setShowQR(false)} className="absolute top-6 right-6 text-slate-300 hover:text-slate-900 transition-colors">
              <X className="h-6 w-6" />
            </button>
            <div className="text-center">
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Compartí tu Prode</div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Código QR</h3>

              <div className="bg-slate-50 p-6 rounded-3xl mb-6 flex items-center justify-center border-2 border-slate-100">
                <div className="w-48 h-48 bg-white rounded-2xl flex items-center justify-center shadow-inner relative group">
                  <QrCode className="h-40 w-40 text-slate-900" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 rounded-2xl">
                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-xs">IMPRIMIR QR</button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-400 font-bold mb-8 italic">Escaneá este código para entrar directamente al prode de {empresa.name}</p>

              <button
                onClick={() => setShowQR(false)}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-sm shadow-xl shadow-slate-900/20 active:scale-95 transition-all"
              >
                CERRAR
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
