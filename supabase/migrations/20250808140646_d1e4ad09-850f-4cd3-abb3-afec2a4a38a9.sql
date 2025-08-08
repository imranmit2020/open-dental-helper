-- Ensure extensions are installed in the 'extensions' schema (not public)
create schema if not exists extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- If extensions already exist in another schema, move them
alter extension pg_net set schema extensions;
alter extension pg_cron set schema extensions;