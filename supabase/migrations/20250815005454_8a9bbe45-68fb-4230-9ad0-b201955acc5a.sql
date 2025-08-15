-- Create lab_provider_accounts table for lab provider multi-tenancy
CREATE TABLE public.lab_provider_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  registration_number TEXT,
  contact_person TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  website TEXT,
  specialties TEXT[],
  certifications TEXT[],
  operating_hours JSONB DEFAULT '{}',
  pricing_structure JSONB DEFAULT '{}',
  capacity_info JSONB DEFAULT '{}',
  quality_standards TEXT[],
  equipment_list TEXT[],
  turnaround_guarantees JSONB DEFAULT '{}',
  subscription_plan TEXT DEFAULT 'basic',
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended'
  onboarding_completed BOOLEAN DEFAULT false,
  verification_status TEXT DEFAULT 'unverified', -- 'unverified', 'pending', 'verified'
  verification_documents TEXT[],
  logo_url TEXT,
  banner_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_provider_users table for lab provider staff
CREATE TABLE public.lab_provider_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_provider_account_id UUID NOT NULL,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'technician', -- 'admin', 'manager', 'technician', 'quality_control'
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_partnerships table for connecting dental offices with lab providers
CREATE TABLE public.lab_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dental_office_tenant_id UUID NOT NULL,
  lab_provider_account_id UUID NOT NULL,
  partnership_type TEXT DEFAULT 'standard', -- 'preferred', 'standard', 'trial'
  status TEXT DEFAULT 'active', -- 'active', 'suspended', 'terminated'
  contract_terms JSONB DEFAULT '{}',
  pricing_agreement JSONB DEFAULT '{}',
  communication_preferences JSONB DEFAULT '{}',
  performance_metrics JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(dental_office_tenant_id, lab_provider_account_id)
);

-- Create lab_order_workflow table for tracking order stages
CREATE TABLE public.lab_order_workflow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL,
  stage TEXT NOT NULL, -- 'received', 'review', 'design', 'production', 'quality_check', 'finishing', 'ready', 'shipped'
  status TEXT NOT NULL, -- 'pending', 'in_progress', 'completed', 'on_hold', 'revision_needed'
  assigned_technician_id UUID,
  estimated_duration_hours INTEGER,
  actual_start_time TIMESTAMP WITH TIME ZONE,
  actual_end_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  quality_scores JSONB DEFAULT '{}',
  attachments TEXT[],
  revision_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_order_revisions table for managing revisions
CREATE TABLE public.lab_order_revisions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL,
  revision_number INTEGER NOT NULL,
  requested_by TEXT NOT NULL, -- 'dental_office', 'lab_provider', 'quality_control'
  revision_type TEXT NOT NULL, -- 'design_change', 'fit_adjustment', 'color_correction', 'material_change'
  description TEXT NOT NULL,
  urgency TEXT DEFAULT 'normal', -- 'urgent', 'normal', 'low'
  before_images TEXT[],
  after_images TEXT[],
  estimated_additional_time_hours INTEGER,
  additional_cost NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'in_progress', 'completed', 'rejected'
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_technician_assignments table
CREATE TABLE public.lab_technician_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL,
  technician_user_id UUID NOT NULL,
  assignment_type TEXT NOT NULL, -- 'primary', 'assistant', 'quality_reviewer'
  specialization TEXT, -- 'ceramic', 'metal', 'orthodontics', 'implants'
  workload_percentage INTEGER DEFAULT 100,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  estimated_completion TIMESTAMP WITH TIME ZONE,
  actual_completion TIMESTAMP WITH TIME ZONE,
  performance_rating INTEGER, -- 1-5 stars
  notes TEXT
);

-- Create lab_quality_control table
CREATE TABLE public.lab_quality_control (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL,
  inspector_user_id UUID NOT NULL,
  inspection_stage TEXT NOT NULL, -- 'initial', 'mid_production', 'final', 'pre_shipment'
  quality_parameters JSONB NOT NULL, -- fit, color match, finish quality, etc.
  overall_score INTEGER, -- 1-100
  pass_status BOOLEAN,
  defects_found TEXT[],
  improvement_suggestions TEXT,
  inspection_images TEXT[],
  reinspection_required BOOLEAN DEFAULT false,
  certified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key constraints
ALTER TABLE public.lab_provider_users 
ADD CONSTRAINT fk_lab_provider_users_account 
FOREIGN KEY (lab_provider_account_id) REFERENCES public.lab_provider_accounts(id) ON DELETE CASCADE;

ALTER TABLE public.lab_partnerships 
ADD CONSTRAINT fk_lab_partnerships_lab_provider 
FOREIGN KEY (lab_provider_account_id) REFERENCES public.lab_provider_accounts(id);

ALTER TABLE public.lab_order_workflow 
ADD CONSTRAINT fk_lab_order_workflow_order 
FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id) ON DELETE CASCADE;

ALTER TABLE public.lab_order_revisions 
ADD CONSTRAINT fk_lab_order_revisions_order 
FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id) ON DELETE CASCADE;

ALTER TABLE public.lab_technician_assignments 
ADD CONSTRAINT fk_lab_technician_assignments_order 
FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id) ON DELETE CASCADE;

ALTER TABLE public.lab_quality_control 
ADD CONSTRAINT fk_lab_quality_control_order 
FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.lab_provider_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_provider_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_technician_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_quality_control ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lab_provider_accounts
CREATE POLICY "Lab providers can view own account" 
ON public.lab_provider_accounts 
FOR SELECT 
USING (id IN (
  SELECT lab_provider_account_id FROM public.lab_provider_users 
  WHERE user_id = auth.uid()
));

CREATE POLICY "Lab providers can update own account" 
ON public.lab_provider_accounts 
FOR UPDATE 
USING (id IN (
  SELECT lab_provider_account_id FROM public.lab_provider_users 
  WHERE user_id = auth.uid() AND role IN ('admin', 'manager')
));

-- Create RLS policies for lab_provider_users
CREATE POLICY "Lab provider users can view team members" 
ON public.lab_provider_users 
FOR SELECT 
USING (lab_provider_account_id IN (
  SELECT lab_provider_account_id FROM public.lab_provider_users 
  WHERE user_id = auth.uid()
));

-- Create RLS policies for lab_partnerships
CREATE POLICY "Dental offices can view their partnerships" 
ON public.lab_partnerships 
FOR SELECT 
USING (user_belongs_to_tenant(auth.uid(), dental_office_tenant_id));

CREATE POLICY "Lab providers can view their partnerships" 
ON public.lab_partnerships 
FOR SELECT 
USING (lab_provider_account_id IN (
  SELECT lab_provider_account_id FROM public.lab_provider_users 
  WHERE user_id = auth.uid()
));

-- Create RLS policies for lab_order_workflow
CREATE POLICY "Lab providers can manage order workflow" 
ON public.lab_order_workflow 
FOR ALL 
USING (lab_order_id IN (
  SELECT lo.id FROM public.lab_orders lo
  JOIN public.lab_partnerships lp ON lp.lab_provider_account_id = (
    SELECT lpa.id FROM public.lab_provider_accounts lpa
    WHERE lpa.id = lo.lab_provider_id
  )
  WHERE lp.lab_provider_account_id IN (
    SELECT lab_provider_account_id FROM public.lab_provider_users 
    WHERE user_id = auth.uid()
  )
));

-- Create indexes for performance
CREATE INDEX idx_lab_provider_users_account_id ON public.lab_provider_users(lab_provider_account_id);
CREATE INDEX idx_lab_provider_users_user_id ON public.lab_provider_users(user_id);
CREATE INDEX idx_lab_partnerships_dental_office ON public.lab_partnerships(dental_office_tenant_id);
CREATE INDEX idx_lab_partnerships_lab_provider ON public.lab_partnerships(lab_provider_account_id);
CREATE INDEX idx_lab_order_workflow_order_id ON public.lab_order_workflow(lab_order_id);
CREATE INDEX idx_lab_order_workflow_stage ON public.lab_order_workflow(stage);
CREATE INDEX idx_lab_technician_assignments_order_id ON public.lab_technician_assignments(lab_order_id);
CREATE INDEX idx_lab_technician_assignments_technician ON public.lab_technician_assignments(technician_user_id);

-- Create updated_at triggers
CREATE TRIGGER update_lab_provider_accounts_updated_at
  BEFORE UPDATE ON public.lab_provider_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_provider_users_updated_at
  BEFORE UPDATE ON public.lab_provider_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_partnerships_updated_at
  BEFORE UPDATE ON public.lab_partnerships
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for lab provider features
ALTER TABLE public.lab_order_workflow REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_order_workflow;

ALTER TABLE public.lab_order_revisions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_order_revisions;