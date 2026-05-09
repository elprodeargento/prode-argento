/**
 * Normalizes a phone number to E.164 format for Argentina (+549XXXXXXXXXX).
 * Returns null if the number cannot be normalized — callers must skip those.
 *
 * Argentine mobile E.164 format: +549 + area code (2-4 digits) + number = 13 digits total
 * The "9" after the country code is required for mobile numbers to receive WA messages.
 */
export function normalizeE164AR(raw: string | null | undefined): string | null {
  if (!raw) return null

  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // Already full E.164 with country code + mobile 9: +549XXXXXXXXXX (13 digits)
  if (digits.startsWith('549') && digits.length === 13) return `+${digits}`

  // Country code present but missing mobile 9: 54XXXXXXXXXX (12 digits)
  if (digits.startsWith('54') && digits.length === 12) return `+549${digits.slice(2)}`

  // Local format without country code: XXXXXXXXXX (10 digits, area code + number)
  if (digits.length === 10) return `+549${digits}`

  return null
}
