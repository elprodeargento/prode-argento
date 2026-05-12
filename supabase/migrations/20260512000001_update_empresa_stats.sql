drop function if exists get_empresa_stats(uuid);

create or replace function get_empresa_stats(business_id uuid)
returns table(
  total_participants bigint,
  predictions_loaded bigint,
  coverage_pct numeric,
  new_today bigint,
  weekly_visits bigint
)
language sql security definer as $$
  select
    count(distinct p.id)::bigint as total_participants,
    count(distinct pred.participant_id)::bigint as predictions_loaded,
    case when count(distinct p.id) = 0 then 0
         else round(count(distinct pred.participant_id)::numeric / count(distinct p.id) * 100, 1)
    end as coverage_pct,
    count(distinct case
      when p.registered_at >= now() - interval '24 hours'
      then p.id
    end)::bigint as new_today,
    count(distinct case
      when p.registered_at >= now() - interval '7 days'
      then p.id
    end)::bigint as weekly_visits
  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = get_empresa_stats.business_id;
$$;
