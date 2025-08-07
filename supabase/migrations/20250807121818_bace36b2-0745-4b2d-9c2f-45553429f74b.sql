-- Add clinic information fields to tenants table
ALTER TABLE public.tenants 
ADD COLUMN address TEXT,
ADD COLUMN phone TEXT,
ADD COLUMN email TEXT;

-- Update the existing default clinic with sample data
UPDATE public.tenants 
SET 
  address = '123 Main Street, Healthcare District',
  phone = '+1 (555) 123-4567',
  email = 'info@defaultclinic.com'
WHERE clinic_code = 'main';