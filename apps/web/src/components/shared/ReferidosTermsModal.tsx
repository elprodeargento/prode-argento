'use client'
import { useState } from 'react'

interface Props {
  open: boolean
  onAccept: () => void
  onClose: () => void
}

export function ReferidosTermsModal({ open, onAccept, onClose }: Props) {
  const [checked, setChecked] = useState(false)
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.6)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>

        {/* Handle mobile */}
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto sm:hidden -mt-2" />

        <div className="text-center">
          <div className="text-2xl mb-2">🤝</div>
          <h3 className="font-black text-[#0D1A3A] text-[16px]">
            Programa de Referidos
          </h3>
          <p className="text-[13px] text-slate-500 font-medium mt-1">
            Antes de empezar, necesitamos que aceptes los términos del programa.
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer p-3
          rounded-xl border-2 border-slate-200 hover:border-[#002B72]
          transition-all"
          onClick={() => setChecked(c => !c)}>
          <div className={`w-5 h-5 rounded flex items-center justify-center
            shrink-0 mt-0.5 border-2 transition-all ${
            checked
              ? 'bg-[#002B72] border-[#002B72]'
              : 'border-slate-300'
          }`}>
            {checked && <span className="text-white text-[11px] font-black">✓</span>}
          </div>
          <span className="text-[13px] text-slate-700 font-medium leading-snug">
            Acepto los{' '}
            <a
              href="/terminos-referidos"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#002B72] font-black underline underline-offset-2"
              onClick={e => e.stopPropagation()}>
              términos y condiciones
            </a>
            {' '}del programa de referidos de elprode.ar
          </span>
        </label>

        <button
          disabled={!checked}
          onClick={() => {
            localStorage.setItem('referidos-terms-accepted', 'true')
            onAccept()
          }}
          className="w-full py-3 rounded-xl font-black text-[14px] text-white
            bg-[#002B72] hover:bg-[#00318A] transition-all disabled:opacity-30">
          Continuar
        </button>

        <button
          onClick={onClose}
          className="text-[13px] text-slate-400 font-medium text-center">
          Cancelar
        </button>
      </div>
    </div>
  )
}
