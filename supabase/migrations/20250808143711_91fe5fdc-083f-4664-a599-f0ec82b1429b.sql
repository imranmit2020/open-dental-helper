-- Create storage bucket for analyses images and secure policies
insert into storage.buckets (id, name, public)
values ('analyses','analyses', true)
on conflict (id) do nothing;

-- Allow public read access to analyses images
create policy if not exists "Public can view analyses images"
  on storage.objects
  for select
  using (bucket_id = 'analyses');

-- Allow staff to upload analyses images
create policy if not exists "Staff can upload analyses images"
  on storage.objects
  for insert
  with check (
    bucket_id = 'analyses'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('admin','dentist','staff')
    )
  );

-- Allow staff to update analyses images
create policy if not exists "Staff can update analyses images"
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

-- Allow staff to delete analyses images
create policy if not exists "Staff can delete analyses images"
  on storage.objects
  for delete
  using (
    bucket_id = 'analyses'
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.role in ('admin','dentist','staff')
    )
  );