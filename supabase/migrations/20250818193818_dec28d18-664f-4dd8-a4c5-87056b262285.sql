-- Create API integrations table
CREATE TABLE public.api_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  name TEXT NOT NULL,
  provider TEXT NOT NULL, -- 'calendly', 'google_calendar', 'outlook', 'custom', etc.
  integration_type TEXT NOT NULL, -- 'calendar', 'erp', 'crm', 'inventory', 'webhook'
  status TEXT NOT NULL DEFAULT 'inactive', -- 'active', 'inactive', 'error', 'pending'
  config JSONB NOT NULL DEFAULT '{}',
  credentials_encrypted TEXT, -- encrypted API keys/tokens
  webhook_url TEXT,
  webhook_secret TEXT,
  sync_frequency TEXT DEFAULT 'hourly', -- 'real_time', 'hourly', 'daily', 'manual'
  last_sync_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API keys table for exposing our APIs
CREATE TABLE public.api_keys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID,
  corporation_id UUID,
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL, -- First 8 chars of the key for display
  key_hash TEXT NOT NULL, -- Hashed full key
  permissions JSONB NOT NULL DEFAULT '[]', -- ['appointments:read', 'appointments:write', 'patients:read', etc.]
  rate_limit INTEGER DEFAULT 1000, -- requests per hour
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create API usage logs table
CREATE TABLE public.api_usage_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE CASCADE,
  tenant_id UUID,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time_ms INTEGER,
  user_agent TEXT,
  ip_address TEXT,
  request_size INTEGER,
  response_size INTEGER,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create webhook events table
CREATE TABLE public.webhook_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'appointment.created', 'appointment.updated', 'patient.created', etc.
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  next_attempt_at TIMESTAMP WITH TIME ZONE,
  response_status_code INTEGER,
  response_body TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sync logs table
CREATE TABLE public.sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  integration_id UUID REFERENCES public.api_integrations(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'import', 'export', 'bidirectional'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_success INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSONB,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX idx_api_integrations_tenant_id ON public.api_integrations(tenant_id);
CREATE INDEX idx_api_integrations_corporation_id ON public.api_integrations(corporation_id);
CREATE INDEX idx_api_integrations_status ON public.api_integrations(status);
CREATE INDEX idx_api_keys_tenant_id ON public.api_keys(tenant_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_usage_logs_api_key_id ON public.api_usage_logs(api_key_id);
CREATE INDEX idx_api_usage_logs_created_at ON public.api_usage_logs(created_at);
CREATE INDEX idx_webhook_events_status ON public.webhook_events(status);
CREATE INDEX idx_webhook_events_next_attempt ON public.webhook_events(next_attempt_at) WHERE status = 'pending';

-- Enable RLS
ALTER TABLE public.api_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for api_integrations
CREATE POLICY "Tenant integrations access" ON public.api_integrations FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- RLS Policies for api_keys
CREATE POLICY "Tenant API keys access" ON public.api_keys FOR ALL 
USING (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
)
WITH CHECK (
  tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), tenant_id) OR
  corporation_id IS NOT NULL AND user_is_corporate_admin(corporation_id, auth.uid()) OR
  is_super_admin(auth.uid())
);

-- RLS Policies for api_usage_logs
CREATE POLICY "API usage logs via parent" ON public.api_usage_logs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.api_keys ak 
    WHERE ak.id = api_usage_logs.api_key_id AND (
      ak.tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), ak.tenant_id) OR
      ak.corporation_id IS NOT NULL AND user_is_corporate_admin(ak.corporation_id, auth.uid()) OR
      is_super_admin(auth.uid())
    )
  )
);

-- RLS Policies for webhook_events
CREATE POLICY "Webhook events via parent" ON public.webhook_events FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.api_integrations ai 
    WHERE ai.id = webhook_events.integration_id AND (
      ai.tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), ai.tenant_id) OR
      ai.corporation_id IS NOT NULL AND user_is_corporate_admin(ai.corporation_id, auth.uid()) OR
      is_super_admin(auth.uid())
    )
  )
);

-- RLS Policies for sync_logs
CREATE POLICY "Sync logs via parent" ON public.sync_logs FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.api_integrations ai 
    WHERE ai.id = sync_logs.integration_id AND (
      ai.tenant_id IS NOT NULL AND user_belongs_to_tenant(auth.uid(), ai.tenant_id) OR
      ai.corporation_id IS NOT NULL AND user_is_corporate_admin(ai.corporation_id, auth.uid()) OR
      is_super_admin(auth.uid())
    )
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_api_integrations_updated_at
  BEFORE UPDATE ON public.api_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON public.api_keys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_webhook_events_updated_at
  BEFORE UPDATE ON public.webhook_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  key_part1 TEXT;
  key_part2 TEXT;
  full_key TEXT;
BEGIN
  -- Generate a secure random key
  key_part1 := encode(gen_random_bytes(16), 'hex');
  key_part2 := encode(gen_random_bytes(16), 'hex');
  full_key := 'pk_' || key_part1 || key_part2;
  
  RETURN full_key;
END;
$$;

-- Function to get integration status summary
CREATE OR REPLACE FUNCTION get_integration_status_summary(_tenant_id UUID DEFAULT NULL, _corporation_id UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB := '{}';
  active_count INTEGER := 0;
  inactive_count INTEGER := 0;
  error_count INTEGER := 0;
  total_api_calls INTEGER := 0;
BEGIN
  -- Count integrations by status
  SELECT 
    COUNT(*) FILTER (WHERE status = 'active'),
    COUNT(*) FILTER (WHERE status = 'inactive'),
    COUNT(*) FILTER (WHERE status = 'error')
  INTO active_count, inactive_count, error_count
  FROM api_integrations 
  WHERE (tenant_id = _tenant_id OR corporation_id = _corporation_id);
  
  -- Count total API calls (last 30 days)
  SELECT COUNT(*)
  INTO total_api_calls
  FROM api_usage_logs aul
  JOIN api_keys ak ON ak.id = aul.api_key_id
  WHERE (ak.tenant_id = _tenant_id OR ak.corporation_id = _corporation_id)
    AND aul.created_at >= CURRENT_DATE - INTERVAL '30 days';
  
  result := jsonb_build_object(
    'active_integrations', active_count,
    'inactive_integrations', inactive_count,
    'error_integrations', error_count,
    'total_api_calls_30d', total_api_calls,
    'generated_at', now()
  );
  
  RETURN result;
END;
$$;