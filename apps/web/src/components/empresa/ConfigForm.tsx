'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Loader2, AlertTriangle } from 'lucide-react'
import { uploadToR2 } from '@/lib/storage/r2'
import { createClient } from '@/utils/supabase/client'

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

const configSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  slug: z.string().min(2, 'El slug es obligatorio'),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Debe ser un color hex válido'),
  welcome_msg: z.string().optional(),
  registration_deadline: z.string().optional(),
  close_minutes: z.coerce.number().min(0).max(60),
  match_visibility: z.enum(['all', 'daily']).default('all'),
  ig_hashtags: z.preprocess(
    (v) => Array.isArray(v) ? (v as string[]).join(' ') : v,
    z.string().optional()
  ),
  auto_post_ig: z.boolean().default(false),
  notify_reminders: z.boolean().default(true),
  notify_results: z.boolean().default(true),
  notify_ranking: z.boolean().default(false),
  notify_whatsapp: z.boolean().default(false),
})

type ConfigFormValues = z.infer<typeof configSchema>

export function ConfigForm() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingBg, setUploadingBg] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [backgroundUrl, setBackgroundUrl] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [igConnected, setIgConnected] = useState(false)
  const [businessId, setBusinessId] = useState<string | undefined>()

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
  const showSaveBar = isDirty || saving || success || !!saveError

  useEffect(() => {
    async function fetchConfig() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
        const { data: { session } } = await supabase.auth.getSession()
        const res = await fetch(`${apiUrl}/businesses/me`, {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        })
        if (res.ok) {
          const data = await res.json()
          const str = (v: unknown, fallback = '') =>
            Array.isArray(v) ? v.join(' ') : (v as string) || fallback
          reset({
            name: str(data.name),
            slug: str(data.slug),
            primary_color: str(data.primary_color, '#002B72'),
            welcome_msg: str(data.welcome_msg),
            registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString().slice(0, 10) : '',
            close_minutes: data.close_minutes || 5,
            match_visibility: data.match_visibility ?? 'all',
            ig_hashtags: str(data.ig_hashtags, '#ProdeMundial2026 #Mundial2026'),
            auto_post_ig: data.auto_post_ig || false,
            notify_reminders: data.notify_reminders ?? true,
            notify_results: data.notify_results ?? true,
            notify_ranking: data.notify_ranking ?? false,
            notify_whatsapp: data.notify_whatsapp ?? false,
          })
          setLogoUrl(data.logo_url)
          setBackgroundUrl(data.background_url ?? null)
          setBusinessId(data.id)
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
      const url = await uploadToR2(file, businessId)
      setLogoUrl(url)
    } catch (err) {
      console.error(err)
      alert('Error subiendo imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingBg(true)
      const url = await uploadToR2(file, businessId)
      setBackgroundUrl(url)
    } catch (err) {
      console.error(err)
      alert('Error subiendo imagen de fondo')
    } finally {
      setUploadingBg(false)
    }
  }

  const onSubmit = async (data: ConfigFormValues) => {
    try {
      setSaving(true)
      setSaveError(null)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch(`${apiUrl}/businesses/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ...data, logo_url: logoUrl, background_url: backgroundUrl }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const body = await res.json().catch(() => ({}))
        setSaveError(body?.message ?? `Error ${res.status}`)
      }
    } catch (err) {
      setSaveError('No se pudo conectar con el servidor')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-slate-300" /></div>

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (validationErrors) => {
        const [[field, err]] = Object.entries(validationErrors)
        const msg = (err as { message?: string })?.message ?? 'Campo inválido'
        setSaveError(`${field}: ${msg}`)
      })}
      className="config-form pb-24"
    >
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

          <div className="field">
            <div className="field-label">Imagen de fondo</div>
            <div className="logo-preview-row">
              <div className="h-16 w-24 rounded-xl border-2 border-[#DDE1EF] bg-[#F1F3F9] flex items-center justify-center overflow-hidden relative">
                {backgroundUrl ? (
                  <Image src={backgroundUrl} alt="Fondo" fill className="object-cover" />
                ) : (
                  <span className="text-2xl">🖼️</span>
                )}
              </div>
              <div className="flex-1">
                <div className="logo-upload">
                  <input type="file" accept="image/*" onChange={handleBackgroundUpload} disabled={uploadingBg} />
                  <div className="logo-upload-icon">📁</div>
                  <div className="logo-upload-text">{uploadingBg ? 'Subiendo...' : 'Subir imagen de fondo'}</div>
                  <div className="logo-upload-hint">Se muestra detrás del hero de bienvenida · JPG, PNG · máx 5MB</div>
                </div>
                {backgroundUrl && (
                  <button type="button" onClick={() => setBackgroundUrl(null)}
                    className="mt-2 text-xs font-bold text-red-500 hover:text-red-700">
                    Quitar fondo
                  </button>
                )}
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

      {/* VISIBILIDAD DE PARTIDOS */}
      <div className="config-section">
        <div className="config-section-head">
          <span className="config-section-icon">📅</span>
          <div>
            <div className="config-section-title">Visibilidad de partidos</div>
            <div className="config-section-sub">¿Cuándo pueden pronosticar tus participantes?</div>
          </div>
        </div>
        <div className="config-section-body">
          <div className="flex flex-col gap-3">
            {([
              {
                value: 'all',
                icon: '🗓️',
                title: 'Todos los partidos a la vez',
                desc: 'Los participantes ven y pueden pronosticar todos los partidos del torneo desde el primer día.',
              },
              {
                value: 'daily',
                icon: '📆',
                title: 'Día a día',
                desc: 'Solo se muestran los partidos del día actual y los siguientes. Se van habilitando a medida que se acerca la fecha.',
              },
            ] as const).map(opt => {
              const selected = watch('match_visibility') === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue('match_visibility', opt.value, { shouldDirty: true })}
                  className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border-[1.5px] transition-all ${
                    selected
                      ? 'bg-[#EBF4FC] border-[#003FA3]'
                      : 'bg-white border-[#DDE1EF] hover:border-[#B0BAD4]'
                  }`}
                >
                  <span className="text-[24px] mt-0.5 shrink-0">{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`text-[14px] font-black mb-0.5 ${selected ? 'text-[#003FA3]' : 'text-[#0D1A3A]'}`}>
                      {opt.title}
                    </div>
                    <div className="text-[12px] font-medium text-[#5A6480] leading-snug">{opt.desc}</div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    selected ? 'border-[#003FA3] bg-[#003FA3]' : 'border-[#C8CEDF]'
                  }`}>
                    {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
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

      {/* ZONA DE PELIGRO */}
      <div className="config-section border-red-200">
        <div className="config-section-head">
          <span className="config-section-icon">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </span>
          <div>
            <div className="config-section-title text-red-600">Zona de peligro</div>
            <div className="config-section-sub">Acciones irreversibles sobre tu prode</div>
          </div>
        </div>
        <div className="config-section-body">
          <p className="text-[13px] text-[#5A6480] font-medium leading-relaxed mb-4">
            Eliminar el prode borra permanentemente todos los participantes, pronósticos y resultados. Esta acción no se puede deshacer.
          </p>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Estás seguro que querés eliminar este prode? Esta acción es irreversible.')) {
                alert('Prode eliminado (demo)')
              }
            }}
            className="px-5 py-2.5 text-[13px] font-black text-red-600 border-[1.5px] border-red-200 rounded-xl hover:bg-red-50 transition-all"
          >
            Eliminar este prode
          </button>
        </div>
      </div>

      {/* SAVE BAR */}
      <div className={`fixed bottom-6 left-[20px] lg:left-[280px] right-[20px] rounded-2xl p-[16px_22px] flex items-center justify-between shadow-[0_8px_48px_rgba(0,43,114,0.16)] z-[150] transition-all duration-300 transform ${showSaveBar || saveError ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'} ${saveError ? 'bg-red-600' : 'bg-[#002B72]'} text-white`}>
        <div className="text-[14px] font-bold">
          {success
            ? '✅ Cambios guardados correctamente'
            : saveError
            ? `❌ ${saveError}`
            : '💡 Tenés cambios sin guardar'}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => { reset(); setSaveError(null) }}
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
