-- Add clinic_code to tenants table for table prefixing
ALTER TABLE public.tenants 
ADD COLUMN clinic_code TEXT;

-- Update existing tenant with a default clinic code
UPDATE public.tenants 
SET clinic_code = 'main' 
WHERE clinic_code IS NULL;

-- Make clinic_code required for future tenants
ALTER TABLE public.tenants 
ALTER COLUMN clinic_code SET NOT NULL;

-- Add unique constraint to ensure clinic codes are unique
ALTER TABLE public.tenants 
ADD CONSTRAINT tenants_clinic_code_unique UNIQUE (clinic_code);

-- Drop and recreate the create_tenant_schema function with prefixed table names
DROP FUNCTION IF EXISTS public.create_tenant_schema(uuid, text);

CREATE OR REPLACE FUNCTION public.create_tenant_schema(
  tenant_id_param UUID,
  schema_name_param TEXT,
  clinic_code_param TEXT
)
RETURNS VOID AS $$
DECLARE
  table_prefix TEXT;
BEGIN
  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name_param);
  
  -- Set table prefix from clinic code (ensure it's safe for table names)
  table_prefix := lower(regexp_replace(clinic_code_param, '[^a-zA-Z0-9]', '', 'g')) || '_';
  
  -- Create patients table with clinic prefix
  EXECUTE format('
    CREATE TABLE %I.%I (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL DEFAULT %L,
      user_id UUID,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      date_of_birth DATE,
      gender TEXT,
      address TEXT,
      emergency_contact TEXT,
      insurance_info JSONB,
      last_visit DATE,
      risk_level TEXT DEFAULT ''low'',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    )', schema_name_param, table_prefix || 'patients', tenant_id_param);
  
  -- Create appointments table with clinic prefix
  EXECUTE format('
    CREATE TABLE %I.%I (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL DEFAULT %L,
      patient_id UUID NOT NULL,
      dentist_id UUID,
      title TEXT NOT NULL,
      description TEXT,
      appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
      duration INTEGER DEFAULT 60,
      status TEXT DEFAULT ''scheduled'',
      treatment_type TEXT,
      notes TEXT,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    )', schema_name_param, table_prefix || 'appointments', tenant_id_param);
  
  -- Create medical_records table with clinic prefix
  EXECUTE format('
    CREATE TABLE %I.%I (
      id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
      tenant_id UUID NOT NULL DEFAULT %L,
      patient_id UUID NOT NULL,
      dentist_id UUID,
      record_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      diagnosis TEXT,
      treatment TEXT,
      visit_date DATE,
      follow_up_date DATE,
      attachments TEXT[],
      status TEXT DEFAULT ''active'',
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
    )', schema_name_param, table_prefix || 'medical_records', tenant_id_param);
  
  -- Enable RLS on all tables
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name_param, table_prefix || 'patients');
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name_param, table_prefix || 'appointments');
  EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', schema_name_param, table_prefix || 'medical_records');
  
  -- Create RLS policies for patients table
  EXECUTE format('
    CREATE POLICY "tenant_isolation_policy" ON %I.%I
    FOR ALL USING (tenant_id = %L AND public.user_belongs_to_tenant(auth.uid(), %L))',
    schema_name_param, table_prefix || 'patients', tenant_id_param, tenant_id_param);
  
  -- Create RLS policies for appointments table
  EXECUTE format('
    CREATE POLICY "tenant_isolation_policy" ON %I.%I
    FOR ALL USING (tenant_id = %L AND public.user_belongs_to_tenant(auth.uid(), %L))',
    schema_name_param, table_prefix || 'appointments', tenant_id_param, tenant_id_param);
  
  -- Create RLS policies for medical_records table
  EXECUTE format('
    CREATE POLICY "tenant_isolation_policy" ON %I.%I
    FOR ALL USING (tenant_id = %L AND public.user_belongs_to_tenant(auth.uid(), %L))',
    schema_name_param, table_prefix || 'medical_records', tenant_id_param, tenant_id_param);
  
  -- Create updated_at triggers
  EXECUTE format('
    CREATE TRIGGER update_%I_updated_at
    BEFORE UPDATE ON %I.%I
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()',
    table_prefix || 'patients', schema_name_param, table_prefix || 'patients');
    
  EXECUTE format('
    CREATE TRIGGER update_%I_updated_at
    BEFORE UPDATE ON %I.%I
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()',
    table_prefix || 'appointments', schema_name_param, table_prefix || 'appointments');
    
  EXECUTE format('
    CREATE TRIGGER update_%I_updated_at
    BEFORE UPDATE ON %I.%I
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column()',
    table_prefix || 'medical_records', schema_name_param, table_prefix || 'medical_records');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the default tenant schema with the new prefixed structure
SELECT public.create_tenant_schema(
  (SELECT id FROM public.tenants WHERE name = 'Default Clinic'),
  'clinic_main',
  'main'
);