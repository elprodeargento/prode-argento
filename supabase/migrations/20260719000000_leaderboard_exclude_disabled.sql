-- Los participantes con is_disabled = true dejan de figurar en el ranking
-- (general y semanal), sin importar los puntos que tengan acumulados.
create or replace function recalculate_leaderboard(p_business_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into leaderboard_cache(business_id, participant_id, total_points, exact_results, correct_winners, rank, updated_at)
  select
    p.business_id,
    p.id,
    coalesce(sum(pred.points_earned), 0) + coalesce(sum(pred.penalty_points), 0),
    coalesce(sum(case when pred.points_earned = 3 then 1 else 0 end), 0),
    coalesce(sum(case when pred.points_earned = 1 then 1 else 0 end), 0),
    row_number() over (
      order by
        coalesce(sum(pred.points_earned), 0) + coalesce(sum(pred.penalty_points), 0) desc,
        coalesce(sum(case when pred.points_earned = 3 then 1 else 0 end), 0) desc,
        p.registered_at asc
    ),
    now()
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = p_business_id
    and p.is_disabled is not true
  group by p.id, p.business_id
  on conflict (business_id, participant_id) do update set
    total_points    = excluded.total_points,
    exact_results   = excluded.exact_results,
    correct_winners = excluded.correct_winners,
    rank            = excluded.rank,
    updated_at      = excluded.updated_at;

  -- El insert de arriba ya no trae a los deshabilitados, así que hay que
  -- sacarlos explícitamente de la cache (si no, queda "pegada" su última fila).
  delete from leaderboard_cache lc
  using participants pa
  where lc.participant_id = pa.id
    and lc.business_id    = p_business_id
    and pa.is_disabled is true;

  update participants pa
  set
    total_points = lc.total_points,
    rank         = lc.rank
  from leaderboard_cache lc
  where lc.participant_id = pa.id
    and lc.business_id    = p_business_id;
end;
$$;

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
      coalesce(sum(pr.points_earned), 0) + coalesce(sum(pr.penalty_points), 0)     as weekly_points,
      coalesce(sum(case when pr.points_earned = 3 then 1 else 0 end), 0)          as exact_results
    from participants p
    left join predictions pr
      on  pr.participant_id = p.id
      and pr.match_id in (select id from week_match_ids)
    where p.business_id = p_business_id
      and p.is_disabled is not true
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
