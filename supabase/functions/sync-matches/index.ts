import { createClient } from 'jsr:@supabase/supabase-js@2'

const WORLD_CUP = 'WC'
const BASE = 'https://api.football-data.org/v4'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const res = await fetch(`${BASE}/competitions/${WORLD_CUP}/matches`, {
    headers: { 'X-Auth-Token': Deno.env.get('FOOTBALL_DATA_API_KEY')! },
  })

  const { matches } = await res.json()

  let updated = 0
  for (const m of matches) {
    const status =
      ['LIVE','IN_PLAY','PAUSED'].includes(m.status) ? 'live'
      : m.status === 'FINISHED' ? 'finished'
      : 'scheduled'

    const { error } = await supabase.from('matches').upsert({
      fd_match_id: m.id,
      home_team:   m.homeTeam.name,
      away_team:   m.awayTeam.name,
      kickoff_at:  m.utcDate,
      status,
      home_score:  m.score?.fullTime?.home ?? null,
      away_score:  m.score?.fullTime?.away ?? null,
      stage:       m.stage === 'GROUP_STAGE' ? 'group' : m.stage.toLowerCase(),
      group:       m.group ?? null,
    }, { onConflict: 'fd_match_id' })

    if (!error) updated++
  }

  return new Response(JSON.stringify({ synced: updated }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
