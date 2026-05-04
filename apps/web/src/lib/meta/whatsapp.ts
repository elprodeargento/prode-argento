const BASE = 'https://graph.facebook.com/v22.0'

export interface WASendResult {
  messaging_product: string
  contacts: Array<{ input: string; wa_id: string }>
  messages: Array<{ id: string }>
}

async function callWA<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}/${process.env.META_PHONE_NUMBER_ID}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.META_WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`WhatsApp API error: ${res.status} ${await res.text()}`)
  return res.json() as Promise<T>
}

/** Send a plain text WhatsApp message */
export async function sendText(to: string, text: string): Promise<WASendResult> {
  return callWA<WASendResult>('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  })
}

/** Send a template message (for recurring notifications — requires Meta approval) */
export async function sendTemplate(
  to: string,
  templateName: string,
  components: unknown[],
  languageCode = 'es',
): Promise<WASendResult> {
  return callWA<WASendResult>('/messages', {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: { name: templateName, language: { code: languageCode }, components },
  })
}

/** Prode-specific helpers */
export const prodeWA = {
  /** Reminder before a match date */
  reminder: (to: string, empresaNombre: string, fecha: string, deadline: string) =>
    sendText(
      to,
      `⚽ *${empresaNombre} — Prode Mundial 2026*\n\n` +
      `Los partidos de la ${fecha} arrancan pronto.\n` +
      `⏰ Podés cargar tus pronósticos hasta *${deadline}*.\n\n` +
      `👉 Entrá acá: ${process.env.NEXT_PUBLIC_APP_URL}`,
    ),

  /** Result notification */
  result: (to: string, empresaNombre: string, fecha: string, puntaje: number, posicion: number) =>
    sendText(
      to,
      `🏆 *${empresaNombre} — Resultado ${fecha}*\n\n` +
      `Sumaste *${puntaje} puntos* y estás en el puesto *${posicion}°*.\n\n` +
      `¡Seguí así! 💪`,
    ),
}
