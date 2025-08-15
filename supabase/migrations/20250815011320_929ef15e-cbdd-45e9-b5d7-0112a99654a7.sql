-- Fix infinite recursion in lab_provider_users RLS policy
DROP POLICY IF EXISTS "Lab providers can manage their own account" ON public.lab_provider_users;

-- Create corrected policy without recursion
CREATE POLICY "Lab providers can manage their own account" 
ON public.lab_provider_users 
FOR ALL 
USING (auth.uid() = user_id);