-- 1) Harden profiles visibility and role updates
-- Drop overly permissive SELECT policy
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can view all profiles'
  ) THEN
    DROP POLICY "Users can view all profiles" ON public.profiles;
  END IF;
END $$;

-- Ensure unique mapping from profiles.user_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON public.profiles(user_id);

-- Update get_user_role to rely only on profiles
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = _user_id),
    'user'
  );
$$;

-- Prevent self role escalation
CREATE OR REPLACE FUNCTION public.profile_role_unchanged(_user_id uuid, _new_role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT (SELECT role FROM public.profiles WHERE user_id = _user_id) = _new_role;
$$;

-- Recreate user update policy to disallow changing own role
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    DROP POLICY "Users can update own profile" ON public.profiles;
  END IF;
END $$;

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND public.profile_role_unchanged(user_id, role));

-- Add scoped SELECT policies
CREATE POLICY IF NOT EXISTS "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Staff can view profiles"
ON public.profiles
FOR SELECT
USING (public.get_user_role(auth.uid()) IN ('admin','super_admin','dentist','staff','hygienist'));


-- 2) Tenant isolation on key clinical tables
-- Helper: drop policy if exists function
DO $$ BEGIN
  -- patients: drop old staff policies
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Staff can view all patients') THEN
    DROP POLICY "Staff can view all patients" ON public.patients;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Staff can manage patients') THEN
    DROP POLICY "Staff can manage patients" ON public.patients;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Staff can update patients') THEN
    DROP POLICY "Staff can update patients" ON public.patients;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Staff can insert patients') THEN
    DROP POLICY "Staff can insert patients" ON public.patients;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='patients' AND policyname='Staff can delete patients') THEN
    DROP POLICY "Staff can delete patients" ON public.patients;
  END IF;
END $$;

-- Recreate scoped staff policies for patients
CREATE POLICY "Staff select patients in tenant"
ON public.patients
FOR SELECT
USING (public.user_belongs_to_tenant(auth.uid(), patients.tenant_id));

CREATE POLICY "Staff insert patients in tenant"
ON public.patients
FOR INSERT
WITH CHECK (public.user_belongs_to_tenant(auth.uid(), patients.tenant_id));

CREATE POLICY "Staff update patients in tenant"
ON public.patients
FOR UPDATE
USING (public.user_belongs_to_tenant(auth.uid(), patients.tenant_id))
WITH CHECK (public.user_belongs_to_tenant(auth.uid(), patients.tenant_id));

CREATE POLICY "Staff delete patients in tenant"
ON public.patients
FOR DELETE
USING (public.user_belongs_to_tenant(auth.uid(), patients.tenant_id));

-- appointments
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Staff can manage appointments') THEN
    DROP POLICY "Staff can manage appointments" ON public.appointments;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='appointments' AND policyname='Staff can view all appointments') THEN
    DROP POLICY "Staff can view all appointments" ON public.appointments;
  END IF;
END $$;

CREATE POLICY "Staff select appointments in tenant"
ON public.appointments
FOR SELECT
USING (public.user_belongs_to_tenant(auth.uid(), appointments.tenant_id));

CREATE POLICY "Staff insert appointments in tenant"
ON public.appointments
FOR INSERT
WITH CHECK (public.user_belongs_to_tenant(auth.uid(), appointments.tenant_id));

CREATE POLICY "Staff update appointments in tenant"
ON public.appointments
FOR UPDATE
USING (public.user_belongs_to_tenant(auth.uid(), appointments.tenant_id))
WITH CHECK (public.user_belongs_to_tenant(auth.uid(), appointments.tenant_id));

CREATE POLICY "Staff delete appointments in tenant"
ON public.appointments
FOR DELETE
USING (public.user_belongs_to_tenant(auth.uid(), appointments.tenant_id));

-- medical_records (scope via patients.tenant_id)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='Staff can manage medical records') THEN
    DROP POLICY "Staff can manage medical records" ON public.medical_records;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='medical_records' AND policyname='Staff can view all medical records') THEN
    DROP POLICY "Staff can view all medical records" ON public.medical_records;
  END IF;
END $$;

CREATE POLICY "Staff select medical_records in tenant"
ON public.medical_records
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = medical_records.patient_id AND tu.user_id = auth.uid()
));

CREATE POLICY "Staff insert medical_records in tenant"
ON public.medical_records
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = medical_records.patient_id AND tu.user_id = auth.uid()
));

CREATE POLICY "Staff update medical_records in tenant"
ON public.medical_records
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = medical_records.patient_id AND tu.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = medical_records.patient_id AND tu.user_id = auth.uid()
));

-- consent_forms (scope via patients)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consent_forms' AND policyname='Staff can manage consent forms') THEN
    DROP POLICY "Staff can manage consent forms" ON public.consent_forms;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='consent_forms' AND policyname='Staff can view all consent forms') THEN
    DROP POLICY "Staff can view all consent forms" ON public.consent_forms;
  END IF;
END $$;

CREATE POLICY "Staff select consent_forms in tenant"
ON public.consent_forms
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = consent_forms.patient_id AND tu.user_id = auth.uid()
));

CREATE POLICY "Staff insert consent_forms in tenant"
ON public.consent_forms
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = consent_forms.patient_id AND tu.user_id = auth.uid()
));

CREATE POLICY "Staff update consent_forms in tenant"
ON public.consent_forms
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = consent_forms.patient_id AND tu.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = consent_forms.patient_id AND tu.user_id = auth.uid()
));

-- image_analyses (scope via patients)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='image_analyses' AND policyname='Staff can manage image analyses') THEN
    DROP POLICY "Staff can manage image analyses" ON public.image_analyses;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='image_analyses' AND policyname='Staff can view all image analyses') THEN
    DROP POLICY "Staff can view all image analyses" ON public.image_analyses;
  END IF;
END $$;

CREATE POLICY "Staff select image_analyses in tenant"
ON public.image_analyses
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = image_analyses.patient_id AND tu.user_id = auth.uid()
));

CREATE POLICY "Staff insert image_analyses in tenant"
ON public.image_analyses
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = image_analyses.patient_id AND tu.user_id = auth.uid()
));

CREATE POLICY "Staff update image_analyses in tenant"
ON public.image_analyses
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = image_analyses.patient_id AND tu.user_id = auth.uid()
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.patients p
  JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
  WHERE p.id = image_analyses.patient_id AND tu.user_id = auth.uid()
));

-- dentist_availability
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dentist_availability' AND policyname='Staff can manage dentist availability') THEN
    DROP POLICY "Staff can manage dentist availability" ON public.dentist_availability;
  END IF;
END $$;

CREATE POLICY "Staff manage dentist availability in tenant"
ON public.dentist_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid() AND tu.tenant_id = dentist_availability.tenant_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid() AND tu.tenant_id = dentist_availability.tenant_id
));

-- hygienist_availability
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hygienist_availability' AND policyname='Staff can insert hygienist availability') THEN
    DROP POLICY "Staff can insert hygienist availability" ON public.hygienist_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hygienist_availability' AND policyname='Staff can update hygienist availability') THEN
    DROP POLICY "Staff can update hygienist availability" ON public.hygienist_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hygienist_availability' AND policyname='Staff can delete hygienist availability') THEN
    DROP POLICY "Staff can delete hygienist availability" ON public.hygienist_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='hygienist_availability' AND policyname='Staff can view hygienist availability') THEN
    DROP POLICY "Staff can view hygienist availability" ON public.hygienist_availability;
  END IF;
END $$;

CREATE POLICY "Staff manage hygienist availability in tenant"
ON public.hygienist_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid() AND tu.tenant_id = hygienist_availability.tenant_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid() AND tu.tenant_id = hygienist_availability.tenant_id
));

-- staff_availability
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff_availability' AND policyname='Staff can insert staff availability') THEN
    DROP POLICY "Staff can insert staff availability" ON public.staff_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff_availability' AND policyname='Staff can update staff availability') THEN
    DROP POLICY "Staff can update staff availability" ON public.staff_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff_availability' AND policyname='Staff can delete staff availability') THEN
    DROP POLICY "Staff can delete staff availability" ON public.staff_availability;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='staff_availability' AND policyname='Staff can view staff availability') THEN
    DROP POLICY "Staff can view staff availability" ON public.staff_availability;
  END IF;
END $$;

CREATE POLICY "Staff manage staff availability in tenant"
ON public.staff_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid() AND tu.tenant_id = staff_availability.tenant_id
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.tenant_users tu
  WHERE tu.user_id = auth.uid() AND tu.tenant_id = staff_availability.tenant_id
));

-- 3) Audit logs: tenant-aware viewing
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='audit_logs' AND policyname='Admin can view all audit logs') THEN
    DROP POLICY "Admin can view all audit logs" ON public.audit_logs;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.can_view_audit_log(_viewer uuid, _patient_id uuid, _log_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.is_super_admin(_viewer)
    OR EXISTS (
      SELECT 1
      FROM public.tenant_users tu_admin
      WHERE tu_admin.user_id = _viewer
        AND public.get_user_tenant_role(_viewer, tu_admin.tenant_id) = 'admin'
        AND (
          (_patient_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.patients p
            WHERE p.id = _patient_id AND p.tenant_id = tu_admin.tenant_id
          ))
          OR (_log_user_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.tenant_users tu_actor
            WHERE tu_actor.user_id = _log_user_id AND tu_actor.tenant_id = tu_admin.tenant_id
          ))
        )
    );
$$;

CREATE POLICY "Tenant admins can view relevant audit logs"
ON public.audit_logs
FOR SELECT
USING (public.can_view_audit_log(auth.uid(), patient_id, user_id));

-- Keep insert policy as-is (staff write their own logs)

-- 4) Enable and lock down corporate_counters
ALTER TABLE public.corporate_counters ENABLE ROW LEVEL SECURITY;

-- Allow only super_admin and corporate admins to read; no direct writes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='corporate_counters' AND policyname='Read corporate counters (admins only)') THEN
    CREATE POLICY "Read corporate counters (admins only)"
    ON public.corporate_counters
    FOR SELECT
    USING (
      public.is_super_admin(auth.uid()) OR EXISTS (
        SELECT 1 FROM public.corporate_users cu
        WHERE cu.corporation_id = corporate_counters.corporation_id
          AND cu.user_id = auth.uid()
          AND cu.role = 'admin'
      )
    );
  END IF;
END $$;

-- Do NOT add INSERT/UPDATE/DELETE policies so clients cannot mutate counters
