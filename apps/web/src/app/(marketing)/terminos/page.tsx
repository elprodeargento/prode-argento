import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Términos y condiciones de uso de elprode.ar — plataforma de prodes del Mundial 2026.',
}

export default function TerminosPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-[#002B72] h-[52px] flex items-center justify-between px-5">
        <Link href="/" className="font-bebas text-white text-[18px] tracking-wide">
          elprode.ar
        </Link>
        <span className="text-white/50 text-xs">Términos y Condiciones</span>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-12">
        {/* Title */}
        <div className="mb-10">
          <p className="text-sm text-slate-500 mb-1">Última actualización: 9 de mayo de 2025</p>
          <h1 className="text-3xl font-extrabold text-[#002B72] mb-3">Términos y Condiciones</h1>
          <p className="text-slate-600 text-sm leading-relaxed">
            Estos Términos y Condiciones ("Términos") regulan el acceso y uso de{' '}
            <strong>elprode.ar</strong> ("el Servicio"), una plataforma SaaS de prodes deportivos para el
            Mundial 2026, operada por Agilesrivas Tech, con base en la República Argentina.
            Al registrarte o usar el Servicio, aceptás estos Términos en su totalidad.
            Si no estás de acuerdo, no uses el Servicio.
          </p>
        </div>

        <div className="space-y-8 text-sm text-slate-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">1. Descripción del Servicio</h2>
            <p>
              elprode.ar es una plataforma que permite a empresas y organizaciones ("Organizadores")
              crear y gestionar un prode personalizado del Mundial de Fútbol 2026 para sus empleados,
              clientes o comunidad ("Participantes"). El Servicio incluye:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Panel de administración para configurar el prode (logo, colores, premios).</li>
              <li>Link y código QR únicos para que los Participantes accedan al prode.</li>
              <li>Carga y visualización de pronósticos de partidos.</li>
              <li>Ranking en tiempo real y resultados automáticos.</li>
              <li>Notificaciones push opcionales (planes Premium y Pro).</li>
              <li>Publicación del podio en Instagram (plan Pro).</li>
              <li>Carrusel de promociones geolocalizadas (plan Pro).</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">2. Registro y cuentas</h2>

            <h3 className="font-semibold text-slate-800 mb-1">2.1 Organizadores</h3>
            <p>
              Para crear un prode, los Organizadores deben registrarse con un correo electrónico y
              contraseña, o mediante Google OAuth. El Organizador es responsable de mantener la
              confidencialidad de su contraseña y de toda actividad que ocurra bajo su cuenta.
              Cada cuenta puede gestionar uno o más prodes según el plan contratado.
            </p>

            <h3 className="font-semibold text-slate-800 mb-1 mt-3">2.2 Participantes</h3>
            <p>
              Los Participantes acceden al prode de un Organizador mediante un link personalizado.
              Para participar deben proporcionar nombre, correo electrónico y número de teléfono
              celular, y aceptar estos Términos. El número de celular se usará exclusivamente para
              notificaciones relacionadas con el prode, con el consentimiento del Participante.
            </p>

            <h3 className="font-semibold text-slate-800 mb-1 mt-3">2.3 Exactitud de datos</h3>
            <p>
              Al registrarte, te comprometés a proporcionar información verdadera, actualizada y
              completa. Nos reservamos el derecho de suspender cuentas con información falsa o
              engañosa.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">3. Planes y precios</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-[#002B72] text-white">
                  <tr>
                    <th className="text-left px-3 py-2">Plan</th>
                    <th className="text-left px-3 py-2">Precio</th>
                    <th className="text-left px-3 py-2">Participantes</th>
                    <th className="text-left px-3 py-2">Incluye</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-3 py-2 font-semibold">Free</td>
                    <td className="px-3 py-2">Gratis</td>
                    <td className="px-3 py-2">Hasta 5</td>
                    <td className="px-3 py-2">Ranking en tiempo real, página pública con marca propia</td>
                  </tr>
                  <tr className="bg-[#F5F8FF]">
                    <td className="px-3 py-2 font-semibold text-[#002B72]">Pro</td>
                    <td className="px-3 py-2 font-semibold">$40.000</td>
                    <td className="px-3 py-2">Ilimitados</td>
                    <td className="px-3 py-2">Premios semanales, notificaciones push, podio en Instagram, QR descargable, exportar participantes</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-semibold text-[#b8960a]">Premium</td>
                    <td className="px-3 py-2 font-semibold">$80.000</td>
                    <td className="px-3 py-2">Ilimitados</td>
                    <td className="px-3 py-2">Todo lo del plan Pro + publicidad geolocalizada, estadísticas de visualizaciones, soporte prioritario</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Los precios están expresados en pesos argentinos (ARS) e incluyen impuestos.
              El precio es por torneo (Mundial 2026), es un pago único y no constituye una suscripción.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">4. Pagos y política de reembolsos</h2>
            <h3 className="font-semibold text-slate-800 mb-1">4.1 Procesamiento de pagos</h3>
            <p>
              Los pagos se procesan mediante <strong>MercadoPago Checkout Pro</strong>. Al realizar
              el pago aceptás también los Términos y Condiciones de MercadoPago. elprode.ar no
              almacena datos de tarjetas de crédito o débito.
            </p>

            <h3 className="font-semibold text-slate-800 mb-1 mt-3">4.2 Reembolsos</h3>
            <p>
              Dado que el Servicio es de acceso inmediato tras el pago, <strong>no se realizan
              reembolsos</strong> una vez confirmada la transacción, salvo que el Servicio presente
              una falla técnica grave que nos sea imputable y que impida el uso de las funciones
              principales durante más de 7 días corridos. En ese caso, evaluaremos el reembolso
              proporcional. Contactanos a{' '}
              <a href="mailto:elprodeargento@gmail.com" className="text-[#002B72] underline">
                elprodeargento@gmail.com
              </a>.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">5. Reglas del prode</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Puntuación:</strong> resultado exacto (marcador correcto, incluyendo tiempo suplementario si lo hubiera) = 3 puntos; ganador correcto (sin acertar marcador) = 1 punto; pronóstico incorrecto o sin cargar = 0 puntos. En partidos de mata-mata que se definen por penales, se suman 2 puntos extra a quienes acierten qué equipo avanza.</li>
              <li><strong>Cierre de pronósticos:</strong> los pronósticos se bloquean exactamente 5 minutos antes del inicio de cada partido, según el horario oficial de la FIFA. Una vez bloqueados, no pueden modificarse.</li>
              <li><strong>Resultados:</strong> los resultados se obtienen automáticamente de football-data.org. En caso de discrepancia, el resultado oficial publicado por la FIFA prevalece.</li>
              <li><strong>Partidos pendientes:</strong> los partidos suspendidos o reprogramados se actualizarán con los nuevos horarios. No generamos puntuación para partidos que no se hayan jugado.</li>
              <li><strong>Empates en ranking:</strong> en caso de igualdad de puntos, el desempate se resuelve por mayor cantidad de resultados exactos y, luego, por orden de registro.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">6. Uso de integraciones de Meta</h2>

            <h3 className="font-semibold text-slate-800 mb-1">6.1 Notificaciones Push (FCM)</h3>
            <p>
              El Organizador que contrate un plan con notificaciones push autoriza a elprode.ar
              a enviar notificaciones push en su nombre a los Participantes que las habilitaron.
              Las notificaciones se envían mediante <strong>Firebase Cloud Messaging (FCM)</strong> de Google.
              El Participante puede desactivarlas en cualquier momento desde la configuración de su navegador.
              elprode.ar no puede garantizar la entrega ante fallas del servicio de Google.
            </p>

            <h3 className="font-semibold text-slate-800 mb-1 mt-3">6.2 Instagram Graph API</h3>
            <p>
              Al conectar tu cuenta de Instagram, otorgás a elprode.ar permiso para publicar imágenes
              del podio de tu prode en tu perfil de Instagram. Esto requiere que la cuenta de
              Instagram sea de tipo <strong>Creador o Empresa</strong> (no personal). Solo publicamos
              cuando el Organizador lo solicita explícitamente desde el panel. El Organizador es
              responsable del contenido publicado en su cuenta.
            </p>
            <p className="mt-2">
              El uso está sujeto a las{' '}
              <strong>Políticas de la Plataforma Meta</strong> (developers.facebook.com/terms) y
              a los{' '}
              <strong>Términos de Uso de Instagram</strong>. No utilizamos los permisos de Instagram
              para fines distintos a la publicación del podio.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">7. Conducta del usuario</h2>
            <p className="mb-2">Al usar el Servicio, te comprometés a no:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Violar leyes o regulaciones aplicables en Argentina o el país desde donde accedés.</li>
              <li>Publicar contenido ofensivo, discriminatorio, engañoso o que infrinja derechos de terceros en el nombre de tu prode, premios o promociones.</li>
              <li>Intentar acceder a cuentas de otros usuarios o al sistema de forma no autorizada.</li>
              <li>Usar el Servicio para enviar spam o mensajes no solicitados.</li>
              <li>Hacer ingeniería inversa, descompilar o extraer el código fuente del Servicio.</li>
              <li>Crear múltiples cuentas para evadir límites del plan gratuito.</li>
              <li>Usar el Servicio para actividades que infrinjan las Políticas de la Plataforma Meta.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">8. Propiedad intelectual</h2>
            <p>
              Todo el código, diseño, marca, logotipo, textos, íconos y funcionalidades de elprode.ar
              son propiedad exclusiva de Agilesrivas Tech y están protegidos por las leyes de propiedad
              intelectual de la República Argentina y tratados internacionales.
            </p>
            <p className="mt-2">
              Los Organizadores conservan la propiedad de su logo, colores y contenido propio (premios,
              descripciones). Al subirlos al Servicio, otorgán a elprode.ar una licencia no exclusiva,
              libre de regalías, para mostrarlos dentro de la plataforma con el único fin de operar
              el Servicio.
            </p>
            <p className="mt-2">
              Los resultados de partidos del Mundial pertenecen a la FIFA. Los datos de partidos se
              obtienen mediante football-data.org bajo su licencia de API.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">9. Disponibilidad y garantías</h2>
            <p>
              Nos esforzamos por mantener el Servicio disponible de forma continua, pero no garantizamos
              una disponibilidad del 100%. Pueden ocurrir interrupciones por mantenimiento, actualizaciones,
              fallas de proveedores externos (Supabase, Vercel, Render, Meta, etc.) o causas de fuerza mayor.
            </p>
            <p className="mt-2">
              <strong>El Servicio se proporciona "tal cual" y "según disponibilidad",</strong> sin
              garantías expresas o implícitas de idoneidad para un fin particular. No somos responsables
              de pérdidas derivadas de la falta de disponibilidad del Servicio durante los partidos,
              salvo dolo o culpa grave de nuestra parte.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">10. Limitación de responsabilidad</h2>
            <p>
              En la máxima medida permitida por la ley aplicable, elprode.ar no será responsable de
              daños indirectos, incidentales, especiales, consecuentes o punitivos, incluyendo:
              pérdida de ganancias, interrupción de negocios, pérdida de datos o cualquier daño
              derivado del uso o la imposibilidad de uso del Servicio.
            </p>
            <p className="mt-2">
              La responsabilidad total de elprode.ar frente a un Organizador no podrá exceder el
              importe abonado por ese Organizador durante los 3 meses anteriores al evento que
              originó el reclamo.
            </p>
            <p className="mt-2">
              elprode.ar no es responsable por los premios que los Organizadores ofrezcan a sus
              Participantes. La entrega de premios es exclusiva responsabilidad del Organizador.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">11. Privacidad y protección de datos</h2>
            <p>
              El tratamiento de datos personales se rige por nuestra{' '}
              <Link href="/privacidad" className="text-[#002B72] underline font-medium">
                Política de Privacidad
              </Link>
              , que forma parte integrante de estos Términos. Al aceptar estos Términos, también
              aceptás nuestra Política de Privacidad.
            </p>
            <p className="mt-2">
              Los Organizadores actúan como responsables del tratamiento de los datos de sus
              Participantes. elprode.ar actúa como encargado del tratamiento en los términos
              de la Ley 25.326. El Organizador es responsable de obtener el consentimiento
              válido de sus Participantes y de cumplir con la normativa de protección de datos.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">12. Cancelación y terminación</h2>
            <h3 className="font-semibold text-slate-800 mb-1">12.1 Por el usuario</h3>
            <p>
              Los Organizadores pueden eliminar su cuenta en cualquier momento desde el panel de
              configuración. La eliminación borra permanentemente todos los datos asociados.
              No se generan reembolsos por el tiempo no utilizado del plan adquirido.
            </p>
            <h3 className="font-semibold text-slate-800 mb-1 mt-3">12.2 Por elprode.ar</h3>
            <p>
              Nos reservamos el derecho de suspender o terminar cuentas que violen estos Términos,
              las Políticas de Meta o cualquier ley aplicable, con o sin previo aviso según la
              gravedad de la infracción.
            </p>
            <h3 className="font-semibold text-slate-800 mb-1 mt-3">12.3 Fin del torneo</h3>
            <p>
              El Servicio relacionado con el Mundial 2026 estará activo hasta el 19 de julio de 2026
              (fecha estimada de la final). Posterior a esa fecha, los datos permanecerán accesibles
              por 90 días y luego se eliminarán de forma automática conforme a nuestra Política de
              Privacidad.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">13. Modificaciones a los Términos</h2>
            <p>
              Podemos modificar estos Términos en cualquier momento. Notificaremos los cambios
              materiales por correo electrónico o mediante un aviso destacado en el Servicio con
              al menos 15 días de anticipación. El uso continuado del Servicio tras la entrada en
              vigor de los nuevos Términos constituye aceptación de los mismos.
            </p>
          </section>

          {/* 14 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">14. Ley aplicable y jurisdicción</h2>
            <p>
              Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>.
              Cualquier disputa que no pueda resolverse amigablemente se someterá a la
              jurisdicción exclusiva de los tribunales ordinarios de la{' '}
              <strong>Ciudad Autónoma de Buenos Aires</strong>, con renuncia a cualquier otro fuero
              que pudiera corresponder.
            </p>
          </section>

          {/* 15 */}
          <section>
            <h2 className="text-lg font-bold text-slate-900 mb-3">15. Contacto</h2>
            <p>
              Para consultas sobre estos Términos, escribinos a:
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
            <Link href="/privacidad" className="hover:text-[#002B72] transition-colors">Política de Privacidad</Link>
            <Link href="/" className="hover:text-[#002B72] transition-colors">Inicio</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
