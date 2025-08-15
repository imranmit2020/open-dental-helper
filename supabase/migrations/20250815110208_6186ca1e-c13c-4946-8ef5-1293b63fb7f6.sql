-- Create professional profiles table for dentists and hygienists
CREATE TABLE public.professional_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID,
  license_number TEXT,
  license_state TEXT,
  license_expiry DATE,
  specializations TEXT[],
  education JSONB DEFAULT '[]'::jsonb,
  experience JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  continuing_education JSONB DEFAULT '[]'::jsonb,
  professional_memberships JSONB DEFAULT '[]'::jsonb,
  languages_spoken TEXT[],
  bio TEXT,
  practice_philosophy TEXT,
  achievements JSONB DEFAULT '[]'::jsonb,
  skills_expertise JSONB DEFAULT '[]'::jsonb,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own professional profile" 
ON public.professional_profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own professional profile" 
ON public.professional_profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own professional profile" 
ON public.professional_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Staff can view professional profiles in tenant" 
ON public.professional_profiles 
FOR SELECT 
USING (
  tenant_id IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM tenant_users tu 
    WHERE tu.user_id = auth.uid() 
    AND tu.tenant_id = professional_profiles.tenant_id
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_professional_profiles_updated_at
BEFORE UPDATE ON public.professional_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();