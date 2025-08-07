-- Fix security warnings by adding proper search paths to functions

-- Update get_current_tenant_id function
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '';

-- Update user_belongs_to_tenant function
CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_users 
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '';

-- Update get_user_tenant_role function
CREATE OR REPLACE FUNCTION public.get_user_tenant_role(_user_id UUID, _tenant_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.tenant_users 
  WHERE user_id = _user_id AND tenant_id = _tenant_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = '';

-- Update create_tenant_schema function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Update the log_patient_access function
CREATE OR REPLACE FUNCTION public.log_patient_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Log patient record access
  IF TG_OP = 'SELECT' THEN
    INSERT INTO public.audit_logs (
      user_id, action, resource_type, resource_id, patient_id, details
    ) VALUES (
      auth.uid(), 
      'VIEW', 
      TG_TABLE_NAME, 
      NEW.id, 
      CASE 
        WHEN TG_TABLE_NAME = 'patients' THEN NEW.id
        ELSE NEW.patient_id
      END,
      jsonb_build_object('timestamp', now())
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;