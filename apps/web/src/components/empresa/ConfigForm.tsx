'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`toggle ${checked ? 'on' : ''}`}
    />
  )
}

function IgIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  )
}

const configSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2, 'El slug es obligatorio'),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Debe ser un color hex válido'),
  welcome_msg: z.string().optional(),
  registration_deadline: z.string().optional(),
  close_minutes: z.number().min(0).max(60),
  ig_hashtags: z.string().optional(),
  auto_post_ig: z.boolean().default(false),
  notify_reminders: z.boolean().default(true),
  notify_results: z.boolean().default(true),
  notify_ranking: z.boolean().default(false),
  notify_whatsapp: z.boolean().default(false),
})

type ConfigFormValues = z.infer<typeof configSchema>

export function ConfigForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [igConnected, setIgConnected] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ConfigFormValues>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      primary_color: '#002B72',
      close_minutes: 5,
      auto_post_ig: false,
      notify_reminders: true,
      notify_results: true,
    },
  })

  const primaryColor = watch('primary_color')
  const showSaveBar = isDirty || saving || success

  useEffect(() => {
    async function fetchConfig() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
        const res = await fetch(`${apiUrl}/businesses/me`)
        if (res.ok) {
          const data = await res.json()
          reset({
            name: data.name || '',
            slug: data.slug || '',
            primary_color: data.primary_color || '#002B72',
            welcome_msg: data.welcome_msg || '',
            registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString().slice(0, 10) : '',
            close_minutes: data.close_minutes || 5,
            ig_hashtags: data.ig_hashtags || '#ProdeMundial2026 #Mundial2026',
            auto_post_ig: data.auto_post_ig || false,
            notify_reminders: data.notify_reminders ?? true,
            notify_results: data.notify_results ?? true,
            notify_ranking: data.notify_ranking ?? false,
            notify_whatsapp: data.notify_whatsapp ?? false,
          })
          setLogoUrl(data.logo_url)
        }
      } catch (err) {
        console.error('Failed to fetch config:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchConfig()
  }, [reset])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      const url = await uploadToR2(file)
      setLogoUrl(url)
    } catch (err) {
      console.error(err)
      alert('Error subiendo imagen')
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: ConfigFormValues) => {
    try {
      setSaving(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
      const res = await fetch(`${apiUrl}/businesses/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, logo_url: logoUrl }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="config-form pb-24">
      {/* IDENTIDAD VISUAL */}
      <div className="config-section">
        <div className="config-section-head">
          <span className="config-section-icon">🎨</span>
          <div>
            <div className="config-section-title">Identidad visual</div>
            <div className="config-section-sub">Logo y colores de tu empresa</div>
          </div>
        </div>
        <div className="config-section-body">
          <div className="field">
            <div className="field-label">Logo de la empresa</div>
            <div className="logo-preview-row">
              <div className="h-16 w-16 rounded-xl border-2 border-[#DDE1EF] bg-[#F1F3F9] flex items-center justify-center overflow-hidden relative">
                {logoUrl && typeof logoUrl === 'string' && logoUrl.length > 0 ? (
                  <Image src={logoUrl} alt="Logo" fill className="object-contain p-1" />
                ) : (
                  <span className="text-3xl">⚽</span>
                )}
              </div>
              <div className="flex-1">
                <div className="logo-upload">
                  <input type="file" onChange={handleLogoUpload} disabled={uploading} />
                  <div className="logo-upload-icon">📁</div>
                  <div className="logo-upload-text">Subir nuevo logo</div>
                  <div className="logo-upload-hint">PNG, SVG, JPG · máx 2MB</div>
                </div>
              </div>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <div className="field-label">Nombre de la empresa</div>
              <input 
                {...register('name')}
                className="field-input"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div className="field">
              <div className="field-label">Slug / URL</div>
              <input 
                {...register('slug')}
                className="field-input"
              />
              <div className="field-hint mt-1">{watch('slug') || 'empresa'}.prode.ar</div>
              {errors.slug && <p className="text-xs text-red-500 mt-1">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="field">
            <div className="field-label">Color principal</div>
            <div className="color-palette">
              {['#002B72', '#5BA3D9', '#F5C518', '#C8102E', '#18A06A', '#111111'].map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('primary_color', color)}
                  className={`color-swatch ${primaryColor === color ? 'sel' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <input type="color" {...register('primary_color')} />
            </div>
          </div>

          <div className="field">
            <div className="field-label">Mensaje de bienvenida</div>
            <input 
              {...register('welcome_msg')}
              placeholder="¡Bienvenidos al prode!"
              className="field-input"
            />
          </div>
        </div>
      </div>

      {/* REGLAS DEL PRODE */}
      <div className="config-section">
        <div className="config-section-head">
          <span className="config-section-icon">📋</span>
          <div>
            <div className="config-section-title">Reglas del prode</div>
            <div className="config-section-sub">Fechas y condiciones de juego</div>
          </div>
        </div>
        <div className="config-section-body">
          <div className="field-row">
            <div className="field">
              <div className="field-label">Fecha límite de inscripción</div>
              <input 
                type="date"
                {...register('registration_deadline')}
                className="field-input"
              />
            </div>
            <div className="field">
              <div className="field-label">Minutos de cierre antes del partido</div>
              <input 
                type="number"
                {...register('close_minutes')}
                className="field-input"
              />
              <div className="field-hint mt-1">Los pronósticos se bloquean {watch('close_minutes')} min antes</div>
            </div>
          </div>

          <div className="field">
             <div className="field-label">Sistema de puntos</div>
             <div className="flex flex-col gap-[10px] mt-1">
               {[
                 { icon: '🎯', title: 'Resultado exacto', desc: 'Adivinás el marcador exacto', pts: 3, bg: 'bg-[#E8F8F1]', border: 'border-[#18A06A]/20', text: 'text-[#18A06A]' },
                 { icon: '👍', title: 'Ganador correcto', desc: 'Adivinás quién gana o si es empate', pts: 1, bg: 'bg-[#FEF3E8]', border: 'border-[#F07B1D]/20', text: 'text-[#F07B1D]' },
                 { icon: '❌', title: 'Error o sin cargar', desc: 'No se suma nada', pts: 0, bg: 'bg-[#F1F3F9]', border: 'border-[#DDE1EF]', text: 'text-[#8E96AE]' },
               ].map((rule, i) => (
                 <div key={i} className={`flex items-center gap-3 p-[12px] border-[1.5px] rounded-xl ${rule.bg} ${rule.border}`}>
                   <span className="text-[20px]">{rule.icon}</span>
                   <div className="flex-1">
                     <div className="text-[14px] font-bold text-[#0D1A3A]">{rule.title}</div>
                     <div className="text-[12px] text-[#8E96AE] font-medium">{rule.desc}</div>
                   </div>
                   <div className={`font-bebas text-[28px] ${rule.text}`}>{rule.pts} pts</div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* INSTAGRAM */}
      <div className="config-section">
        <div className="config-section-head">
          <span className="config-section-icon">📸</span>
          <div>
            <div className="config-section-title">Instagram</div>
            <div className="config-section-sub">Conectá tu cuenta para publicar el podio directo</div>
          </div>
        </div>
        <div className="config-section-body">
           {!igConnected ? (
             <div className="text-center py-[20px]">
                <div className="text-[40px] mb-3">📸</div>
                <div className="text-[15px] font-extrabold text-[#0D1A3A] mb-1.5">Conectá tu Instagram</div>
                <div className="text-[13px] text-[#5A6480] font-medium max-w-[300px] mx-auto mb-5 leading-relaxed">Publicá el podio de tu prode directamente en tu cuenta con un solo toque</div>
                <button 
                  type="button" 
                  onClick={() => setIgConnected(true)} 
                  className="inline-flex items-center gap-2 px-[24px] py-[12px] rounded-full border-none bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#cc2366] text-white text-[14px] font-extrabold shadow-[0_4px_16px_rgba(220,39,67,0.3)] hover:opacity-90 transition-all"
                >
                  <span>📸</span> Conectar con Instagram
                </button>
             </div>
           ) : (
             <div className="space-y-4">
                <div className="flex items-center gap-3 p-[14px] bg-gradient-to-br from-[#f09433]/5 via-[#dc2743]/5 to-[#cc2366]/5 border border-[#dc2747]/15 rounded-xl">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#cc2366] flex items-center justify-center text-white text-xl flex-shrink-0">
                    📸
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-extrabold text-[#0D1A3A] truncate">@distribuidoragarcia</div>
                    <div className="text-[12px] font-extrabold text-[#18A06A]">✓ Cuenta conectada</div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIgConnected(false)} 
                    className="text-[12px] font-bold text-[#D93025] bg-[#FDECEB] px-3 py-1.5 rounded-lg hover:bg-red-100"
                  >
                    Desconectar
                  </button>
                </div>
                <div className="field">
                  <div className="field-label">Hashtags por defecto</div>
                  <input 
                    {...register('ig_hashtags')}
                    className="field-input"
                  />
                  <div className="field-hint mt-1">Se agregan automáticamente a cada publicación</div>
                </div>
                <div className="toggle-row">
                  <div>
                    <div className="toggle-label">Publicar automáticamente al terminar cada fecha</div>
                    <div className="toggle-desc">El podio parcial se postea solo cuando terminan los partidos</div>
                  </div>
                  <Toggle checked={!!watch('auto_post_ig')} onChange={() => setValue('auto_post_ig', !watch('auto_post_ig'))} />
                </div>
             </div>
           )}
        </div>
      </div>

      {/* NOTIFICACIONES */}
      <div className="config-section">
        <div className="config-section-head">
          <span className="config-section-icon">🔔</span>
          <div>
            <div className="config-section-title">Notificaciones automáticas</div>
            <div className="config-section-sub">Configurá cuándo le avisamos a tus participantes</div>
          </div>
        </div>
        <div className="config-section-body">
           {([
             { id: 'notify_reminders', title: 'Recordatorio antes de cada partido', desc: 'Se envía 24hs antes del inicio de cada fecha' },
             { id: 'notify_results', title: 'Resultado de cada fecha', desc: 'Notificamos cómo les fue al terminar los partidos' },
             { id: 'notify_ranking', title: 'Actualización del ranking', desc: 'Les avisamos cuando cambia su posición' },
             { id: 'notify_whatsapp', title: 'WhatsApp', desc: 'Enviar avisos por WhatsApp (requiere integración)' },
           ] as const).map((row, i, arr) => (
             <div key={i}>
               <div className="toggle-row py-2">
                 <div>
                   <div className="toggle-label">{row.title}</div>
                   <p className="toggle-desc">{row.desc}</p>
                 </div>
                 <Toggle
                   checked={!!watch(row.id)}
                   onChange={() => setValue(row.id, !watch(row.id))}
                 />
               </div>
               {i < arr.length - 1 && (
                 <div className="h-[1px] bg-[#DDE1EF] my-1" />
               )}
             </div>
           ))}
        </div>
      </div>

      {/* SAVE BAR */}
      <div className={`fixed bottom-6 left-[20px] lg:left-[280px] right-[20px] bg-[#002B72] text-white rounded-2xl p-[16px_22px] flex items-center justify-between shadow-[0_8px_48px_rgba(0,43,114,0.16)] z-[150] transition-all duration-300 transform ${showSaveBar ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="text-[14px] font-bold">
          {success ? '✅ Cambios guardados correctamente' : '💡 Tenés cambios sin guardar'}
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => reset()}
            className="px-5 py-2.5 bg-white/15 hover:bg-white/25 rounded-xl text-[14px] font-extrabold transition-all"
          >
            Descartar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-5 py-2.5 bg-[#F5C518] text-[#002B72] hover:bg-[#FFD740] rounded-xl text-[14px] font-black transition-all disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </form>
  )
}
