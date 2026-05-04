'use client'
import { useState } from 'react'

export function DashboardLink({ empresa }: { empresa: any }) {
  const [copied, setCopied] = useState(false)
  const url = `${empresa?.slug ?? 'miempresa'}.prode.ar`

  const copy = () => {
    navigator.clipboard?.writeText('https://' + url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-2xl p-6 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002B72, #003FA3)' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      <div className="relative z-10">
        <div className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3">Tu link del prode</div>
        <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4">
          <span className="flex-1 font-bold text-sm text-white truncate">{url}</span>
          <button onClick={copy} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${copied ? 'bg-green-500 text-white' : 'bg-[#F5C518] text-[#002B72]'}`}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['💬 WhatsApp', '📧 Email', '📲 QR'].map(s => (
            <button key={s} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-bold text-white hover:bg-white/20 transition-all">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
