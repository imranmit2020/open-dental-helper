-- Create audit logs table for HIPAA compliance
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  patient_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Staff can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_patient_id ON public.audit_logs(patient_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);

-- Create function to automatically log certain actions
CREATE OR REPLACE FUNCTION public.log_patient_access()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;