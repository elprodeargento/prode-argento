-- Weekly leaderboard aggregated entirely in Postgres — no client-side row limits.
-- Returns all participants for the business sorted by the unified tiebreaker.
create or replace function get_weekly_leaderboard(
  p_business_id uuid,
  p_week_start  timestamptz,
  p_week_end    timestamptz
)
returns table(
  participant_id uuid,
  name           text,
  email          text,
  registered_at  timestamptz,
  weekly_points  bigint,
  exact_results  bigint,
  rank           bigint
)
language plpgsql security definer as $$
begin
  return query
  with week_match_ids as (
    select id from matches
    where kickoff_at >= p_week_start
      and kickoff_at <= p_week_end
  ),
  scores as (
    select
      p.id,
      p.name,
      p.email,
      p.registered_at,
      coalesce(sum(pr.points_earned), 0)                                          as weekly_points,
      coalesce(sum(case when pr.points_earned = 3 then 1 else 0 end), 0)         as exact_results
    from participants p
    left join predictions pr
      on  pr.participant_id = p.id
      and pr.match_id in (select id from week_match_ids)
    where p.business_id = p_business_id
    group by p.id, p.name, p.email, p.registered_at
  )
  select
    id            as participant_id,
    name,
    email,
    registered_at,
    weekly_points::bigint,
    exact_results::bigint,
    row_number() over (
      order by weekly_points desc, exact_results desc, registered_at asc
    )::bigint as rank
  from scores;
end;
$$;
