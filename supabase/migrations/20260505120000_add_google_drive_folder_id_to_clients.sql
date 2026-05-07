-- Headless Google Drive: folder id for listing/linking client project files.
alter table public.clients
  add column if not exists google_drive_folder_id text null;
