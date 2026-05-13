import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Términos del Programa de Referidos — elprode.ar' }

export default function TerminosReferidosPage() {
  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <h1 className="text-2xl font-black text-[#002B72] mb-2">
        Términos y Condiciones del Programa de Referidos
      </h1>
      <p className="text-sm text-slate-400 mb-8">elprode.ar</p>

      {[
        {
          title: '1. Participación',
          text: 'La participación en el programa de referidos es voluntaria y está disponible para usuarios registrados en elprode.ar. Al participar, el usuario acepta estos términos en su totalidad.',
        },
        {
          title: '2. Cómo funciona',
          text: 'El participante obtiene un link único de referido. Por cada 3 comercios que se registren a través de ese link y abonen un plan pago (Pro o Premium), el participante acumula un crédito de $12.000 ARS. No existe límite de grupos de referidos.',
        },
        {
          title: '3. Condiciones para el cobro',
          text: 'El crédito se genera únicamente cuando el pago del comercio referido se acredita efectivamente en las cuentas de elprode.ar. Los pagos con tarjeta de crédito pueden demorar hasta 18 días hábiles en acreditarse. Una vez generado el crédito, el participante debe solicitar el cobro desde la plataforma. elprode.ar tiene hasta 10 días hábiles para procesar la transferencia desde la fecha de solicitud. El cobro se realiza únicamente por transferencia bancaria o MercadoPago al alias o CBU informado por el participante. elprode.ar no se responsabiliza por datos incorrectos ingresados por el usuario.',
        },
        {
          title: '4. Referidos válidos',
          text: 'Solo se consideran válidos los comercios que completan el registro y abonan un plan Pro o Premium. Cada comercio puede ser referido por un único participante. En caso de múltiples referidos para el mismo comercio, se considera válido el primero registrado cronológicamente. No se aceptan auto-referidos ni referidos entre personas vinculadas al mismo comercio.',
        },
        {
          title: '5. Vigencia del crédito',
          text: 'Los créditos acumulados no tienen fecha de vencimiento mientras el programa esté activo. En caso de discontinuación del programa, se respetarán los créditos ya generados y pendientes de cobro, otorgando un plazo de 30 días corridos para solicitar el cobro.',
        },
        {
          title: '6. Modificaciones y cancelación',
          text: 'elprode.ar se reserva el derecho de modificar las condiciones del programa, incluyendo el monto del cashback, en cualquier momento mediante notificación en la plataforma. Los cambios no afectarán créditos ya acumulados al momento del anuncio. elprode.ar podrá cancelar la participación de cualquier usuario que intente manipular el sistema, sin derecho a reclamo de créditos pendientes.',
        },
        {
          title: '7. Fraude y uso indebido',
          text: 'Queda expresamente prohibido el uso de cuentas falsas, datos inventados, o cualquier mecanismo artificial para generar referidos. La detección de fraude resultará en la cancelación inmediata de todos los créditos acumulados y la inhabilitación del usuario.',
        },
        {
          title: '8. Impuestos',
          text: 'El cashback recibido puede estar sujeto a obligaciones impositivas según la situación fiscal de cada participante. elprode.ar no se responsabiliza por la declaración o pago de impuestos que correspondan al participante.',
        },
        {
          title: '9. Jurisdicción',
          text: 'Cualquier controversia derivada de este programa se resolverá bajo la legislación de la República Argentina, siendo competentes los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.',
        },
        {
          title: '10. Contacto',
          text: 'Para consultas sobre el programa: elprodeargento@gmail.com',
        },
      ].map(item => (
        <div key={item.title} className="mb-6">
          <h2 className="font-black text-[#0D1A3A] text-[15px] mb-1">{item.title}</h2>
          <p className="text-[14px] text-slate-600 leading-relaxed">{item.text}</p>
        </div>
      ))}
    </div>
  )
}
