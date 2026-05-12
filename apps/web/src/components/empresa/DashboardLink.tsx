'use client'
import { useState } from 'react'
import { ScanQrCode, Mail, MessageCircle, Copy, CheckCircle2, X, Printer, Download, Loader2 } from 'lucide-react'
import { generateQRCard } from '@/lib/qr/card'
import { trackEvent } from '@/lib/analytics'

export function DashboardLink({ empresa }: { empresa: any }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null)
  const [loadingQR, setLoadingQR] = useState(false)

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
  
  const handleShowQR = async () => {
    setShowQR(true)
    if (!qrImageUrl) {
      setLoadingQR(true)
      try {
        const blob = await generateQRCard({
          shareUrl: fullUrl,
          businessName: empresa.name || 'Mi Prode',
          primaryColor: empresa.primary_color || '#002B72',
          logoUrl: empresa.logo_url
        })
        const url = URL.createObjectURL(blob)
        setQrImageUrl(url)
      } catch (err) {
        console.error('Error generating QR card:', err)
      } finally {
        setLoadingQR(false)
      }
    }
  }

  const downloadQR = () => {
    if (!qrImageUrl) return
    trackEvent('qr_downloaded')
    const a = document.createElement('a')
    a.href = qrImageUrl
    a.download = `qr-${empresa.slug}.png`
    a.click()
  }

  const printQR = () => {
    if (!qrImageUrl) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
        <head>
          <title>Imprimir QR - ${empresa.name}</title>
          <style>
            body { margin: 0; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #eee; }
            img { max-width: 100%; height: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-radius: 20px; }
            @media print {
              body { background: white; }
              img { width: 100%; max-width: 100%; border-radius: 0; box-shadow: none; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <img src="${qrImageUrl}" />
        </body>
      </html>
    `)
    win.document.close()
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
            onClick={handleShowQR}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-[10px] font-black text-white hover:bg-white/20 transition-all uppercase tracking-tighter"
          >
            <ScanQrCode className="h-4 w-4" />
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
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2">Kit de Difusión</div>
              <h3 className="text-2xl font-black text-slate-900 mb-6">Tu código QR</h3>

              <div className="mb-8 flex items-center justify-center">
                <div className="relative group w-full aspect-square max-w-[280px] bg-slate-50 rounded-3xl overflow-hidden border-2 border-slate-100 shadow-xl shadow-slate-200/50">
                  {loadingQR ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white gap-3">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Generando diseño...</span>
                    </div>
                  ) : qrImageUrl ? (
                    <>
                      <img
                        src={qrImageUrl}
                        alt="QR Card"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-white/80 backdrop-blur-sm p-4 gap-3">
                        <button onClick={printQR} className="w-full bg-[#002B72] text-white px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg">
                          <Printer className="h-4 w-4" />
                          IMPRIMIR DISEÑO
                        </button>
                        <button onClick={downloadQR} className="w-full bg-white border-2 border-[#002B72] text-[#002B72] px-6 py-3 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all">
                          <Download className="h-4 w-4" />
                          DESCARGAR PNG
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full text-red-500 font-bold text-sm p-8 text-center">
                      No se pudo generar el diseño del QR
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[13px] text-slate-500 font-bold mb-8 px-4">
                Este diseño incluye tu logo y colores. Es ideal para imprimir y pegar en tu local.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  CERRAR
                </button>
                <button
                  onClick={downloadQR}
                  disabled={!qrImageUrl}
                  className="flex-1 bg-[#002B72] text-white py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50"
                >
                  DESCARGAR →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
