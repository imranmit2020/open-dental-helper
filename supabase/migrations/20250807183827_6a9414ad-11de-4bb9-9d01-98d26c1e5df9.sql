-- Create user approval requests table
CREATE TABLE public.user_approval_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  requested_role TEXT NOT NULL DEFAULT 'staff',
  organization_type TEXT NOT NULL CHECK (organization_type IN ('corporation', 'clinic')),
  organization_id UUID,
  organization_name TEXT NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_approval_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for user approval requests
CREATE POLICY "Users can view their own approval requests"
ON public.user_approval_requests FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all approval requests"
ON public.user_approval_requests FOR SELECT
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Only system can insert approval requests"
ON public.user_approval_requests FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update approval requests"
ON public.user_approval_requests FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin');

-- Create function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE user_id = _user_id),
    (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = _user_id),
    'user'
  );
$$;

-- Create trigger for new user signups to create approval request
CREATE OR REPLACE FUNCTION public.handle_new_user_approval()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create approval request if user is not already approved
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.user_approval_requests (
      user_id,
      email,
      first_name,
      last_name,
      requested_role,
      organization_type,
      organization_name,
      phone
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
      COALESCE(NEW.raw_user_meta_data->>'organization_type', 'clinic'),
      COALESCE(NEW.raw_user_meta_data->>'organization_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'phone', '')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger on auth.users for new signups
CREATE TRIGGER on_auth_user_created_approval
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_approval();

-- Update the existing handle_new_user function to only create profile if approved
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only create profile if user has an approved request or is admin
  IF EXISTS (
    SELECT 1 FROM public.user_approval_requests 
    WHERE user_id = NEW.id AND status = 'approved'
  ) OR COALESCE(NEW.raw_user_meta_data->>'role', '') = 'admin' THEN
    INSERT INTO public.profiles (user_id, first_name, last_name, email, role)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data ->> 'first_name',
      NEW.raw_user_meta_data ->> 'last_name',
      NEW.email,
      COALESCE(NEW.raw_user_meta_data ->> 'role', 'staff')
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_user_approval_requests_updated_at
  BEFORE UPDATE ON public.user_approval_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();