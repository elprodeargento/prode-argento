alter table promos
  add column if not exists name text not null default '';
