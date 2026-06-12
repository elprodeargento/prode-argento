-- Fix "column reference name is ambiguous" — qualify all columns from scores CTE
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
      p.id                                                                         as pid,
      p.name                                                                       as pname,
      p.email                                                                      as pemail,
      p.registered_at                                                              as preg,
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
    s.pid            as participant_id,
    s.pname          as name,
    s.pemail         as email,
    s.preg           as registered_at,
    s.weekly_points::bigint,
    s.exact_results::bigint,
    row_number() over (
      order by s.weekly_points desc, s.exact_results desc, s.preg asc
    )::bigint as rank
  from scores s;
end;
$$;
