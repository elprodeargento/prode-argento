/** football-data.org v4 — free tier: 10 calls/min, no CORS */
const BASE = 'https://api.football-data.org/v4'
const WORLD_CUP_2026 = 'WC' // competition code

async function fdFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
    next: { revalidate: 60 }, // ISR: revalidate every 60s
  })
  if (!res.ok) throw new Error(`football-data.org error: ${res.status}`)
  return res.json() as Promise<T>
}

export interface FDMatch {
  id: number
  utcDate: string
  status: 'SCHEDULED' | 'LIVE' | 'IN_PLAY' | 'PAUSED' | 'FINISHED'
  stage: string
  group: string | null
  homeTeam: { id: number; name: string; crest: string }
  awayTeam: { id: number; name: string; crest: string }
  score: {
    fullTime: { home: number | null; away: number | null }
    halfTime: { home: number | null; away: number | null }
  }
}

export interface FDMatchesResponse {
  count: number
  matches: FDMatch[]
}

/** Fetch all World Cup 2026 matches */
export async function getAllMatches(): Promise<FDMatchesResponse> {
  return fdFetch(`/competitions/${WORLD_CUP_2026}/matches`)
}

/** Fetch today's matches */
export async function getTodayMatches(): Promise<FDMatchesResponse> {
  const today = new Date().toISOString().split('T')[0]
  return fdFetch(`/competitions/${WORLD_CUP_2026}/matches?dateFrom=${today}&dateTo=${today}`)
}

/** Fetch a single match */
export async function getMatch(id: number): Promise<{ match: FDMatch }> {
  return fdFetch(`/matches/${id}`)
}

/** Map API status to our DB status */
export function mapStatus(status: FDMatch['status']): 'scheduled' | 'live' | 'finished' {
  if (['LIVE', 'IN_PLAY', 'PAUSED'].includes(status)) return 'live'
  if (status === 'FINISHED') return 'finished'
  return 'scheduled'
}
