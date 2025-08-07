-- First add tenant_id column to patients table if it doesn't exist
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES public.tenants(id);

-- Add unique constraint to prevent duplicate patients per clinic
ALTER TABLE public.patients 
ADD CONSTRAINT unique_patient_per_clinic 
UNIQUE (tenant_id, first_name, last_name, date_of_birth);

-- Add helpful comment
COMMENT ON CONSTRAINT unique_patient_per_clinic ON public.patients 
IS 'Ensures no duplicate patients exist within the same clinic based on name and date of birth';