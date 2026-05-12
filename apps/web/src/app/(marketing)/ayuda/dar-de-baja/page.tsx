'use client'

import React from 'react'
import { Card } from '@/components/ui/Card'
import { ArrowLeft, Trash2, ShieldCheck, Facebook, Mail, Info, FileText } from 'lucide-react'
import Link from 'next/link'

/**
 * Meta (Facebook/Instagram) Compliance Page
 * This page provides data deletion instructions as required by Meta Platform Policies.
 */
export default function DarDeBajaPage() {
  return (
    <div className="min-h-screen bg-[#F1F3F9] pb-20">
      {/* Header Estilo Prode */}
      <header className="bg-[#002B72] pt-12 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="max-w-2xl mx-auto relative text-center sm:text-left">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Volver al inicio</span>
          </Link>
          <h1 className="font-bebas text-5xl sm:text-6xl text-white tracking-widest leading-none mb-2">
            ELIMINACIÓN DE DATOS
          </h1>
          <p className="text-[#74ACDF] font-bold text-sm uppercase tracking-wider">
            Data Deletion Instructions & Privacy
          </p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 -mt-10 relative z-10">
        <Card className="p-8 shadow-2xl shadow-blue-900/10 border-none rounded-[32px] bg-white">
          <div className="space-y-8">

            {/* Sección: Información General */}
            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <h2 className="text-[#002B72] font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                <Info className="h-5 w-5" /> Información Importante
              </h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed">
                De acuerdo con las políticas de <strong>Meta</strong> y las normativas de privacidad vigentes,
                <strong> El Prode Argento</strong> proporciona este mecanismo para que los usuarios puedan solicitar la eliminación de sus datos personales de nuestras bases de datos de forma segura y permanente.
              </p>
            </section>

            {/* SECCIÓN ESPECÍFICA PARA META / FACEBOOK LOGIN */}
            <section>
              <h2 className="text-[#002B72] font-black text-sm uppercase tracking-widest flex items-center gap-2 mb-4">
                <Facebook className="h-5 w-5 text-[#1877F2]" /> Usuarios de Facebook / Instagram
              </h2>
              <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100">
                <p className="text-slate-700 text-sm font-bold mb-3 italic">Si utilizaste tu cuenta de Meta para registrarte, podés revocar el acceso siguiendo estos pasos oficiales:</p>
                <ol className="space-y-3">
                  {[
                    'Ingresá a la Configuración y privacidad de tu cuenta de Facebook.',
                    'Hacé clic en "Configuración" y luego buscá "Apps y sitios web".',
                    'Buscá la aplicación "El Prode Argento" en el listado.',
                    'Hacé clic en el botón "Eliminar" junto al nombre de la aplicación.',
                    'Confirmá la acción para revocar el acceso y solicitar la eliminación de los datos vinculados.'
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3 text-slate-500 text-sm font-medium">
                      <span className="font-black text-[#002B72]">{i + 1}.</span> {step}
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            {/* SECCIÓN: SOLICITUD DIRECTA */}
            <section>
              <h2 className="text-[#002B72] font-black text-sm uppercase tracking-widest mb-4">
                Instrucciones de eliminación directa
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#F5C518] rounded-xl flex items-center justify-center font-bebas text-xl text-[#002B72] flex-shrink-0 shadow-sm">
                    1
                  </div>
                  <div>
                    <p className="text-slate-700 font-bold text-sm">Vía Email (Proceso Manual)</p>
                    <p className="text-slate-500 text-xs font-medium mt-1">
                      Enviá un correo electrónico a <span className="text-[#002B72] font-black underline">elprodeargento@gmail.com</span> indicando tu deseo de eliminar tu cuenta y todos los datos asociados.
                      Procesaremos tu solicitud en un plazo máximo de 48 a 72 horas hábiles.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-[#F5C518] rounded-xl flex items-center justify-center font-bebas text-xl text-[#002B72] flex-shrink-0 shadow-sm">
                    2
                  </div>
                  <div>
                    <p className="text-slate-700 font-bold text-sm">Datos que serán eliminados definitivamente</p>
                    <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                      Al procesar la baja de tu cuenta, eliminaremos permanentemente de nuestros servidores:
                      Nombre completo, dirección de email, identificador único de plataforma (Meta ID),
                      historial completo de predicciones (pálpitos) y tu posición en cualquier ranking activo.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="h-px bg-slate-100" />

            {/* Acción de Email */}
            <div className="text-center">
              <button
                onClick={() => window.location.href = 'mailto:elprodeargento@gmail.com?subject=Solicitud de Eliminación de Datos - El Prode Argento'}
                className="w-full bg-[#002B72] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-[#003da8]"
              >
                <Mail className="h-5 w-5" />
                SOLICITAR ELIMINACIÓN DE DATOS POR EMAIL
              </button>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                Validado para auditorías de Meta Platform Inc.
              </p>
            </div>

            {/* Links legales */}
            <div className="flex justify-center gap-6 pt-4">
              <Link href="/privacidad" className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-[#002B72] flex items-center gap-1 transition-colors">
                <FileText className="h-3 w-3" /> Política de Privacidad
              </Link>
            </div>

          </div>
        </Card>

        <footer className="mt-12 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">
            El Prode Argento · Desarrollado para el Mundial 2026
          </p>
        </footer>
      </main>
    </div>
  )
}
