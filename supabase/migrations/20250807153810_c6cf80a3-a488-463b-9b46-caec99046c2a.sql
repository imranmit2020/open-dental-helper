-- Add unique constraint to prevent duplicate patients per clinic
ALTER TABLE public.patients 
ADD CONSTRAINT unique_patient_per_clinic 
UNIQUE (tenant_id, first_name, last_name, date_of_birth);

-- Add helpful comment
COMMENT ON CONSTRAINT unique_patient_per_clinic ON public.patients 
IS 'Ensures no duplicate patients exist within the same clinic based on name and date of birth';