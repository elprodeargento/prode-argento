alter table referral_campaigns
  add column if not exists terms_pdf_url text;
