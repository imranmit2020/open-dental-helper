-- Create helper to detect super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT public.get_user_role(_user_id) = 'super_admin'
$$;

-- Create helper to check corporate admin without recursive RLS
CREATE OR REPLACE FUNCTION public.user_is_corporate_admin(_corp_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
as $$
  SELECT EXISTS (
    SELECT 1
    FROM public.corporate_users cu
    WHERE cu.corporation_id = _corp_id
      AND cu.user_id = _user_id
      AND cu.role = 'admin'
  );
$$;

-- Fix recursive corporate_users policies and add super-admin bypass
ALTER TABLE public.corporate_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Corporate admins can manage corporate users" ON public.corporate_users;
DROP POLICY IF EXISTS "Only authenticated users can insert corporate assignments" ON public.corporate_users;
DROP POLICY IF EXISTS "Users can update their own corporate assignments" ON public.corporate_users;
DROP POLICY IF EXISTS "Users can view their corporate memberships" ON public.corporate_users;
DROP POLICY IF EXISTS "Users can view their own corporate assignments" ON public.corporate_users;

CREATE POLICY "Corporate users select (self, corp-admin, super-admin)" ON public.corporate_users
FOR SELECT
USING (
  user_id = auth.uid()
  OR public.user_is_corporate_admin(corporation_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Corporate users insert (self, corp-admin, super-admin)" ON public.corporate_users
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  OR public.user_is_corporate_admin(corporation_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Corporate users update (self, corp-admin, super-admin)" ON public.corporate_users
FOR UPDATE
USING (
  user_id = auth.uid()
  OR public.user_is_corporate_admin(corporation_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Corporate users delete (corp-admin, super-admin)" ON public.corporate_users
FOR DELETE
USING (
  public.user_is_corporate_admin(corporation_id, auth.uid())
  OR public.is_super_admin(auth.uid())
);

-- Corporations policies: allow member view and super-admin full manage
DROP POLICY IF EXISTS "Users can view corporations they belong to" ON public.corporations;
CREATE POLICY "View corporations (member or super-admin)" ON public.corporations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.corporate_users cu
    WHERE cu.corporation_id = corporations.id
      AND cu.user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Super-admin manage corporations" ON public.corporations
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Tenants policies: allow member view and super-admin manage
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;
CREATE POLICY "View tenants (member or super-admin)" ON public.tenants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.tenant_users tu
    WHERE tu.tenant_id = tenants.id
      AND tu.user_id = auth.uid()
  )
  OR public.is_super_admin(auth.uid())
);

CREATE POLICY "Super-admin manage tenants" ON public.tenants
FOR ALL
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));

-- Tenant users: include super-admin in manage
DROP POLICY IF EXISTS "Admin can manage tenant users" ON public.tenant_users;
CREATE POLICY "Admin or super-admin can manage tenant users" ON public.tenant_users
FOR ALL
USING (
  public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
  OR public.is_super_admin(auth.uid())
)
WITH CHECK (
  public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
  OR public.is_super_admin(auth.uid())
);

-- Profiles: super-admin can update any profile
DROP POLICY IF EXISTS "Super-admin can update any profile" ON public.profiles;
CREATE POLICY "Super-admin can update any profile" ON public.profiles
FOR UPDATE
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));