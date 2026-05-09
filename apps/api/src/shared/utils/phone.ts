/**
 * Normalizes a phone number for WhatsApp Cloud API (Meta).
 * Returns null if the number cannot be normalized — callers must skip those.
 *
 * Meta API expects E.164 WITHOUT the leading + sign and WITH the Argentine
 * mobile 9 prefix: 549XXXXXXXXXX (13 digits, no +).
 *
 * Handles common user input formats:
 *   2235893608      → 542235893608    (10 digits, area + number)
 *   02235893608     → 542235893608    (11 digits, trunk 0 stripped)
 *   542235893608    → 5492235893608   (12 digits, inserts mobile 9)
 *   5492235893608   → 5492235893608   (13 digits, already correct)
 */
export function normalizeE164AR(raw: string | null | undefined): string | null {
  if (!raw) return null

  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Already full format with country code + mobile 9: 549XXXXXXXXXX (13 digits)
  if (digits.startsWith('549') && digits.length === 13) return digits

  // Country code without mobile 9: 54XXXXXXXXXX (12 digits) — insert the 9
  if (digits.startsWith('54') && digits.length === 12) return `549${digits.slice(2)}`

  // Local format: XXXXXXXXXX (10 digits, area code + number)
  if (digits.length === 10) return `54${digits}`

  // Local with trunk prefix 0: 0XXXXXXXXXX (11 digits) — strip the 0
  if (digits.length === 11 && digits.startsWith('0')) return `54${digits.slice(1)}`

  return null
}
