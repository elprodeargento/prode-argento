/**
 * Normalizes a phone number for WhatsApp Cloud API (Meta).
 * Returns null if the number cannot be normalized — callers must skip those.
 *
 * Meta API expects E.164 WITHOUT the leading + sign.
 * SPECIAL CASE ARGENTINA: Meta requires the mobile '9' prefix: 549XXXXXXXXXX.
 */
export function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null

  // Remove all non-digits, but keep a leading + if present to detect intent
  const hasLeadingPlus = raw.trim().startsWith('+')
  const digits = raw.replace(/\D/g, '')
  if (!digits) return null

  // --- ARGENTINA SPECIFIC LOGIC ---
  // If it's an Argentine number (starts with 54 or 10/11 digits without +)
  const isArgentineIntent = 
    digits.startsWith('54') || 
    (!hasLeadingPlus && (digits.length === 10 || (digits.length === 11 && digits.startsWith('0'))))

  if (isArgentineIntent) {
    // Already full format with country code + mobile 9: 549XXXXXXXXXX (13 digits)
    if (digits.startsWith('549') && digits.length === 13) return digits

    // Country code without mobile 9: 54XXXXXXXXXX (12 digits) — insert the 9
    if (digits.startsWith('54') && digits.length === 12) return `549${digits.slice(2)}`

    // Local format: XXXXXXXXXX (10 digits, area code + number) -> default to AR +54
    if (digits.length === 10) return `549${digits}` // We add 9 for Meta

    // Local with trunk prefix 0: 0XXXXXXXXXX (11 digits) — strip the 0 and add 549
    if (digits.length === 11 && digits.startsWith('0')) return `549${digits.slice(1)}`
  }

  // --- GENERAL INTERNATIONAL LOGIC ---
  // If it has enough digits to be an E.164 (min 7-8 digits)
  if (digits.length >= 8) {
    // If it already seems to have a country code, just return the digits
    return digits
  }

  return null
}

// Keep the old name as an alias to avoid breaking everything immediately
export const normalizeE164AR = normalizePhone
