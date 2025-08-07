-- Update clinic code from main to smdc
UPDATE public.tenants 
SET clinic_code = 'smdc'
WHERE clinic_code = 'main';

-- Drop the existing schema with main prefix and recreate with smdc prefix
DROP SCHEMA IF EXISTS clinic_main CASCADE;

-- Create new schema and tables with smdc prefix
SELECT public.create_tenant_schema(
  (SELECT id FROM public.tenants WHERE clinic_code = 'smdc'),
  'clinic_smdc',
  'smdc'
);