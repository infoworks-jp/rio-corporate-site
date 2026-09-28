-- Additive: preserves all existing submissions. Apply once through Supabase migration tooling.
alter table public.rio_contact_submissions
  add column if not exists content_hash text,
  add column if not exists spam_score integer not null default 0,
  add column if not exists spam_reasons text not null default '';
create index if not exists rio_contact_content_hash_created_idx
  on public.rio_contact_submissions (content_hash, created_at desc);
alter table public.rio_contact_submissions enable row level security;
alter table public.rio_contact_rate_limits enable row level security;
revoke all on public.rio_contact_submissions from anon, authenticated;
revoke all on public.rio_contact_rate_limits from anon, authenticated;
