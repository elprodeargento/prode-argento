create or replace function increment_promo_views(promo_id uuid)
returns void
language sql
security definer
as $$
  update promos set views = views + 1 where id = promo_id;
$$;
