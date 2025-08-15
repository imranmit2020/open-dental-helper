-- Move lab provider authentication tables to lab_providers schema

-- Create lab_provider_sessions table in lab_providers schema for session management
CREATE TABLE lab_providers.lab_provider_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lab_provider_account_id UUID NOT NULL,
  user_id UUID NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lab_provider_sessions
ALTER TABLE lab_providers.lab_provider_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_provider_sessions
CREATE POLICY "Lab users can manage own sessions" 
ON lab_providers.lab_provider_sessions 
FOR ALL 
USING (user_id = auth.uid());

-- Create lab_provider_password_resets table in lab_providers schema
CREATE TABLE lab_providers.lab_provider_password_resets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lab_provider_account_id UUID NOT NULL,
  reset_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lab_provider_password_resets
ALTER TABLE lab_providers.lab_provider_password_resets ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_provider_password_resets
CREATE POLICY "Lab users can view own password resets" 
ON lab_providers.lab_provider_password_resets 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Allow password reset creation" 
ON lab_providers.lab_provider_password_resets 
FOR INSERT 
WITH CHECK (true);

-- Create lab_provider_email_verifications table in lab_providers schema
CREATE TABLE lab_providers.lab_provider_email_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lab_provider_account_id UUID NOT NULL,
  verification_token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lab_provider_email_verifications
ALTER TABLE lab_providers.lab_provider_email_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for lab_provider_email_verifications
CREATE POLICY "Lab users can view own email verifications" 
ON lab_providers.lab_provider_email_verifications 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Allow email verification creation" 
ON lab_providers.lab_provider_email_verifications 
FOR INSERT 
WITH CHECK (true);

-- Add foreign key constraints
ALTER TABLE lab_providers.lab_provider_sessions 
ADD CONSTRAINT fk_lab_provider_sessions_account 
FOREIGN KEY (lab_provider_account_id) REFERENCES lab_providers.lab_provider_accounts(id) ON DELETE CASCADE;

ALTER TABLE lab_providers.lab_provider_password_resets 
ADD CONSTRAINT fk_lab_provider_password_resets_account 
FOREIGN KEY (lab_provider_account_id) REFERENCES lab_providers.lab_provider_accounts(id) ON DELETE CASCADE;

ALTER TABLE lab_providers.lab_provider_email_verifications 
ADD CONSTRAINT fk_lab_provider_email_verifications_account 
FOREIGN KEY (lab_provider_account_id) REFERENCES lab_providers.lab_provider_accounts(id) ON DELETE CASCADE;

-- Create updated_at triggers
CREATE TRIGGER update_lab_provider_sessions_updated_at
BEFORE UPDATE ON lab_providers.lab_provider_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update lab_provider_users table to include authentication fields
ALTER TABLE lab_providers.lab_provider_users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE lab_providers.lab_provider_users ADD COLUMN IF NOT EXISTS login_attempts INTEGER DEFAULT 0;
ALTER TABLE lab_providers.lab_provider_users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;