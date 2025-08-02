-- Create table for tracking failed login attempts
CREATE TABLE public.failed_login_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  attempted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.failed_login_attempts ENABLE ROW LEVEL SECURITY;

-- Admin can view all failed login attempts
CREATE POLICY "Admin can view failed login attempts" 
ON public.failed_login_attempts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Allow inserting failed login attempts (for tracking)
CREATE POLICY "Allow inserting failed login attempts" 
ON public.failed_login_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_failed_login_attempts_email ON public.failed_login_attempts(email);
CREATE INDEX idx_failed_login_attempts_created_at ON public.failed_login_attempts(created_at);