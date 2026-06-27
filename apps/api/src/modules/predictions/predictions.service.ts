import { Injectable, BadRequestException } from '@nestjs/common'
import { SupabaseService } from '../../infrastructure/supabase/supabase.service'
import { SavePredictionsDto } from './dto/save-predictions.dto'

const LOCK_MINUTES_BEFORE = 5

@Injectable()
export class PredictionsService {
  constructor(private supabase: SupabaseService) {}

  async savePredictions(dto: SavePredictionsDto) {
    // Verify participant belongs to business
    const { data: participant } = await this.supabase.client
      .from('participants')
      .select('id, business_id')
      .eq('id', dto.participantId)
      .single()

    if (!participant) throw new BadRequestException('Participant not found')

    // Verify match is not locked (5 min before kickoff)
    const matchIds = dto.predictions.map((p) => p.matchId)
    const { data: matches } = await this.supabase.client
      .from('matches')
      .select('id, kickoff_at, status, stage')
      .in('id', matchIds)

    const now = new Date()
    const matchById = new Map((matches ?? []).map((m) => [m.id, m]))
    for (const match of matches ?? []) {
      const kickoff = new Date(match.kickoff_at)
      const minutesUntil = (kickoff.getTime() - now.getTime()) / 60_000
      if (minutesUntil < LOCK_MINUTES_BEFORE || match.status !== 'scheduled') {
        throw new BadRequestException(`Match ${match.id} is locked`)
      }
    }

    // Mata-mata con marcador empatado: hace falta saber quién elige el usuario que pasa por penales
    for (const p of dto.predictions) {
      const match = matchById.get(p.matchId)
      const isTie = p.homeScore === p.awayScore
      if (match && match.stage !== 'group' && isTie && !p.penaltyPred) {
        throw new BadRequestException(
          `Match ${p.matchId}: debés indicar quién pasa por penales (marcador empatado en partido de mata-mata)`,
        )
      }
    }

    // Upsert predictions
    const rows = dto.predictions.map((p) => ({
      participant_id: dto.participantId,
      business_id: participant.business_id,
      match_id: p.matchId,
      home_pred: p.homeScore,
      away_pred: p.awayScore,
      penalty_pred: p.homeScore === p.awayScore ? (p.penaltyPred ?? null) : null,
      submitted_at: new Date().toISOString(),
    }))

    const { error } = await this.supabase.client
      .from('predictions')
      .upsert(rows, { onConflict: 'participant_id,match_id' })

    if (error) throw new BadRequestException(error.message)

    return { saved: rows.length }
  }

  async findByParticipant(participantId: string) {
    const { data } = await this.supabase.client
      .from('predictions')
      .select('*, matches(*)')
      .eq('participant_id', participantId)
      .order('submitted_at', { ascending: false })

    return data ?? []
  }
}
