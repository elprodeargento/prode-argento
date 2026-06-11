-- Reset scored_at on finished matches that have confirmed scores.
-- This forces the scoring cron to re-process them, ensuring predictions
-- are scored and leaderboard_cache is populated from scratch.
update matches
set scored_at = null
where status = 'finished'
  and home_score is not null
  and away_score is not null;
