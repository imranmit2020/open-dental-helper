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

-- Create indexes for performance
CREATE INDEX idx_time_tracking_employee_date ON public.time_tracking(employee_id, date(timestamp));
CREATE INDEX idx_time_tracking_tenant_date ON public.time_tracking(tenant_id, date(timestamp));
CREATE INDEX idx_work_sessions_employee_date ON public.work_sessions(employee_id, date);
CREATE INDEX idx_work_sessions_tenant_date ON public.work_sessions(tenant_id, date);

-- Create function to update work sessions automatically
CREATE OR REPLACE FUNCTION public.update_work_session()
RETURNS TRIGGER AS $$
DECLARE
  session_record RECORD;
  total_break_time NUMERIC := 0;
BEGIN
  -- Get or create work session for this date
  INSERT INTO public.work_sessions (employee_id, tenant_id, date)
  VALUES (NEW.employee_id, NEW.tenant_id, date(NEW.timestamp))
  ON CONFLICT (employee_id, tenant_id, date) DO NOTHING;

  -- Calculate break time for the day
  SELECT COALESCE(
    SUM(
      CASE 
        WHEN break_end.timestamp IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (break_end.timestamp - break_start.timestamp)) / 3600.0
        ELSE 0
      END
    ), 0
  ) INTO total_break_time
  FROM public.time_tracking break_start
  LEFT JOIN public.time_tracking break_end 
    ON break_start.employee_id = break_end.employee_id 
    AND break_start.tenant_id = break_end.tenant_id
    AND date(break_start.timestamp) = date(break_end.timestamp)
    AND break_end.action_type = 'break_end'
    AND break_end.timestamp > break_start.timestamp
  WHERE break_start.employee_id = NEW.employee_id 
    AND break_start.tenant_id = NEW.tenant_id
    AND date(break_start.timestamp) = date(NEW.timestamp)
    AND break_start.action_type = 'break_start';

  -- Update work session based on action type
  IF NEW.action_type = 'clock_in' THEN
    UPDATE public.work_sessions 
    SET 
      clock_in_time = NEW.timestamp,
      status = 'in_progress',
      updated_at = now()
    WHERE employee_id = NEW.employee_id 
      AND tenant_id = NEW.tenant_id 
      AND date = date(NEW.timestamp);
      
  ELSIF NEW.action_type = 'clock_out' THEN
    UPDATE public.work_sessions 
    SET 
      clock_out_time = NEW.timestamp,
      total_hours = EXTRACT(EPOCH FROM (NEW.timestamp - clock_in_time)) / 3600.0,
      break_duration = total_break_time,
      status = 'completed',
      updated_at = now()
    WHERE employee_id = NEW.employee_id 
      AND tenant_id = NEW.tenant_id 
      AND date = date(NEW.timestamp)
      AND clock_in_time IS NOT NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update work sessions
CREATE TRIGGER update_work_session_trigger
  AFTER INSERT ON public.time_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_work_session();