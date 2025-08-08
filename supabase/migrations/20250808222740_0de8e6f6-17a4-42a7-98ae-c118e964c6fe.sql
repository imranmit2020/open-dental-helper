-- Create module_permissions table for per-clinic navigation/module access
CREATE TABLE IF NOT EXISTS public.module_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  corporation_id uuid,
  module_key text NOT NULL,
  role text NOT NULL,
  allowed boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT module_permissions_unique UNIQUE (tenant_id, module_key, role)
);

-- Enable RLS
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_module_permissions_updated_at ON public.module_permissions;
CREATE TRIGGER trg_module_permissions_updated_at
BEFORE UPDATE ON public.module_permissions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Policies
-- Allow select to users in the same tenant, or corporate admins, or super admins
DROP POLICY IF EXISTS "Module permissions select" ON public.module_permissions;
CREATE POLICY "Module permissions select"
ON public.module_permissions
FOR SELECT
USING (
  user_belongs_to_tenant(auth.uid(), tenant_id)
  OR (corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()))
  OR is_super_admin(auth.uid())
);

-- Allow insert to tenant admins, corporate admins, or super admins
DROP POLICY IF EXISTS "Module permissions insert" ON public.module_permissions;
CREATE POLICY "Module permissions insert"
ON public.module_permissions
FOR INSERT
WITH CHECK (
  (user_belongs_to_tenant(auth.uid(), tenant_id) AND get_user_tenant_role(auth.uid(), tenant_id) = 'admin')
  OR (corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()))
  OR is_super_admin(auth.uid())
);

-- Allow update to tenant admins, corporate admins, or super admins
DROP POLICY IF EXISTS "Module permissions update" ON public.module_permissions;
CREATE POLICY "Module permissions update"
ON public.module_permissions
FOR UPDATE
USING (
  (user_belongs_to_tenant(auth.uid(), tenant_id) AND get_user_tenant_role(auth.uid(), tenant_id) = 'admin')
  OR (corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()))
  OR is_super_admin(auth.uid())
)
WITH CHECK (
  (user_belongs_to_tenant(auth.uid(), tenant_id) AND get_user_tenant_role(auth.uid(), tenant_id) = 'admin')
  OR (corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()))
  OR is_super_admin(auth.uid())
);

-- Allow delete to tenant admins, corporate admins, or super admins
DROP POLICY IF EXISTS "Module permissions delete" ON public.module_permissions;
CREATE POLICY "Module permissions delete"
ON public.module_permissions
FOR DELETE
USING (
  (user_belongs_to_tenant(auth.uid(), tenant_id) AND get_user_tenant_role(auth.uid(), tenant_id) = 'admin')
  OR (corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()))
  OR is_super_admin(auth.uid())
);
