-- Recreate super-admin profiles update policy without IF NOT EXISTS
DROP POLICY IF EXISTS "Super-admin can update any profile" ON public.profiles;
CREATE POLICY "Super-admin can update any profile" ON public.profiles
FOR UPDATE
USING (public.is_super_admin(auth.uid()))
WITH CHECK (public.is_super_admin(auth.uid()));