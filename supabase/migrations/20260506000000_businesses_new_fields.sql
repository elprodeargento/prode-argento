-- Add background image and weekly prize fields to businesses
alter table businesses
  add column if not exists background_url        text,
  add column if not exists weekly_prize_description text,
  add column if not exists close_minutes         int not null default 5,
  add column if not exists auto_post_ig          boolean not null default false,
  add column if not exists notify_reminders      boolean not null default true,
  add column if not exists notify_results        boolean not null default true,
  add column if not exists notify_ranking        boolean not null default false,
  add column if not exists notify_whatsapp       boolean not null default false;
