-- Secure the updated_at trigger function by setting a fixed search_path
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path to ''
as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;