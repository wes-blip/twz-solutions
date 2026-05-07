-- Scheduled call times from Cal.com webhooks (timestamptz = meeting start in UTC).
alter table public.clients
  add column if not exists next_strategy_call timestamptz null;

alter table public.clients
  add column if not exists intake_call_date timestamptz null;
