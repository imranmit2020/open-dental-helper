-- Employees table with tenant/corporation support, RLS, and ID generation
-- Create employees table
CREATE TABLE IF NOT EXISTS public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'staff',
  job_title TEXT,
  department TEXT,
  employment_type TEXT DEFAULT 'full_time', -- e.g., full_time, part_time, contractor
  status TEXT NOT NULL DEFAULT 'active',
  hire_date DATE,
  termination_date DATE,
  employee_id TEXT UNIQUE,
  tenant_id UUID,
  corporation_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Exactly one of tenant_id or corporation_id must be set
  CONSTRAINT employees_org_scope_chk CHECK (
    (CASE WHEN tenant_id IS NOT NULL THEN 1 ELSE 0 END)
    + (CASE WHEN corporation_id IS NOT NULL THEN 1 ELSE 0 END) = 1
  )
);

ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_employees_tenant_id ON public.employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_corporation_id ON public.employees(corporation_id);
CREATE INDEX IF NOT EXISTS idx_employees_user_id ON public.employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON public.employees(employee_id);

-- Function to generate employee id for corporations
CREATE OR REPLACE FUNCTION public.generate_employee_id_for_corporation(_corp_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_code text;
  v_new_num integer;
  v_id text;
BEGIN
  SELECT COALESCE(c.corporate_code, 'CORP')
    INTO v_code
  FROM public.corporations c
  WHERE c.id = _corp_id;

  -- Ensure a counter exists and atomically increment
  LOOP
    UPDATE public.corporate_counters
       SET last_number = last_number + 1,
           updated_at = now()
     WHERE corporation_id = _corp_id
     RETURNING last_number INTO v_new_num;
    IF FOUND THEN EXIT; END IF;
    BEGIN
      INSERT INTO public.corporate_counters (corporation_id, last_number)
      VALUES (_corp_id, 1)
      ON CONFLICT (corporation_id) DO UPDATE
        SET last_number = public.corporate_counters.last_number + 1
      RETURNING last_number INTO v_new_num;
      EXIT;
    EXCEPTION WHEN unique_violation THEN
      -- retry
    END;
  END LOOP;

  v_id := upper(regexp_replace(v_code, '[^A-Za-z0-9]', '', 'g')) || '-' || lpad(v_new_num::text, 4, '0');
  RETURN v_id;
END;
$$;

-- Trigger function to set employee_id properly for employees table
CREATE OR REPLACE FUNCTION public.set_employee_id_on_employees_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.employee_id IS NULL THEN
    -- If scoped to a clinic (tenant), use existing generator
    IF NEW.tenant_id IS NOT NULL AND NEW.role IN ('dentist','hygienist','staff') THEN
      NEW.employee_id := public.generate_employee_id(NEW.tenant_id);
    ELSIF NEW.corporation_id IS NOT NULL THEN
      NEW.employee_id := public.generate_employee_id_for_corporation(NEW.corporation_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Triggers
DROP TRIGGER IF EXISTS set_employee_id_on_employees_insert ON public.employees;
CREATE TRIGGER set_employee_id_on_employees_insert
BEFORE INSERT ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.set_employee_id_on_employees_insert();

DROP TRIGGER IF EXISTS update_employees_updated_at ON public.employees;
CREATE TRIGGER update_employees_updated_at
BEFORE UPDATE ON public.employees
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies
DO $$ BEGIN
  DROP POLICY IF EXISTS "Employees: select by tenant, corp admin, or self" ON public.employees;
  DROP POLICY IF EXISTS "Employees: tenant insert" ON public.employees;
  DROP POLICY IF EXISTS "Employees: corp insert" ON public.employees;
  DROP POLICY IF EXISTS "Employees: tenant update" ON public.employees;
  DROP POLICY IF EXISTS "Employees: corp update" ON public.employees;
  DROP POLICY IF EXISTS "Employees: tenant delete" ON public.employees;
  DROP POLICY IF EXISTS "Employees: corp delete" ON public.employees;
END $$;

-- Select: tenant members, corporation admins, super-admins, or the user themselves
CREATE POLICY "Employees: select by tenant, corp admin, or self"
ON public.employees
FOR SELECT
USING (
  user_belongs_to_tenant(auth.uid(), tenant_id)
  OR user_is_corporate_admin(corporation_id, auth.uid())
  OR is_super_admin(auth.uid())
  OR (auth.uid() = user_id)
);

-- Inserts
CREATE POLICY "Employees: tenant insert"
ON public.employees
FOR INSERT
WITH CHECK (
  user_belongs_to_tenant(auth.uid(), tenant_id)
);

CREATE POLICY "Employees: corp insert"
ON public.employees
FOR INSERT
WITH CHECK (
  user_is_corporate_admin(corporation_id, auth.uid()) OR is_super_admin(auth.uid())
);

-- Updates
CREATE POLICY "Employees: tenant update"
ON public.employees
FOR UPDATE
USING (
  user_belongs_to_tenant(auth.uid(), tenant_id)
)
WITH CHECK (
  user_belongs_to_tenant(auth.uid(), tenant_id)
);

CREATE POLICY "Employees: corp update"
ON public.employees
FOR UPDATE
USING (
  user_is_corporate_admin(corporation_id, auth.uid()) OR is_super_admin(auth.uid())
)
WITH CHECK (
  user_is_corporate_admin(corporation_id, auth.uid()) OR is_super_admin(auth.uid())
);

-- Deletes
CREATE POLICY "Employees: tenant delete"
ON public.employees
FOR DELETE
USING (
  user_belongs_to_tenant(auth.uid(), tenant_id)
);

CREATE POLICY "Employees: corp delete"
ON public.employees
FOR DELETE
USING (
  user_is_corporate_admin(corporation_id, auth.uid()) OR is_super_admin(auth.uid())
);
