import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { LeaderboardService } from '../leaderboard/leaderboard.service'

// ── football-data.org response types ──────────────────────────────────────
interface FdTeam { name: string; shortName: string | null; crest: string }
interface FdMatch {
  id:          number
  utcDate:     string
  status:      string
  matchday:    number
  stage:       string
  group:       string | null
  homeTeam:    FdTeam
  awayTeam:    FdTeam
  score: {
    winner: string | null
    fullTime: { home: number | null; away: number | null }
  }
}

const FD_STATUS_MAP: Record<string, 'scheduled' | 'live' | 'finished'> = {
  TIMED:     'scheduled',
  SCHEDULED: 'scheduled',
  LIVE:      'live',
  IN_PLAY:   'live',
  PAUSED:    'live',
  FINISHED:  'finished',
  POSTPONED: 'scheduled',
  SUSPENDED: 'scheduled',
  CANCELLED: 'scheduled',
}

const FD_STAGE_MAP: Record<string, 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'> = {
  GROUP_STAGE:    'group',
  LAST_32:        'r32',
  LAST_16:        'r16',
  QUARTER_FINALS: 'qf',
  SEMI_FINALS:    'sf',
  THIRD_PLACE:    'sf',
  FINAL:          'final',
}

const SEED_MATCHES = [
  // ── GRUPO A ──
  { group: 'A', home_team: 'México',       away_team: 'Uruguay',       home_flag: '🇲🇽', away_flag: '🇺🇾', kickoff_at: '2026-06-11T21:00:00-05:00' },
  { group: 'A', home_team: 'Argentina',    away_team: 'Senegal',       home_flag: '🇦🇷', away_flag: '🇸🇳', kickoff_at: '2026-06-12T12:00:00-05:00' },
  { group: 'A', home_team: 'Uruguay',      away_team: 'Senegal',       home_flag: '🇺🇾', away_flag: '🇸🇳', kickoff_at: '2026-06-16T15:00:00-05:00' },
  { group: 'A', home_team: 'Argentina',    away_team: 'México',        home_flag: '🇦🇷', away_flag: '🇲🇽', kickoff_at: '2026-06-16T18:00:00-05:00' },
  { group: 'A', home_team: 'Senegal',      away_team: 'Argentina',     home_flag: '🇸🇳', away_flag: '🇦🇷', kickoff_at: '2026-06-20T18:00:00-05:00' },
  { group: 'A', home_team: 'Uruguay',      away_team: 'México',        home_flag: '🇺🇾', away_flag: '🇲🇽', kickoff_at: '2026-06-20T18:00:00-05:00' },

  // ── GRUPO B ──
  { group: 'B', home_team: 'Francia',      away_team: 'Alemania',      home_flag: '🇫🇷', away_flag: '🇩🇪', kickoff_at: '2026-06-12T15:00:00-05:00' },
  { group: 'B', home_team: 'Portugal',     away_team: 'Marruecos',     home_flag: '🇵🇹', away_flag: '🇲🇦', kickoff_at: '2026-06-12T18:00:00-05:00' },
  { group: 'B', home_team: 'Alemania',     away_team: 'Marruecos',     home_flag: '🇩🇪', away_flag: '🇲🇦', kickoff_at: '2026-06-17T12:00:00-05:00' },
  { group: 'B', home_team: 'Francia',      away_team: 'Portugal',      home_flag: '🇫🇷', away_flag: '🇵🇹', kickoff_at: '2026-06-17T15:00:00-05:00' },
  { group: 'B', home_team: 'Marruecos',    away_team: 'Francia',       home_flag: '🇲🇦', away_flag: '🇫🇷', kickoff_at: '2026-06-21T18:00:00-05:00' },
  { group: 'B', home_team: 'Alemania',     away_team: 'Portugal',      home_flag: '🇩🇪', away_flag: '🇵🇹', kickoff_at: '2026-06-21T18:00:00-05:00' },

  // ── GRUPO C ──
  { group: 'C', home_team: 'Brasil',       away_team: 'Japón',         home_flag: '🇧🇷', away_flag: '🇯🇵', kickoff_at: '2026-06-13T12:00:00-05:00' },
  { group: 'C', home_team: 'España',       away_team: 'Croacia',       home_flag: '🇪🇸', away_flag: '🇭🇷', kickoff_at: '2026-06-13T15:00:00-05:00' },
  { group: 'C', home_team: 'Japón',        away_team: 'Croacia',       home_flag: '🇯🇵', away_flag: '🇭🇷', kickoff_at: '2026-06-17T18:00:00-05:00' },
  { group: 'C', home_team: 'Brasil',       away_team: 'España',        home_flag: '🇧🇷', away_flag: '🇪🇸', kickoff_at: '2026-06-18T12:00:00-05:00' },
  { group: 'C', home_team: 'Croacia',      away_team: 'Brasil',        home_flag: '🇭🇷', away_flag: '🇧🇷', kickoff_at: '2026-06-22T18:00:00-05:00' },
  { group: 'C', home_team: 'España',       away_team: 'Japón',         home_flag: '🇪🇸', away_flag: '🇯🇵', kickoff_at: '2026-06-22T18:00:00-05:00' },

  // ── GRUPO D ──
  { group: 'D', home_team: 'Inglaterra',   away_team: 'Colombia',      home_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag: '🇨🇴', kickoff_at: '2026-06-13T18:00:00-05:00' },
  { group: 'D', home_team: 'Estados Unidos', away_team: 'Ecuador',     home_flag: '🇺🇸', away_flag: '🇪🇨', kickoff_at: '2026-06-14T12:00:00-05:00' },
  { group: 'D', home_team: 'Colombia',     away_team: 'Ecuador',       home_flag: '🇨🇴', away_flag: '🇪🇨', kickoff_at: '2026-06-18T15:00:00-05:00' },
  { group: 'D', home_team: 'Inglaterra',   away_team: 'Estados Unidos', home_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', away_flag: '🇺🇸', kickoff_at: '2026-06-18T18:00:00-05:00' },
  { group: 'D', home_team: 'Ecuador',      away_team: 'Inglaterra',    home_flag: '🇪🇨', away_flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', kickoff_at: '2026-06-22T18:00:00-05:00' },
  { group: 'D', home_team: 'Colombia',     away_team: 'Estados Unidos', home_flag: '🇨🇴', away_flag: '🇺🇸', kickoff_at: '2026-06-22T18:00:00-05:00' },
]

@Injectable()
export class MatchesService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
    private leaderboard: LeaderboardService,
  ) {}

  async findAll() {
    const { data, error } = await this.supabase.client
      .from('matches')
      .select('*')
      .order('kickoff_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data ?? []
  }

  async syncFromFootballData(): Promise<{ synced: number; markedFinished: number }> {
    const apiKey = this.config.get<string>('app.footballDataKey')
    if (!apiKey) throw new Error('FOOTBALL_DATA_API_KEY no está configurada en el .env')

    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': apiKey },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`football-data.org respondió ${res.status}: ${body}`)
    }
    const { matches } = await res.json() as { matches: FdMatch[] }

    const rows = matches
      .filter(m => m.homeTeam.name !== null && m.awayTeam.name !== null)
      .map(m => ({
        fd_match_id: m.id,
        stage:       FD_STAGE_MAP[m.stage] ?? 'group',
        group:       m.group ? m.group.replace('GROUP_', '') : null,
        home_team:   m.homeTeam.shortName ?? m.homeTeam.name,
        away_team:   m.awayTeam.shortName ?? m.awayTeam.name,
        home_flag:   m.homeTeam.crest ?? '',
        away_flag:   m.awayTeam.crest ?? '',
        kickoff_at:  m.utcDate,
        home_score:  m.score.fullTime.home,
        away_score:  m.score.fullTime.away,
        status:      FD_STATUS_MAP[m.status] ?? 'scheduled',
      }))

    const { error } = await this.supabase.client
      .from('matches')
      .upsert(rows, { onConflict: 'fd_match_id' })
    if (error) throw new Error(error.message)

    // Identify matches that just finished but haven't been scored yet
    const { data: toScore, error: tsErr } = await this.supabase.client
      .from('matches')
      .select('id, home_score, away_score')
      .eq('status', 'finished')
      .not('home_score', 'is', null)
      .not('away_score', 'is', null)
      .is('scored_at', null)

    if (tsErr) throw new Error(tsErr.message)

    let markedFinished = 0
    if (toScore && toScore.length > 0) {
      for (const match of toScore) {
        try {
          // 1. Calculate points and update leaderboard cache
          await this.leaderboard.scoreMatch(match.id, match.home_score, match.away_score)

          // 2. Mark as scored so we don't process it again
          await this.supabase.client
            .from('matches')
            .update({ scored_at: new Date().toISOString() })
            .eq('id', match.id)

          markedFinished++
        } catch (err) {
          console.error(`Error scoring match ${match.id}:`, err)
        }
      }
    }

    return { synced: rows.length, markedFinished }
  }

  async seedMatches() {
    const rows = SEED_MATCHES.map((m, i) => ({
      id: i + 1,
      stage: 'group' as const,
      group: m.group,
      home_team: m.home_team,
      away_team: m.away_team,
      home_flag: m.home_flag,
      away_flag: m.away_flag,
      kickoff_at: m.kickoff_at,
      status: 'scheduled' as const,
    }))

    const { error } = await this.supabase.client
      .from('matches')
      .upsert(rows, { onConflict: 'id' })

    if (error) throw new Error(error.message)
    return { seeded: rows.length }
  }
}
