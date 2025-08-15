-- Add education and experience fields to employees table
ALTER TABLE public.employees 
ADD COLUMN education JSONB DEFAULT '[]'::jsonb,
ADD COLUMN experience JSONB DEFAULT '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN public.employees.education IS 'Array of education entries with degree, institution, year, etc.';
COMMENT ON COLUMN public.employees.experience IS 'Array of work experience entries with position, company, dates, etc.';