-- Create lab_providers table
CREATE TABLE public.lab_providers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  specialties TEXT[],
  turnaround_times JSONB DEFAULT '{}',
  pricing_info JSONB DEFAULT '{}',
  api_endpoint TEXT,
  api_key TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_orders table
CREATE TABLE public.lab_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  order_number TEXT NOT NULL,
  patient_id UUID NOT NULL,
  dentist_id UUID NOT NULL,
  lab_provider_id UUID NOT NULL,
  order_type TEXT NOT NULL, -- 'crown', 'bridge', 'denture', 'implant', 'orthodontics'
  case_details JSONB NOT NULL DEFAULT '{}',
  instructions TEXT,
  due_date DATE,
  priority TEXT DEFAULT 'normal', -- 'urgent', 'normal', 'low'
  status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'in_progress', 'completed', 'delivered', 'cancelled'
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  attachments TEXT[],
  tracking_number TEXT,
  shipped_date TIMESTAMP WITH TIME ZONE,
  delivered_date TIMESTAMP WITH TIME ZONE,
  quality_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_order_tracking table for real-time updates
CREATE TABLE public.lab_order_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL,
  status TEXT NOT NULL,
  message TEXT,
  estimated_completion TIMESTAMP WITH TIME ZONE,
  progress_percentage INTEGER DEFAULT 0,
  updated_by TEXT,
  images TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create lab_communications table
CREATE TABLE public.lab_communications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_order_id UUID NOT NULL,
  sender_type TEXT NOT NULL, -- 'dentist', 'lab', 'system'
  sender_id UUID,
  message TEXT NOT NULL,
  attachments TEXT[],
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_order_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_communications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lab_providers
CREATE POLICY "Staff can manage lab providers in tenant" 
ON public.lab_providers 
FOR ALL 
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Create RLS policies for lab_orders
CREATE POLICY "Staff can manage lab orders in tenant" 
ON public.lab_orders 
FOR ALL 
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Create RLS policies for lab_order_tracking
CREATE POLICY "Staff can view lab order tracking in tenant" 
ON public.lab_order_tracking 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.lab_orders lo 
  WHERE lo.id = lab_order_tracking.lab_order_id 
  AND user_belongs_to_tenant(auth.uid(), lo.tenant_id)
));

CREATE POLICY "Staff can insert lab order tracking in tenant" 
ON public.lab_order_tracking 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.lab_orders lo 
  WHERE lo.id = lab_order_tracking.lab_order_id 
  AND user_belongs_to_tenant(auth.uid(), lo.tenant_id)
));

-- Create RLS policies for lab_communications
CREATE POLICY "Staff can manage lab communications in tenant" 
ON public.lab_communications 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.lab_orders lo 
  WHERE lo.id = lab_communications.lab_order_id 
  AND user_belongs_to_tenant(auth.uid(), lo.tenant_id)
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.lab_orders lo 
  WHERE lo.id = lab_communications.lab_order_id 
  AND user_belongs_to_tenant(auth.uid(), lo.tenant_id)
));

-- Create foreign key constraints
ALTER TABLE public.lab_orders 
ADD CONSTRAINT fk_lab_orders_lab_provider 
FOREIGN KEY (lab_provider_id) REFERENCES public.lab_providers(id);

ALTER TABLE public.lab_order_tracking 
ADD CONSTRAINT fk_lab_order_tracking_lab_order 
FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id) ON DELETE CASCADE;

ALTER TABLE public.lab_communications 
ADD CONSTRAINT fk_lab_communications_lab_order 
FOREIGN KEY (lab_order_id) REFERENCES public.lab_orders(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX idx_lab_orders_tenant_id ON public.lab_orders(tenant_id);
CREATE INDEX idx_lab_orders_patient_id ON public.lab_orders(patient_id);
CREATE INDEX idx_lab_orders_dentist_id ON public.lab_orders(dentist_id);
CREATE INDEX idx_lab_orders_status ON public.lab_orders(status);
CREATE INDEX idx_lab_order_tracking_lab_order_id ON public.lab_order_tracking(lab_order_id);
CREATE INDEX idx_lab_communications_lab_order_id ON public.lab_communications(lab_order_id);

-- Create updated_at triggers
CREATE TRIGGER update_lab_providers_updated_at
  BEFORE UPDATE ON public.lab_providers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lab_orders_updated_at
  BEFORE UPDATE ON public.lab_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for live tracking
ALTER TABLE public.lab_order_tracking REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_order_tracking;

ALTER TABLE public.lab_communications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_communications;