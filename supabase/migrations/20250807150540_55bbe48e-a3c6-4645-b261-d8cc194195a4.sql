-- Create dentist availability table for multi-clinic scheduling
CREATE TABLE public.dentist_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentist_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_start_time TIME,
  break_end_time TIME,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique availability per dentist per day per clinic
  UNIQUE(dentist_id, tenant_id, day_of_week)
);

-- Enable RLS
ALTER TABLE public.dentist_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Staff can manage dentist availability"
ON public.dentist_availability
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
  )
);

-- Create function to get dentist availability for a specific date and clinic
CREATE OR REPLACE FUNCTION public.get_dentist_availability_for_date(
  _dentist_id UUID,
  _tenant_id UUID,
  _date DATE
)
RETURNS TABLE (
  is_available BOOLEAN,
  start_time TIME,
  end_time TIME,
  break_start_time TIME,
  break_end_time TIME
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    da.is_available,
    da.start_time,
    da.end_time,
    da.break_start_time,
    da.break_end_time
  FROM public.dentist_availability da
  WHERE da.dentist_id = _dentist_id
    AND da.tenant_id = _tenant_id
    AND da.day_of_week = EXTRACT(DOW FROM _date)::INTEGER;
$$;

-- Create updated_at trigger
CREATE TRIGGER update_dentist_availability_updated_at
BEFORE UPDATE ON public.dentist_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add tenant_id to appointments table if not exists (for multi-clinic support)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'appointments' 
    AND column_name = 'tenant_id'
  ) THEN
    ALTER TABLE public.appointments ADD COLUMN tenant_id UUID;
    
    -- Add foreign key constraint
    ALTER TABLE public.appointments 
    ADD CONSTRAINT appointments_tenant_id_fkey 
    FOREIGN KEY (tenant_id) REFERENCES public.tenants(id);
  END IF;
END $$;