-- Unify tiebreaker: points desc → exact results desc → registered_at asc
create or replace function recalculate_leaderboard(p_business_id uuid)
returns void language plpgsql security definer as $$
begin
  insert into leaderboard_cache(business_id, participant_id, total_points, exact_results, correct_winners, rank, updated_at)
  select
    p.business_id,
    p.id,
    coalesce(sum(pred.points_earned), 0),
    coalesce(sum(case when pred.points_earned = 3 then 1 else 0 end), 0),
    coalesce(sum(case when pred.points_earned = 1 then 1 else 0 end), 0),
    row_number() over (
      order by
        coalesce(sum(pred.points_earned), 0) desc,
        coalesce(sum(case when pred.points_earned = 3 then 1 else 0 end), 0) desc,
        p.registered_at asc
    ),
    now()
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = p_business_id
  group by p.id, p.business_id
  on conflict (business_id, participant_id) do update set
    total_points    = excluded.total_points,
    exact_results   = excluded.exact_results,
    correct_winners = excluded.correct_winners,
    rank            = excluded.rank,
    updated_at      = excluded.updated_at;

  update participants pa
  set
    total_points = lc.total_points,
    rank         = lc.rank
  from leaderboard_cache lc
  where lc.participant_id = pa.id
    and lc.business_id    = p_business_id;
end;
$$;
