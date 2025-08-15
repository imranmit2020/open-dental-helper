-- Fix infinite recursion in lab_provider_users policies
DROP POLICY IF EXISTS "Lab provider users can view team members" ON public.lab_provider_users;
DROP POLICY IF EXISTS "Lab providers can manage their own account" ON public.lab_provider_users;

-- Create a security definer function to get user's lab provider account
CREATE OR REPLACE FUNCTION public.get_user_lab_provider_account_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT lab_provider_account_id 
  FROM public.lab_provider_users 
  WHERE user_id = _user_id 
  LIMIT 1;
$$;

-- Create corrected policies without recursion
CREATE POLICY "Lab provider users can view team members" 
ON public.lab_provider_users 
FOR SELECT 
USING (lab_provider_account_id = public.get_user_lab_provider_account_id(auth.uid()));

CREATE POLICY "Lab provider users can manage own record" 
ON public.lab_provider_users 
FOR ALL 
USING (user_id = auth.uid());