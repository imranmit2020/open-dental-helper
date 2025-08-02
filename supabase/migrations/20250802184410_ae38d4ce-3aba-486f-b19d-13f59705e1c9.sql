-- Enhanced Teledentistry Tables
CREATE TABLE public.teledentistry_sessions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    dentist_id UUID NOT NULL,
    session_type TEXT NOT NULL DEFAULT 'consultation',
    status TEXT NOT NULL DEFAULT 'scheduled',
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    recording_url TEXT,
    ai_transcript TEXT,
    ai_soap_notes JSONB,
    ai_summary TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Reputation Management Tables
CREATE TABLE public.review_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    appointment_id UUID,
    platform TEXT NOT NULL, -- 'google', 'yelp', 'facebook', 'healthgrades'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'completed', 'declined'
    request_sent_at TIMESTAMP WITH TIME ZONE,
    review_received_at TIMESTAMP WITH TIME ZONE,
    review_rating INTEGER,
    review_text TEXT,
    ai_sentiment_score NUMERIC,
    ai_sentiment_analysis JSONB,
    response_required BOOLEAN DEFAULT false,
    ai_suggested_response TEXT,
    actual_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lead Management Tables
CREATE TABLE public.leads (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    source TEXT NOT NULL, -- 'website', 'phone', 'referral', 'social', 'ads'
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    preferred_contact TEXT DEFAULT 'email',
    service_interest TEXT[], -- array of interested services
    urgency_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'emergency'
    ai_lead_score NUMERIC DEFAULT 0,
    conversion_probability NUMERIC DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
    assigned_to UUID,
    first_contact_at TIMESTAMP WITH TIME ZONE,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    conversion_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    ai_insights JSONB,
    follow_up_sequence JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.lead_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL, -- 'call', 'email', 'sms', 'appointment_scheduled', 'no_show'
    description TEXT,
    outcome TEXT,
    next_action TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Marketing Campaigns Tables
CREATE TABLE public.marketing_campaigns_enhanced (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_name TEXT NOT NULL,
    campaign_type TEXT NOT NULL, -- 'email', 'sms', 'whatsapp', 'social', 'multi_channel'
    target_audience JSONB NOT NULL,
    ai_generated_content JSONB,
    content TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    scheduled_start TIMESTAMP WITH TIME ZONE,
    actual_start TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    ai_optimization_enabled BOOLEAN DEFAULT true,
    performance_metrics JSONB,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.campaign_recipients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID NOT NULL REFERENCES public.marketing_campaigns_enhanced(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL,
    channel TEXT NOT NULL, -- 'email', 'sms', 'whatsapp'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'opened', 'clicked', 'converted'
    sent_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    converted_at TIMESTAMP WITH TIME ZONE,
    ai_personalization JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Cross-Module Data Integration Tables
CREATE TABLE public.patient_journey_events (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL,
    event_type TEXT NOT NULL, -- 'appointment', 'treatment', 'payment', 'review', 'referral', 'communication'
    event_data JSONB NOT NULL,
    source_module TEXT NOT NULL, -- 'clinical', 'operations', 'finance', 'marketing', 'patient_engagement'
    ai_insights JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.teledentistry_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns_enhanced ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_journey_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Teledentistry
CREATE POLICY "Staff can manage teledentistry sessions" ON public.teledentistry_sessions
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

CREATE POLICY "Patients can view own teledentistry sessions" ON public.teledentistry_sessions
FOR SELECT USING (EXISTS (
    SELECT 1 FROM patients 
    WHERE patients.id = teledentistry_sessions.patient_id 
    AND patients.user_id = auth.uid()
));

-- RLS Policies for Reviews
CREATE POLICY "Staff can manage reviews" ON public.review_requests
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

-- RLS Policies for Leads
CREATE POLICY "Staff can manage leads" ON public.leads
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

CREATE POLICY "Staff can manage lead activities" ON public.lead_activities
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

-- RLS Policies for Marketing
CREATE POLICY "Staff can manage marketing campaigns" ON public.marketing_campaigns_enhanced
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

CREATE POLICY "Staff can view campaign recipients" ON public.campaign_recipients
FOR SELECT USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

-- RLS Policies for Journey Events
CREATE POLICY "Staff can manage journey events" ON public.patient_journey_events
FOR ALL USING (EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
));

-- Functions for automated timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for timestamps
CREATE TRIGGER update_teledentistry_sessions_updated_at
    BEFORE UPDATE ON public.teledentistry_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_review_requests_updated_at
    BEFORE UPDATE ON public.review_requests
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marketing_campaigns_enhanced_updated_at
    BEFORE UPDATE ON public.marketing_campaigns_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();