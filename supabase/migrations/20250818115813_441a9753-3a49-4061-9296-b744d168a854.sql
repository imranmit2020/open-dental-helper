-- Create insurance_plans table for accepted insurance providers
CREATE TABLE public.insurance_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  provider_name TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'PPO',
  coverage_percentage NUMERIC(5,2) DEFAULT 0,
  annual_maximum NUMERIC(10,2) DEFAULT 0,
  deductible NUMERIC(10,2) DEFAULT 0,
  waiting_period_months INTEGER DEFAULT 0,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment_methods table for accepted payment options
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  method_name TEXT NOT NULL,
  method_type TEXT NOT NULL DEFAULT 'card',
  is_active BOOLEAN NOT NULL DEFAULT true,
  processing_fee_percentage NUMERIC(5,2) DEFAULT 0,
  minimum_amount NUMERIC(10,2) DEFAULT 0,
  maximum_amount NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

-- Create policies for insurance_plans
CREATE POLICY "Staff can manage insurance plans in tenant" 
ON public.insurance_plans 
FOR ALL 
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Create policies for payment_methods
CREATE POLICY "Staff can manage payment methods in tenant" 
ON public.payment_methods 
FOR ALL 
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Create updated_at triggers
CREATE TRIGGER update_insurance_plans_updated_at
BEFORE UPDATE ON public.insurance_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_methods_updated_at
BEFORE UPDATE ON public.payment_methods
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default payment methods including cash
INSERT INTO public.payment_methods (tenant_id, method_name, method_type, processing_fee_percentage, minimum_amount, notes) VALUES
((SELECT id FROM public.tenants LIMIT 1), 'Cash', 'cash', 0, 0, 'Cash payments - no processing fees'),
((SELECT id FROM public.tenants LIMIT 1), 'Credit Card', 'card', 2.9, 1, 'Visa, MasterCard, American Express'),
((SELECT id FROM public.tenants LIMIT 1), 'Debit Card', 'card', 1.5, 1, 'Bank debit cards'),
((SELECT id FROM public.tenants LIMIT 1), 'Check', 'check', 0, 0, 'Personal and business checks'),
((SELECT id FROM public.tenants LIMIT 1), 'Bank Transfer', 'transfer', 0, 50, 'ACH bank transfers'),
((SELECT id FROM public.tenants LIMIT 1), 'Payment Plan', 'financing', 0, 100, 'In-house payment plans');