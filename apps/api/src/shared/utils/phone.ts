/**
 * Normalizes a phone number to E.164 format for Argentina for WhatsApp Cloud API.
 * Returns null if the number cannot be normalized — callers must skip those.
 *
 * WhatsApp Cloud API expects Argentine numbers as +54XXXXXXXXXX (WITHOUT the mobile 9).
 * The "9" is a PSTN convention for domestic calls in Argentina but WhatsApp
 * registers numbers internationally without it.
 *
 * Handles common user input formats:
 *   2235893608      → +542235893608   (10 digits, area + number)
 *   02235893608     → +542235893608   (11 digits, trunk 0 + area + number)
 *   542235893608    → +542235893608   (12 digits, already has country code)
 *   5492235893608   → +542235893608   (13 digits, has country code + mobile 9 — strip the 9)
 */
export function normalizeE164AR(raw: string | null | undefined): string | null {
  if (!raw) return null

  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Has country code + mobile 9: 549XXXXXXXXXX (13 digits) — strip the 9
  if (digits.startsWith('549') && digits.length === 13) return `+54${digits.slice(3)}`

  // Has country code, no mobile 9: 54XXXXXXXXXX (12 digits) — already correct
  if (digits.startsWith('54') && digits.length === 12) return `+${digits}`

  // Local format: XXXXXXXXXX (10 digits, area code + number)
  if (digits.length === 10) return `+54${digits}`

  // Local with trunk prefix 0: 0XXXXXXXXXX (11 digits) — common: "0223 589-3608"
  if (digits.length === 11 && digits.startsWith('0')) return `+54${digits.slice(1)}`

  return null
}
