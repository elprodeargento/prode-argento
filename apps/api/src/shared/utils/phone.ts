/**
 * Normalizes a phone number to E.164 format for Argentina (+549XXXXXXXXXX).
 * Returns null if the number cannot be normalized — callers must skip those.
 *
 * Argentine mobile E.164: +549 + area code + number = 13 digits total.
 * The "9" after the country code is required for mobile WA delivery.
 *
 * Handles common user input formats:
 *   1112345678      → +5491112345678  (10 digits, area + number)
 *   01112345678     → +5491112345678  (11 digits, trunk 0 + area + number)
 *   541112345678    → +5491112345678  (12 digits, country code without mobile 9)
 *   5491112345678   → +5491112345678  (13 digits, already full E.164)
 */
export function normalizeE164AR(raw: string | null | undefined): string | null {
  if (!raw) return null

  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Already full E.164: +549XXXXXXXXXX (13 digits)
  if (digits.startsWith('549') && digits.length === 13) return `+${digits}`

  // Country code without mobile 9: 54XXXXXXXXXX (12 digits)
  if (digits.startsWith('54') && digits.length === 12) return `+549${digits.slice(2)}`

  // Local format: XXXXXXXXXX (10 digits, area code + number)
  if (digits.length === 10) return `+549${digits}`

  // Local format with trunk prefix 0: 0XXXXXXXXXX (11 digits) — very common: "011 1234-5678"
  if (digits.length === 11 && digits.startsWith('0')) return `+549${digits.slice(1)}`

  return null
}
