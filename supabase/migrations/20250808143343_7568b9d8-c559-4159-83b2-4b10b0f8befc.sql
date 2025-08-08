-- Schedule daily KPI email at 12:00 UTC (07:00 EST)
select
  cron.schedule(
    'kpi-email-digest-1200-utc',
    '0 12 * * *',
    $$
    select
      net.http_post(
        url:='https://nqrwtihwuvyfucmbcsem.supabase.co/functions/v1/kpi-email-digest',
        headers:='{"Content-Type": "application/json"}'::jsonb,
        body:='{"to":"ofinapulse@gmail.com","tz":"America/New_York"}'::jsonb
      ) as request_id;
    $$
  );