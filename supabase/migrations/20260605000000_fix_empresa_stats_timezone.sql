-- Corrige get_empresa_stats para contar "Nuevos hoy" usando día calendario
-- en Argentina (America/Argentina/Buenos_Aires) en lugar de ventana de 24hs.
-- Así coincide con el gráfico de crecimiento que también usa fecha local ART.

drop function if exists get_empresa_stats(uuid);

create or replace function get_empresa_stats(business_id uuid)
returns table(
  total_participants bigint,
  predictions_loaded bigint,
  coverage_pct       numeric,
  new_today          bigint,
  weekly_visits      bigint
)
language sql security definer as $$
  select
    count(distinct p.id)::bigint as total_participants,
    count(distinct pred.participant_id)::bigint as predictions_loaded,
    case when count(distinct p.id) = 0 then 0
         else round(count(distinct pred.participant_id)::numeric / count(distinct p.id) * 100, 1)
    end as coverage_pct,

    -- "Nuevos hoy" = desde medianoche ART de hoy (no ventana de 24hs)
    count(distinct case
      when p.registered_at >=
        date_trunc('day', now() at time zone 'America/Argentina/Buenos_Aires')
          at time zone 'America/Argentina/Buenos_Aires'
      then p.id
    end)::bigint as new_today,

    -- "Visitas esta semana" = últimos 7 días calendario (sin cambio)
    count(distinct case
      when p.registered_at >= now() - interval '7 days'
      then p.id
    end)::bigint as weekly_visits

  from participants p
  left join predictions pred on pred.participant_id = p.id
  where p.business_id = get_empresa_stats.business_id;
$$;
