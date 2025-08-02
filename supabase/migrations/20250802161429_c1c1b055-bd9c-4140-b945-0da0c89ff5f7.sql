-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, email)
  VALUES (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.email
  );
  RETURN new;
END;
$$;

-- Update audit logging function with proper search_path
CREATE OR REPLACE FUNCTION public.log_patient_access()
RETURNS TRIGGER 
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