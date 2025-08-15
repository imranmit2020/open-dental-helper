-- Create lab_providers schema
CREATE SCHEMA IF NOT EXISTS lab_providers;

-- Drop policies that depend on the function we need to update
DROP POLICY IF EXISTS "Lab provider users can view team members" ON public.lab_provider_users;
DROP FUNCTION IF EXISTS public.get_user_lab_provider_account_id(uuid) CASCADE;

-- Move lab provider tables to new schema
ALTER TABLE public.lab_provider_accounts SET SCHEMA lab_providers;
ALTER TABLE public.lab_provider_users SET SCHEMA lab_providers;
ALTER TABLE public.lab_partnerships SET SCHEMA lab_providers;
ALTER TABLE public.lab_order_revisions SET SCHEMA lab_providers;
ALTER TABLE public.lab_quality_control SET SCHEMA lab_providers;
ALTER TABLE public.lab_technician_assignments SET SCHEMA lab_providers;
ALTER TABLE public.lab_order_workflow SET SCHEMA lab_providers;
ALTER TABLE public.lab_communications SET SCHEMA lab_providers;
ALTER TABLE public.lab_order_tracking SET SCHEMA lab_providers;

-- Update foreign key references that point to moved tables
ALTER TABLE public.lab_orders DROP CONSTRAINT IF EXISTS lab_orders_lab_provider_account_id_fkey;
ALTER TABLE public.lab_orders ADD CONSTRAINT lab_orders_lab_provider_account_id_fkey 
  FOREIGN KEY (lab_provider_account_id) REFERENCES lab_providers.lab_provider_accounts(id);

-- Recreate the security definer function with correct schema reference
CREATE OR REPLACE FUNCTION public.get_user_lab_provider_account_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT lab_provider_account_id 
  FROM lab_providers.lab_provider_users 
  WHERE user_id = _user_id 
  LIMIT 1;
$$;

-- Recreate the RLS policy
CREATE POLICY "Lab provider users can view team members" 
ON lab_providers.lab_provider_users 
FOR SELECT 
USING (lab_provider_account_id = public.get_user_lab_provider_account_id(auth.uid()));

-- Grant necessary permissions on the new schema
GRANT USAGE ON SCHEMA lab_providers TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA lab_providers TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA lab_providers TO authenticated;