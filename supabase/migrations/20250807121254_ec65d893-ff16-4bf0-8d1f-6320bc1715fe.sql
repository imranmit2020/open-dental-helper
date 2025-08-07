-- Create multi-tenant architecture with clinic code prefixed tables

-- 1. Create tenants table with clinic_code for table prefixing
CREATE TABLE public.tenants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  clinic_code TEXT NOT NULL UNIQUE, -- Short code for table prefixing
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- 2. Create tenant_users junction table
CREATE TABLE public.tenant_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- Enable RLS on tenant_users table
ALTER TABLE public.tenant_users ENABLE ROW LEVEL SECURITY;

-- 3. Create utility functions for tenant context
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_belongs_to_tenant(_user_id UUID, _tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_users 
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_user_tenant_role(_user_id UUID, _tenant_id UUID)
RETURNS TEXT AS $$
  SELECT role FROM public.tenant_users 
  WHERE user_id = _user_id AND tenant_id = _tenant_id;
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

-- 4. Create function to create tenant-specific schemas with prefixed tables
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

-- 5. Create RLS policies for tenant management
CREATE POLICY "Users can view tenants they belong to" ON public.tenants
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.tenant_users 
    WHERE tenant_id = tenants.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Admin can manage tenant users" ON public.tenant_users
FOR ALL USING (
  public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
);

CREATE POLICY "Users can view their tenant memberships" ON public.tenant_users
FOR SELECT USING (user_id = auth.uid());

-- 6. Create triggers for updated_at
CREATE TRIGGER update_tenants_updated_at
BEFORE UPDATE ON public.tenants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Insert default tenant with clinic code
INSERT INTO public.tenants (name, clinic_code) 
VALUES ('Default Clinic', 'main');

-- 8. Migrate existing admin users to default tenant
INSERT INTO public.tenant_users (tenant_id, user_id, role)
SELECT 
  (SELECT id FROM public.tenants WHERE clinic_code = 'main'),
  user_id,
  'admin'
FROM public.profiles 
WHERE role = 'admin';

-- 9. Create the default tenant schema with prefixed tables
SELECT public.create_tenant_schema(
  (SELECT id FROM public.tenants WHERE clinic_code = 'main'),
  'clinic_main',
  'main'
);