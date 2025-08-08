-- Create storage bucket and policies for analyses (no IF NOT EXISTS)
insert into storage.buckets (id, name, public)
values ('analyses','analyses', true)
on conflict (id) do nothing;

create policy "Public can view analyses images"
  on storage.objects
  for select
  using (bucket_id = 'analyses');

create policy "Staff can upload analyses images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'analyses'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('admin','dentist','staff')
    )
  );

create policy "Staff can update analyses images"
  on storage.objects
  for update
  using (
    bucket_id = 'analyses'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('admin','dentist','staff')
    )
  )
  with check (
    bucket_id = 'analyses'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('admin','dentist','staff')
    )
  );

create policy "Staff can delete analyses images"
  on storage.objects
  for delete
  using (
    bucket_id = 'analyses'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('admin','dentist','staff')
    )
  );