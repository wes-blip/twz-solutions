-- Run via Supabase CLI or SQL editor if this migration is not yet applied.
alter table public.clients
  add column if not exists is_custom_build boolean not null default false;
