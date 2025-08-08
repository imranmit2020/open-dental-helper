-- Fix dentist_availability: add missing foreign keys so PostgREST relationships work
-- Drop existing constraints if present to avoid conflicts
ALTER TABLE public.dentist_availability
  DROP CONSTRAINT IF EXISTS dentist_availability_dentist_id_fkey,
  DROP CONSTRAINT IF EXISTS dentist_availability_tenant_id_fkey;

-- Add FKs to profiles(user_id) and tenants(id) with specific names expected by the client queries
ALTER TABLE public.dentist_availability
  ADD CONSTRAINT dentist_availability_dentist_id_fkey
  FOREIGN KEY (dentist_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  ADD CONSTRAINT dentist_availability_tenant_id_fkey
  FOREIGN KEY (tenant_id) REFERENCES public.tenants(id) ON DELETE CASCADE;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_dentist_availability_tenant ON public.dentist_availability(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dentist_availability_dentist ON public.dentist_availability(dentist_id);
CREATE INDEX IF NOT EXISTS idx_dentist_availability_dow ON public.dentist_availability(day_of_week);

-- Ensure updated_at trigger exists
DROP TRIGGER IF EXISTS update_dentist_availability_updated_at ON public.dentist_availability;
CREATE TRIGGER update_dentist_availability_updated_at
BEFORE UPDATE ON public.dentist_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();