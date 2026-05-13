import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Conocé cómo elprode.ar recopila, usa y protege tu información personal.',
}

export default function PrivacidadPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#002B72] h-[52px] flex items-center justify-between px-5">
        <Link href="/" className="font-bebas text-white text-[18px] tracking-wide">
          elprode.ar
        </Link>
        <span className="text-white/50 text-xs">Política de Privacidad</span>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Title */}
        <div className="mb-10">
          <p className="text-sm text-slate-500 mb-1">Última actualización: 9 de mayo de 2025</p>
          <h1 className="text-3xl font-extrabold text-[#002B72] mb-3">Política de Privacidad</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Esta Política de Privacidad describe cómo <strong>elprode.ar</strong> ("nosotros", "nuestro" o "el Servicio"),
            operado por Agilesrivas Tech — CUIT / DNI de contacto: elprodeargento@gmail.com —, recopila, usa,
            almacena y comparte información cuando utilizás nuestra plataforma de prodes deportivos para el
            Mundial 2026. Al usar el Servicio, aceptás las prácticas descritas en este documento.
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Información que recopilamos</h2>

            <h3 className="font-semibold text-slate-800 mb-1 mt-4">1.1 Datos que vos nos proporcionás</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Empresas/Organizadores:</strong> nombre o razón social, dirección de correo electrónico, contraseña (almacenada con hash), logo, colores de marca y descripción de premios.</li>
              <li><strong>Participantes:</strong> nombre completo, dirección de correo electrónico y número de teléfono celular (con código de país).</li>
              <li><strong>Google OAuth:</strong> si iniciás sesión con Google, recibimos nombre, foto de perfil y dirección de correo electrónico según los permisos que otorgás.</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mb-1 mt-4">1.2 Datos generados por el uso del Servicio</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Pronósticos ingresados, puntuación obtenida y posición en el ranking.</li>
              <li>Dirección IP, tipo de dispositivo, sistema operativo y navegador (datos de acceso).</li>
              <li>Ubicación geográfica aproximada (solo si la empresa organizadora activó la función de promociones geolocalizadas y el participante otorgó permiso de geolocalización en su dispositivo).</li>
              <li>Registros de actividad (logs) internos del sistema necesarios para la operación del servicio.</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mb-1 mt-4">1.3 Datos obtenidos de terceros (Meta / Instagram)</h3>
            <p>
              Cuando una empresa organizadora conecta su cuenta de Instagram para publicar el podio de su prode,
              solicitamos los siguientes permisos a través de Meta:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong>instagram_basic</strong> — identificador de usuario de Instagram, nombre de usuario y foto de perfil, para confirmar la identidad de la cuenta conectada.</li>
              <li><strong>instagram_content_publish</strong> — publicación de imágenes generadas por nuestra plataforma (imagen del podio con los tres primeros lugares del ranking) en nombre de la cuenta de Instagram del organizador.</li>
              <li><strong>pages_read_engagement</strong> — lectura de información básica de la Página de Facebook asociada, requerida por Meta para el flujo de autorización de Instagram.</li>
            </ul>
            <p className="mt-2">
              Solo accedemos a la información mínima necesaria para publicar el contenido solicitado.
              No almacenamos contenido del feed de Instagram ni datos de terceros seguidores.
              Los tokens de acceso de Instagram se almacenan de forma cifrada y se eliminan cuando el
              organizador desvincula su cuenta.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Cómo usamos tu información</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Crear y gestionar tu cuenta en el Servicio.</li>
              <li>Calcular puntuaciones, generar rankings y mostrar resultados de partidos.</li>
              <li>Enviar notificaciones push (recordatorios de fechas, resultados) únicamente a participantes que habilitaron las notificaciones en su navegador.</li>
              <li>Publicar imágenes del podio en Instagram cuando el organizador lo solicita explícitamente desde el panel de administración.</li>
              <li>Procesar pagos de planes Premium/Pro a través de MercadoPago.</li>
              <li>Mostrar promociones geolocalizadas de empresas Plan Pro a participantes dentro del radio configurado, solo si el participante otorgó permiso de geolocalización.</li>
              <li>Mejorar y mantener el Servicio, diagnosticar errores técnicos y garantizar la seguridad.</li>
              <li>Cumplir con obligaciones legales aplicables en la República Argentina.</li>
            </ul>
            <p className="mt-3">
              <strong>No vendemos, alquilamos ni comercializamos tus datos personales a terceros.</strong>
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Notificaciones Push</h2>
            <h3 className="font-semibold text-slate-800 mb-1">3.1 Consentimiento (opt-in)</h3>
            <p>
              Los participantes pueden habilitar las notificaciones push desde el navegador al acceder al prode.
              Este acto constituye el consentimiento explícito para recibir notificaciones push relacionadas
              con el prode (exclusivamente recordatorios de fechas de partidos y notificaciones de resultados).
            </p>

            <h3 className="font-semibold text-slate-800 mb-1 mt-4">3.2 Tipos de notificaciones</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Recordatorio 24 horas antes del inicio de cada fecha del torneo.</li>
              <li>Notificación de resultado al finalizar cada partido de la fecha.</li>
              <li>Mensajes puntuales enviados por el organizador de su prode (solo si la empresa tiene Plan Pro).</li>
            </ul>

            <h3 className="font-semibold text-slate-800 mb-1 mt-4">3.3 Cómo cancelar (opt-out)</h3>
            <p>
              Podés desactivar las notificaciones push en cualquier momento de dos formas:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Desde la configuración de notificaciones de tu navegador.</li>
              <li>Enviando un correo a <strong>elprodeargento@gmail.com</strong> con el asunto "Baja notificaciones".</li>
            </ul>
            <p className="mt-2">
              Desactivar las notificaciones no afecta tu participación en el prode.
            </p>

            <h3 className="font-semibold text-slate-800 mb-1 mt-4">3.4 Proveedor</h3>
            <p>
              Las notificaciones se envían mediante <strong>Firebase Cloud Messaging (FCM)</strong> de Google.
              Google actúa como procesador de datos. Su política de privacidad está disponible en
              policies.google.com/privacy.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Compartir información con terceros</h2>
            <p className="mb-3">
              Solo compartimos datos con los proveedores de servicios necesarios para operar la plataforma,
              todos bajo acuerdos de procesamiento de datos que los obligan a proteger tu información:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100">
                  <tr>
                    <th className="text-left px-3 py-2 font-semibold">Proveedor</th>
                    <th className="text-left px-3 py-2 font-semibold">Finalidad</th>
                    <th className="text-left px-3 py-2 font-semibold">Política de privacidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2 font-medium">Supabase</td>
                    <td className="px-3 py-2">Base de datos y autenticación</td>
                    <td className="px-3 py-2 text-slate-500">supabase.com/privacy</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Google (Firebase)</td>
                    <td className="px-3 py-2">Envío de notificaciones push (FCM)</td>
                    <td className="px-3 py-2 text-slate-500">policies.google.com/privacy</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Meta (Instagram)</td>
                    <td className="px-3 py-2">Publicación de podio en Instagram</td>
                    <td className="px-3 py-2 text-slate-500">facebook.com/policy</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Google</td>
                    <td className="px-3 py-2">Inicio de sesión con Google (OAuth)</td>
                    <td className="px-3 py-2 text-slate-500">policies.google.com/privacy</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">MercadoPago</td>
                    <td className="px-3 py-2">Procesamiento de pagos</td>
                    <td className="px-3 py-2 text-slate-500">mercadopago.com.ar/privacidad</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Cloudflare R2</td>
                    <td className="px-3 py-2">Almacenamiento de logos e imágenes</td>
                    <td className="px-3 py-2 text-slate-500">cloudflare.com/privacypolicy</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Vercel</td>
                    <td className="px-3 py-2">Hosting de la aplicación web</td>
                    <td className="px-3 py-2 text-slate-500">vercel.com/legal/privacy-policy</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium">Render</td>
                    <td className="px-3 py-2">Hosting del servidor de API</td>
                    <td className="px-3 py-2 text-slate-500">render.com/privacy</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              También podemos divulgar información cuando sea requerido por ley, orden judicial o autoridad
              competente en la República Argentina.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Retención de datos</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Los datos de cuenta de una empresa se conservan mientras la cuenta esté activa y hasta 90 días después de su eliminación.</li>
              <li>Los pronósticos y rankings se conservan por la duración del torneo más 12 meses, con fines estadísticos.</li>
              <li>Los números de celular y correos de participantes se eliminan 90 días después de finalizado el torneo del organizador, salvo que el participante los comparta con otro prode activo.</li>
              <li>Los tokens de acceso de Instagram se eliminan inmediatamente cuando el organizador desvincula la cuenta o cierra su cuenta en elprode.ar.</li>
              <li>Los registros técnicos (logs) se conservan por un máximo de 30 días.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Seguridad</h2>
            <p>
              Implementamos medidas técnicas y organizativas razonables para proteger tu información,
              incluyendo cifrado TLS en todas las comunicaciones, almacenamiento de contraseñas con
              hashing bcrypt, tokens de sesión con tiempo de expiración y control de acceso por roles.
              Sin embargo, ningún sistema de seguridad es infalible; si sospechás un incidente de seguridad,
              contactanos de inmediato.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Tus derechos (Ley 25.326)</h2>
            <p className="mb-2">
              Conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina,
              tenés derecho a:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Acceso:</strong> saber qué datos tenemos sobre vos.</li>
              <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos.</li>
              <li><strong>Supresión:</strong> solicitar la eliminación de tus datos ("derecho al olvido").</li>
              <li><strong>Oposición:</strong> oponerte al tratamiento para fines de marketing.</li>
              <li><strong>Portabilidad:</strong> recibir tus datos en formato legible por máquina.</li>
            </ul>
            <p className="mt-2">
              Para ejercer cualquiera de estos derechos, escribinos a{' '}
              <a href="mailto:elprodeargento@gmail.com" className="text-[#002B72] underline font-medium">
                elprodeargento@gmail.com
              </a>{' '}
              con el asunto "Datos Personales". Responderemos dentro de los 30 días corridos.
              El titular de los datos podrá también radicar su reclamo ante la{' '}
              <strong>Agencia de Acceso a la Información Pública (AAIP)</strong>.
            </p>
          </section>

          {/* 8 — DATA DELETION — requerido por Meta */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <h2 className="text-lg font-bold text-slate-900 mb-3">8. Eliminación de datos (Data Deletion)</h2>
            <p className="mb-3">
              Podés solicitar la eliminación de todos tus datos personales de nuestra plataforma en
              cualquier momento. Tenés dos formas de hacerlo:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Por correo electrónico:</strong> enviá un email a{' '}
                <a href="mailto:elprodeargento@gmail.com" className="text-[#002B72] underline font-medium">
                  elprodeargento@gmail.com
                </a>{' '}
                con el asunto <strong>"Solicitud de eliminación de datos"</strong> indicando el correo
                electrónico o número de teléfono asociado a tu cuenta. Procesaremos tu solicitud en
                un plazo máximo de 30 días corridos y te confirmaremos por email cuando la eliminación
                esté completa.
              </li>
              <li>
                <strong>Desde tu cuenta (empresas):</strong> accedé a <em>Mi cuenta → Configuración →
                  Eliminar cuenta</em>. Esto elimina todos tus datos de forma permanente e irreversible,
                incluyendo el prode, participantes y tokens de redes sociales vinculadas.
              </li>
              <li>
                <strong>Revocación del acceso a Instagram:</strong> si conectaste tu cuenta de Instagram
                y querés revocar el acceso sin eliminar tu cuenta, podés hacerlo desde{' '}
                <em>Facebook / Instagram → Configuración → Aplicaciones y sitios web → elprode.ar →
                  Eliminar</em>. Esto revocará todos los permisos y eliminaremos el token de acceso
                dentro de las 24 horas.
              </li>
            </ol>
            <p className="mt-3 text-xs text-slate-500">
              Esta sección cumple con los requisitos de eliminación de datos de la plataforma Meta
              (Meta Platform Policy, sección 3.7) y la Ley 25.326 de Argentina.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">9. Cookies y tecnologías similares</h2>
            <p>
              Utilizamos cookies de sesión estrictamente necesarias para mantener tu sesión iniciada.
              No usamos cookies de seguimiento, publicidad ni analítica de terceros. Podés configurar
              tu navegador para bloquear o eliminar cookies, aunque esto puede afectar el funcionamiento
              del Servicio.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">10. Menores de edad</h2>
            <p>
              El Servicio no está dirigido a menores de 13 años. No recopilamos conscientemente
              información personal de niños. Si sos padre o tutor y creés que tu hijo nos proporcionó
              datos, contactanos y los eliminaremos de inmediato.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">11. Cambios a esta Política</h2>
            <p>
              Podemos actualizar esta Política de Privacidad periódicamente. Cuando lo hagamos,
              actualizaremos la fecha en la parte superior de esta página. Si los cambios son
              materiales, te lo notificaremos por correo electrónico o mediante un aviso destacado
              en el Servicio con al menos 15 días de anticipación.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">12. Contacto</h2>
            <p>
              Si tenés preguntas, consultas o querés ejercer tus derechos sobre tus datos personales,
              contactanos:
            </p>
            <div className="mt-3 bg-white border border-slate-200 rounded-xl p-4 space-y-1">
              <p><strong>elprode.ar</strong></p>
              <p>República Argentina</p>
              <p>
                Email:{' '}
                <a href="mailto:elprodeargento@gmail.com" className="text-[#002B72] underline">
                  elprodeargento@gmail.com
                </a>
              </p>
              <p>Sitio web: elprode.ar</p>
            </div>
          </section>
        </div>

        {/* Footer links */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs text-slate-400">
          <span>© 2025 elprode.ar — Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <Link href="/terminos" className="hover:text-[#002B72] transition-colors">Términos y Condiciones</Link>
            <Link href="/" className="hover:text-[#002B72] transition-colors">Inicio</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
