-- Enable clinic admins to update any profile (secure via role function)
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (public.get_user_role(auth.uid()) IN ('admin','super_admin'))
WITH CHECK (public.get_user_role(auth.uid()) IN ('admin','super_admin'));
