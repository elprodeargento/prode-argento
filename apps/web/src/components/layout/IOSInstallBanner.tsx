'use client'

import { useEffect, useState } from 'react'
import { X, Share, PlusSquare } from 'lucide-react'

export function IOSInstallBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream

    // Detect if already in standalone mode (installed)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone

    // Check if user dismissed it recently
    const isDismissed = localStorage.getItem('ios-pwa-dismissed')

    if (isIOS && !isStandalone && !isDismissed) {
      setShow(true)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('ios-pwa-dismissed', 'true')
  }

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 flex items-center gap-4 relative overflow-hidden">
        {/* Progress-like accent */}
        <div className="absolute top-0 left-0 w-1 h-full bg-[#002B72]" />

        <div className="flex-shrink-0 w-12 h-12 bg-black rounded-xl flex items-center justify-center overflow-hidden border border-slate-100">
          <img src="/EL PRODE ARGENTO-03.png" alt="Prode Logo" className="w-full h-full object-contain " />
        </div>

        <div className="flex-1 pr-6">
          <h3 className="text-sm font-bold text-slate-900 leading-tight">Instalá el Prode en tu iPhone</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
            Para recibir alertas, toca <Share className="inline w-3 h-3 mb-0.5" /> y luego <PlusSquare className="inline w-3 h-3 mb-0.5" /> "Añadir a pantalla de inicio".
          </p>
        </div>

        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
