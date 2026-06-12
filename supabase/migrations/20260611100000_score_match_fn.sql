-- Scores all predictions for a finished match in a single UPDATE.
-- Runs inside Postgres with no client-side row limits.
create or replace function score_match_predictions(
  p_match_id   int,
  p_home_score int,
  p_away_score int
)
returns table(participant_id uuid, points_earned int)
language plpgsql security definer as $$
begin
  return query
  update predictions p
  set points_earned = case
    when p.home_pred = p_home_score and p.away_pred = p_away_score then 3
    when sign(p.home_pred - p.away_pred) = sign(p_home_score - p_away_score) then 1
    else 0
  end
  where p.match_id = p_match_id
  returning p.participant_id, p.points_earned;
end;
$$;

-- Reset scored_at so the scoring cron reprocesses all finished matches
-- with the new function (no row-limit issues this time).
update matches
set scored_at = null
where status = 'finished'
  and home_score is not null
  and away_score is not null;
