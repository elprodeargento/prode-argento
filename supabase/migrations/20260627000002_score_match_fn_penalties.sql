-- Extiende score_match_predictions (misma firma) para sumar el bono de penales.
-- points_earned sigue significando solo "acierto de marcador", igual que siempre.
create or replace function score_match_predictions(
  p_match_id   int,
  p_home_score int,
  p_away_score int
)
returns table(participant_id uuid, points_earned int)
language plpgsql security definer as $$
declare
  v_winner   match_winner;
  v_duration text;
begin
  select winner, duration into v_winner, v_duration from matches where id = p_match_id;

  return query
  update predictions p
  set
    points_earned = case
      when p.home_pred = p_home_score and p.away_pred = p_away_score then 3
      when sign(p.home_pred - p.away_pred) = sign(p_home_score - p_away_score) then 1
      else 0
    end,
    penalty_points = case
      when v_duration = 'PENALTY_SHOOTOUT'
           and p.penalty_pred is not null
           and p.penalty_pred::text = v_winner::text
        then 2
      else 0
    end
  where p.match_id = p_match_id
  returning p.participant_id, p.points_earned;
end;
$$;
