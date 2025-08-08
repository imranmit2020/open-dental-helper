-- Create staff_availability table (if missing), add required FKs, indexes, RLS policies, and update trigger

-- 1) Table
create table if not exists public.staff_availability (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid not null,
  tenant_id uuid not null,
  day_of_week integer not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  break_start_time time without time zone,
  break_end_time time without time zone,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Foreign keys to match PostgREST relationship names used by the app
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'staff_availability_staff_id_fkey'
  ) then
    alter table public.staff_availability
      add constraint staff_availability_staff_id_fkey
      foreign key (staff_id) references public.profiles(id) on delete cascade;
  end if;
end$$;

DO $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conname = 'staff_availability_tenant_id_fkey'
  ) then
    alter table public.staff_availability
      add constraint staff_availability_tenant_id_fkey
      foreign key (tenant_id) references public.tenants(id) on delete cascade;
  end if;
end$$;

-- 3) Indexes
create index if not exists idx_staff_availability_staff on public.staff_availability(staff_id);
create index if not exists idx_staff_availability_tenant on public.staff_availability(tenant_id);
create index if not exists idx_staff_availability_day on public.staff_availability(day_of_week);

-- 4) RLS
alter table public.staff_availability enable row level security;

-- policy: Staff (admin/dentist/staff) can view
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'staff_availability' 
      AND policyname = 'Staff can view staff availability'
  ) THEN
    CREATE POLICY "Staff can view staff availability"
    ON public.staff_availability
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
          AND profiles.role = ANY (ARRAY['admin','dentist','staff'])
      )
    );
  END IF;
END$$;

-- policy: Staff can insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'staff_availability' 
      AND policyname = 'Staff can insert staff availability'
  ) THEN
    CREATE POLICY "Staff can insert staff availability"
    ON public.staff_availability
    FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
          AND profiles.role = ANY (ARRAY['admin','dentist','staff'])
      )
    );
  END IF;
END$$;

-- policy: Staff can update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'staff_availability' 
      AND policyname = 'Staff can update staff availability'
  ) THEN
    CREATE POLICY "Staff can update staff availability"
    ON public.staff_availability
    FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
          AND profiles.role = ANY (ARRAY['admin','dentist','staff'])
      )
    );
  END IF;
END$$;

-- policy: Staff can delete
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'staff_availability' 
      AND policyname = 'Staff can delete staff availability'
  ) THEN
    CREATE POLICY "Staff can delete staff availability"
    ON public.staff_availability
    FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.user_id = auth.uid() 
          AND profiles.role = ANY (ARRAY['admin','dentist','staff'])
      )
    );
  END IF;
END$$;

-- 5) updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$ language plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_staff_availability_updated_at'
  ) THEN
    CREATE TRIGGER update_staff_availability_updated_at
    BEFORE UPDATE ON public.staff_availability
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;