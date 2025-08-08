-- Enable required extensions for scheduling HTTP calls
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Schedule daily KPI snapshot at 02:00 UTC
select
  cron.schedule(
    'kpi-daily-snapshot-0200-utc',
    '0 2 * * *', -- every day at 02:00 UTC
    $$
    select
      net.http_post(
        url:='https://nqrwtihwuvyfucmbcsem.supabase.co/functions/v1/kpi-daily-snapshot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xcnd0aWh3dXZ5ZnVjbWJjc2VtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNjA2NjEsImV4cCI6MjA2OTYzNjY2MX0.nsj54ja-75ePDqhUJKFUTQJbBxavir9YhSdDrnWiekc"}'::jsonb,
        body:='{"source":"cron"}'::jsonb
      ) as request_id;
    $$
  );