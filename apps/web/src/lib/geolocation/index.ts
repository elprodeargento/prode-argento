/** Haversine formula — returns distance in km */
export function getDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export interface Promo {
  id: string
  business_id: string
  business_name: string
  description: string
  image_url: string | null
  lat: number
  lon: number
  radius_km: number
  valid_until: string
}

/** Filter promos by user location */
export function filterPromosByLocation(
  promos: Promo[],
  userLat: number,
  userLon: number,
): Promo[] {
  return promos
    .filter((p) => getDistanceKm(userLat, userLon, p.lat, p.lon) <= p.radius_km)
    .sort((a, b) => {
      const da = getDistanceKm(userLat, userLon, a.lat, a.lon)
      const db = getDistanceKm(userLat, userLon, b.lat, b.lon)
      return da - db
    })
}
