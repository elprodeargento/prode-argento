alter table businesses
  add column if not exists match_visibility text not null default 'all'
    check (match_visibility in ('all', 'daily'));
