'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { 
  ArrowLeft, 
  HelpCircle, 
  Trophy, 
  Store, 
  CreditCard, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  Target
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const FAQ_PLAYER = [
  {
    q: '¿Cómo sumo puntos?',
    a: 'Sumás 6 puntos por acertar el resultado exacto. Si solo acertás el ganador o empate pero no los goles, sumás 3 puntos.'
  },
  {
    q: '¿Hasta cuándo puedo cargar mi pálpito?',
    a: 'Podés cargar o modificar tu pronóstico hasta 5 minutos antes de que empiece cada partido.'
  },
  {
    q: '¿Qué pasa si un partido va a tiempo suplementario?',
    a: 'Se toma el resultado de los 90 minutos reglamentarios (más adición), no se cuenta el suplementario ni los penales.'
  }
]

const FAQ_BUSINESS = [
  {
    q: '¿Cómo creo mi propio prode?',
    a: 'Registrate como Empresa, configurá tu logo y colores, y ya tenés un link único para compartir con tus clientes.'
  },
  {
    q: '¿Es gratis para los comercios?',
    a: 'Tenemos un Plan Free para hasta 20 personas. Para más participantes y funciones de marketing, podés contratar los planes Pro o Premium.'
  },
  {
    q: '¿Cómo entrego los premios?',
    a: 'Cada comercio es responsable de entregar los premios que prometió. Nosotros facilitamos el ranking para que sepas quién ganó.'
  }
]

export default function AyudaPage() {
  const router = useRouter()
  const [backInfo, setBackInfo] = React.useState({ url: '/', label: 'Volver al inicio' })

  React.useEffect(() => {
    // Verificamos si venimos del panel de empresa
    if (typeof document !== 'undefined' && document.referrer.includes('/empresa/')) {
      setBackInfo({ url: '/empresa/dashboard', label: 'Volver al panel' })
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#F1F3F9] pb-20">
      {/* Header Estilo Prode */}
      <header className="bg-[#002B72] pt-12 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="max-w-4xl mx-auto relative text-center">
          <button 
            onClick={() => {
              if (backInfo.url === '/') router.push('/')
              else router.back()
            }}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">{backInfo.label}</span>
          </button>
          <h1 className="font-bebas text-6xl sm:text-7xl text-white tracking-widest leading-none mb-2">
            CENTRO DE AYUDA
          </h1>
          <p className="text-[#74ACDF] font-bold text-sm uppercase tracking-wider">
            Todo lo que necesitas saber para jugar y ganar
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 -mt-12 relative z-10 space-y-6">
        
        {/* Grilla de categorías */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* SECCIÓN JUGADORES */}
          <Card className="p-8 shadow-xl border-none rounded-[32px] bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🏆</div>
              <div>
                <h2 className="text-[#002B72] font-black text-lg leading-none">Para Jugadores</h2>
                <p className="text-[#8E96AE] text-[11px] font-bold uppercase tracking-wider mt-1">Reglas y Puntos</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {FAQ_PLAYER.map((item, i) => (
                <div key={i} className="group">
                  <h3 className="text-slate-800 font-bold text-[14px] flex items-start gap-2 mb-2 group-hover:text-[#002B72] transition-colors">
                    <Target className="h-4 w-4 mt-0.5 shrink-0 text-blue-400" /> {item.q}
                  </h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* SECCIÓN EMPRESAS */}
          <Card className="p-8 shadow-xl border-none rounded-[32px] bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl shadow-sm">🏪</div>
              <div>
                <h2 className="text-[#002B72] font-black text-lg leading-none">Para Comercios</h2>
                <p className="text-[#8E96AE] text-[11px] font-bold uppercase tracking-wider mt-1">Gestión y Marketing</p>
              </div>
            </div>
            
            <div className="space-y-6">
              {FAQ_BUSINESS.map((item, i) => (
                <div key={i} className="group">
                  <h3 className="text-slate-800 font-bold text-[14px] flex items-start gap-2 mb-2 group-hover:text-[#002B72] transition-colors">
                    <Store className="h-4 w-4 mt-0.5 shrink-0 text-amber-400" /> {item.q}
                  </h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed pl-6">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </Card>

        </div>

        {/* SECCIÓN REFERIDOS */}
        <Card className="p-8 shadow-xl border-none rounded-[32px] bg-gradient-to-br from-white to-amber-50">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#002B72] rounded-2xl flex items-center justify-center text-2xl shadow-lg">🤝</div>
                <div>
                  <h2 className="text-[#002B72] font-black text-lg leading-none">Programa de Referidos</h2>
                  <p className="text-amber-600 text-[11px] font-black uppercase tracking-wider mt-1">Ganá dinero invitando comercios</p>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Nuestro programa de referidos permite que cualquier persona gane recompensas reales por ayudar a expandir la red de El Prode Argento. 
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/60 rounded-2xl p-4 border border-amber-200">
                  <h4 className="text-[13px] font-black text-[#002B72] mb-2">💰 Ganancias Reales</h4>
                  <p className="text-[12px] text-slate-500 font-medium">Por cada 3 comercios que se registren y paguen un plan usando tu código, recibís <strong>$12.000</strong> en tu cuenta.</p>
                </div>
                <div className="bg-white/60 rounded-2xl p-4 border border-amber-200">
                  <h4 className="text-[13px] font-black text-[#002B72] mb-2">💳 Cobros Simples</h4>
                  <p className="text-[12px] text-slate-500 font-medium">Podés solicitar tu cobro desde la pestaña de Referidos dentro de la app cargando tu Alias o CBU.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#002B72] rounded-2xl p-6 text-white w-full md:w-[260px] shrink-0 shadow-xl">
              <h4 className="text-[11px] font-black text-[#74ACDF] uppercase tracking-widest mb-4">¿Cómo participar?</h4>
              <ul className="space-y-4">
                {[
                  'Entrá a tu Prode y buscá la pestaña "Referidos".',
                  'Aceptá los términos y generá tu link único.',
                  'Compartilo con dueños de comercios o amigos.'
                ].map((step, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <span className="w-5 h-5 rounded-full bg-amber-400 text-[#002B72] flex items-center justify-center text-[11px] font-black shrink-0">{i+1}</span>
                    <span className="text-[11px] font-bold leading-tight">{step}</span>
                  </li>
                ))}
              </ul>
              <Link href="/terminos-referidos" className="mt-6 block text-center text-[10px] font-black text-amber-400 underline underline-offset-4 uppercase tracking-widest hover:text-white transition-colors">
                Ver legales de referidos
              </Link>
            </div>
          </div>
        </Card>

        {/* SECCIÓN PAGOS Y SEGURIDAD */}
        <Card className="p-8 shadow-xl border-none rounded-[32px] bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-md">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="h-6 w-6 text-green-500" />
                <h2 className="text-[#002B72] font-black text-lg">Pagos y Seguridad</h2>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-4">
                Todas las suscripciones se procesan a través de <strong>Mercado Pago</strong>. No guardamos tus datos de tarjeta ni información sensible. Los pagos son únicos y válidos por todo el torneo.
              </p>
              <div className="flex items-center gap-4">
                <CreditCard className="h-5 w-5 text-slate-300" />
                <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Aceptamos todas las tarjetas</span>
              </div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col gap-4 border border-slate-100 min-w-[280px]">
              <h4 className="text-[11px] font-black text-[#8E96AE] uppercase tracking-widest">¿Necesitás algo más?</h4>
              <Link href="/ayuda/dar-de-baja" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-[#002B72] group transition-all">
                <span className="text-xs font-bold text-slate-600">Eliminación de datos</span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link href="/terminos" className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 hover:border-[#002B72] group transition-all">
                <span className="text-xs font-bold text-slate-600">Términos y condiciones</span>
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </Card>

        {/* FOOTER SOPORTE */}
        <div className="bg-[#002B72] rounded-[32px] p-10 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <HelpCircle size={120} />
          </div>
          <h2 className="font-bebas text-4xl tracking-widest mb-4">¿No encontrás lo que buscás?</h2>
          <p className="text-white/70 text-sm font-medium mb-8 max-w-md mx-auto">
            Nuestro equipo de soporte está listo para ayudarte con cualquier inconveniente técnico o duda comercial.
          </p>
          <button 
            onClick={() => window.location.href = 'mailto:elprodeargento@gmail.com'}
            className="bg-[#F5C518] text-[#002B72] px-8 py-4 rounded-2xl font-black text-sm hover:bg-white transition-all shadow-xl shadow-black/20 flex items-center gap-3 mx-auto"
          >
            <Mail className="h-5 w-5" /> CONTACTAR SOPORTE
          </button>
        </div>

      </main>

      <footer className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
          El Prode Argento · Desarrollado para el Mundial 2026
        </p>
      </footer>
    </div>
  )
}
