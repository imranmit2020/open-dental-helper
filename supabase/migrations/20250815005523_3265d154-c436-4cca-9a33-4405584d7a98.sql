-- Add missing RLS policies for the new lab tables
CREATE POLICY "Lab providers can manage order revisions" 
ON public.lab_order_revisions 
FOR ALL 
USING (lab_order_id IN (
  SELECT lo.id FROM public.lab_orders lo
  JOIN public.lab_partnerships lp ON lp.lab_provider_account_id = lo.lab_provider_id
  WHERE lp.lab_provider_account_id IN (
    SELECT lab_provider_account_id FROM public.lab_provider_users 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Lab providers can manage technician assignments" 
ON public.lab_technician_assignments 
FOR ALL 
USING (lab_order_id IN (
  SELECT lo.id FROM public.lab_orders lo
  JOIN public.lab_partnerships lp ON lp.lab_provider_account_id = lo.lab_provider_id
  WHERE lp.lab_provider_account_id IN (
    SELECT lab_provider_account_id FROM public.lab_provider_users 
    WHERE user_id = auth.uid()
  )
));

CREATE POLICY "Lab providers can manage quality control" 
ON public.lab_quality_control 
FOR ALL 
USING (lab_order_id IN (
  SELECT lo.id FROM public.lab_orders lo
  JOIN public.lab_partnerships lp ON lp.lab_provider_account_id = lo.lab_provider_id
  WHERE lp.lab_provider_account_id IN (
    SELECT lab_provider_account_id FROM public.lab_provider_users 
    WHERE user_id = auth.uid()
  )
));

-- Allow dental offices to view limited lab provider data
CREATE POLICY "Dental offices can view partner lab accounts" 
ON public.lab_provider_accounts 
FOR SELECT 
USING (id IN (
  SELECT lab_provider_account_id FROM public.lab_partnerships 
  WHERE dental_office_tenant_id IN (
    SELECT tenant_id FROM public.tenant_users 
    WHERE user_id = auth.uid()
  )
));

-- Update lab_orders table to link with lab_provider_accounts
ALTER TABLE public.lab_orders 
ADD COLUMN lab_provider_account_id UUID;

-- Add foreign key constraint
ALTER TABLE public.lab_orders 
ADD CONSTRAINT fk_lab_orders_lab_provider_account 
FOREIGN KEY (lab_provider_account_id) REFERENCES public.lab_provider_accounts(id);

-- Insert sample lab provider accounts
INSERT INTO public.lab_provider_accounts (
  company_name, contact_person, email, phone, address, 
  specialties, status, onboarding_completed, verification_status
) VALUES
(
  'Premium Dental Lab Solutions', 
  'Dr. Sarah Johnson', 
  'orders@premiumdentallab.com', 
  '(555) 123-4567',
  '123 Lab Street, Dental City, DC 12345',
  ARRAY['crown', 'bridge', 'denture', 'implant'],
  'active',
  true,
  'verified'
),
(
  'Express Orthodontics Lab', 
  'Mark Wilson', 
  'info@expressortho.com', 
  '(555) 987-6543',
  '456 Ortho Avenue, Dental City, DC 12345',
  ARRAY['orthodontics', 'implant', 'retainers'],
  'active',
  true,
  'verified'
),
(
  'Precision Ceramics Lab', 
  'Lisa Chen', 
  'support@precisionceramics.com', 
  '(555) 456-7890',
  '789 Ceramic Blvd, Dental City, DC 12345',
  ARRAY['crown', 'veneer', 'inlay'],
  'active',
  true,
  'verified'
);

-- Create partnerships between existing tenant and lab providers
INSERT INTO public.lab_partnerships (
  dental_office_tenant_id, 
  lab_provider_account_id,
  partnership_type,
  status
) 
SELECT 
  '22222222-2222-2222-2222-222222222222',
  id,
  'preferred',
  'active'
FROM public.lab_provider_accounts;