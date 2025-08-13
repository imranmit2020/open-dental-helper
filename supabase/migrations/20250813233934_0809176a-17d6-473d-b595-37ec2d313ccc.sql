-- Create time tracking table for employees
CREATE TABLE public.time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('clock_in', 'clock_out', 'break_start', 'break_end')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  location_data JSONB NULL, -- {latitude, longitude, address, accuracy}
  biometric_data JSONB NULL, -- {confidence_score, face_match_id, verification_method}
  device_info JSONB NULL, -- {device_id, ip_address, user_agent, browser}
  notes TEXT NULL,
  verification_status TEXT NOT NULL DEFAULT 'verified' CHECK (verification_status IN ('verified', 'flagged', 'manual_review')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for time tracking
CREATE POLICY "Staff can view time tracking in tenant" 
ON public.time_tracking 
FOR SELECT 
USING (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Staff can insert time tracking in tenant" 
ON public.time_tracking 
FOR INSERT 
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Staff can update time tracking in tenant" 
ON public.time_tracking 
FOR UPDATE 
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Create daily work sessions table for tracking complete work days
CREATE TABLE public.work_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  date DATE NOT NULL,
  clock_in_time TIMESTAMP WITH TIME ZONE NULL,
  clock_out_time TIMESTAMP WITH TIME ZONE NULL,
  total_hours NUMERIC(4,2) NULL,
  break_duration NUMERIC(4,2) DEFAULT 0,
  overtime_hours NUMERIC(4,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'incomplete')),
  ai_insights JSONB NULL, -- AI-generated insights about patterns, productivity
  anomalies JSONB NULL, -- Detected anomalies or flags
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, tenant_id, date)
);

-- Enable RLS
ALTER TABLE public.work_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for work sessions
CREATE POLICY "Staff can view work sessions in tenant" 
ON public.work_sessions 
FOR SELECT 
USING (user_belongs_to_tenant(auth.uid(), tenant_id));

CREATE POLICY "Staff can manage work sessions in tenant" 
ON public.work_sessions 
FOR ALL 
USING (user_belongs_to_tenant(auth.uid(), tenant_id))
WITH CHECK (user_belongs_to_tenant(auth.uid(), tenant_id));

-- Create indexes for performance (avoiding date() function)
CREATE INDEX idx_time_tracking_employee_tenant ON public.time_tracking(employee_id, tenant_id);
CREATE INDEX idx_time_tracking_tenant_timestamp ON public.time_tracking(tenant_id, timestamp);
CREATE INDEX idx_work_sessions_employee_date ON public.work_sessions(employee_id, date);
CREATE INDEX idx_work_sessions_tenant_date ON public.work_sessions(tenant_id, date);