-- Create corporations table
CREATE TABLE public.corporations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  corporate_code TEXT NOT NULL UNIQUE,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on corporations table
ALTER TABLE public.corporations ENABLE ROW LEVEL SECURITY;

-- Add corporation_id to tenants table
ALTER TABLE public.tenants 
ADD COLUMN corporation_id UUID REFERENCES public.corporations(id);

-- Create corporate users table for user-corporation relationships
CREATE TABLE public.corporate_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  corporation_id UUID NOT NULL REFERENCES public.corporations(id),
  role TEXT NOT NULL DEFAULT 'staff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, corporation_id)
);

-- Enable RLS on corporate_users table
ALTER TABLE public.corporate_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for corporations
CREATE POLICY "Users can view corporations they belong to" 
ON public.corporations 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.corporate_users 
  WHERE corporate_users.corporation_id = corporations.id 
  AND corporate_users.user_id = auth.uid()
));

-- Create RLS policies for corporate_users
CREATE POLICY "Users can view their corporate memberships" 
ON public.corporate_users 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Corporate admins can manage corporate users" 
ON public.corporate_users 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.corporate_users cu 
  WHERE cu.corporation_id = corporate_users.corporation_id 
  AND cu.user_id = auth.uid() 
  AND cu.role = 'admin'
));

-- Create updated_at trigger for corporations
CREATE TRIGGER update_corporations_updated_at
BEFORE UPDATE ON public.corporations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update existing tenants to have a default corporation (optional - can be set manually)
-- INSERT INTO public.corporations (name, corporate_code) VALUES ('Default Corporation', 'default');
-- UPDATE public.tenants SET corporation_id = (SELECT id FROM public.corporations WHERE corporate_code = 'default');