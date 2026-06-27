import type { Metadata } from 'next'
import { Card } from '@/components/ui/Card'
import { MessageCircle } from 'lucide-react'

export const metadata: Metadata = { title: 'Ayuda' }

export default function AyudaPage() {
  const faqs = [
    {
      q: '¿Cómo se calculan los puntos?',
      a: 'Resultado exacto = 3 puntos · Ganador correcto = 1 punto · Error o sin cargar = 0 puntos. En partidos de mata-mata definidos por penales, hay 2 puntos extra por acertar quién pasa. El ranking se actualiza automáticamente al terminar cada partido.'
    },
    {
      q: '¿Qué pasa si alguien no carga sus pronósticos?',
      a: 'Si no carga antes de los 5 minutos del partido, se omite esa fecha y no suma puntos. Podés enviarles un recordatorio desde la sección Notificaciones.'
    },
    {
      q: '¿Puedo cambiar los premios mientras corre el torneo?',
      a: 'Sí, podés editarlos en cualquier momento desde la sección Premios. Los cambios se ven reflejados de inmediato en el prode de los participantes.'
    }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="text-[26px] font-black text-[#0D1A3A] mb-1">
            Ayuda
          </h1>
          <p className="text-[14px] text-[#5A6480] font-medium">¿Tenés dudas? Acá encontrás las respuestas</p>
        </div>
      </div>

      <div className="card">
        <div className="p-[20px] flex flex-col gap-[14px]">
          <div className="flex flex-col gap-[14px]">
            {faqs.map((faq, i) => (
              <details key={i} className="group border-[1.5px] border-[#DDE1EF] rounded-[12px] overflow-hidden transition-all cursor-pointer">
                <summary className="flex items-center justify-between p-4 font-extrabold text-[#0D1A3A] list-none select-none">
                  <span className="text-[15px]">{faq.q}</span>
                  <span className="text-[#8E96AE] text-[20px] transition-transform group-open:rotate-180">⌄</span>
                </summary>
                <div className="px-4 pb-4 text-[14px] text-[#5A6480] leading-relaxed font-medium">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-6 p-6 bg-[#F1F3F9] rounded-xl text-center border-[1.5px] border-dashed border-[#C8CEDF]">
            <div className="text-[32px] mb-2">💬</div>
            <h4 className="text-[16px] font-black text-[#0D1A3A] mb-1">¿Necesitás más ayuda?</h4>
            <p className="text-[14px] text-[#8E96AE] font-medium mb-5">Nuestro equipo responde en menos de 24hs</p>
            <button className="bg-[#002B72] text-white text-[14px] font-black px-6 py-3 rounded-xl hover:bg-[#00318A] transition-all shadow-lg mx-auto">
              Contactar soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
