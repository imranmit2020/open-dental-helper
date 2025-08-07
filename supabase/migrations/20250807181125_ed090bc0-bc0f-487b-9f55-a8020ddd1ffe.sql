-- Create additional tables for Multi Practice Analytics functionality

-- Staff performance tracking table
CREATE TABLE IF NOT EXISTS staff_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  staff_member_id UUID NOT NULL,
  practice_name TEXT NOT NULL,
  performance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  productivity_score NUMERIC(5,2) DEFAULT 0,
  patient_satisfaction_score NUMERIC(5,2) DEFAULT 0,
  efficiency_rating NUMERIC(5,2) DEFAULT 0,
  patients_served INTEGER DEFAULT 0,
  revenue_generated NUMERIC(10,2) DEFAULT 0,
  hours_worked NUMERIC(5,2) DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Service revenue tracking table
CREATE TABLE IF NOT EXISTS service_revenue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_name TEXT NOT NULL,
  service_type TEXT NOT NULL,
  revenue_amount NUMERIC(10,2) NOT NULL,
  patient_count INTEGER DEFAULT 1,
  service_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Practice leaderboard metrics table
CREATE TABLE IF NOT EXISTS practice_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_name TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  metric_type TEXT NOT NULL, -- 'revenue', 'patient_satisfaction', 'efficiency', etc.
  metric_value NUMERIC(10,2) NOT NULL,
  ranking INTEGER DEFAULT 1,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AI predictions and insights table
CREATE TABLE IF NOT EXISTS ai_practice_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  practice_name TEXT NOT NULL,
  insight_type TEXT NOT NULL, -- 'prediction', 'recommendation', 'alert'
  insight_category TEXT NOT NULL, -- 'revenue', 'efficiency', 'risk', 'opportunity'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score NUMERIC(5,2) DEFAULT 0,
  priority_level TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  actionable_items JSONB DEFAULT '[]',
  predicted_impact NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Enable RLS
ALTER TABLE staff_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_revenue ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_practice_insights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Staff can view staff performance" ON staff_performance
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
  )
);

CREATE POLICY "Staff can view service revenue" ON service_revenue
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
  )
);

CREATE POLICY "Staff can view practice leaderboard" ON practice_leaderboard
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
  )
);

CREATE POLICY "Staff can view AI insights" ON ai_practice_insights
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY(ARRAY['admin', 'dentist', 'staff'])
  )
);

-- Insert comprehensive dummy data

-- Staff performance data
INSERT INTO staff_performance (staff_member_id, practice_name, productivity_score, patient_satisfaction_score, efficiency_rating, patients_served, revenue_generated, hours_worked) VALUES
-- Downtown Dental staff
(gen_random_uuid(), 'Downtown Dental', 92.5, 94.2, 89.7, 25, 3200.00, 8.0),
(gen_random_uuid(), 'Downtown Dental', 88.3, 91.5, 85.2, 22, 2800.00, 8.0),
(gen_random_uuid(), 'Downtown Dental', 90.1, 93.8, 87.9, 24, 3100.00, 8.0),
-- Westside Smiles staff
(gen_random_uuid(), 'Westside Smiles', 85.7, 89.3, 82.4, 20, 2500.00, 8.0),
(gen_random_uuid(), 'Westside Smiles', 87.2, 90.1, 84.6, 21, 2650.00, 8.0),
(gen_random_uuid(), 'Westside Smiles', 83.5, 88.7, 81.2, 19, 2400.00, 8.0),
-- Northside Dental Care staff
(gen_random_uuid(), 'Northside Dental Care', 89.4, 92.1, 86.8, 23, 2900.00, 8.0),
(gen_random_uuid(), 'Northside Dental Care', 86.9, 90.5, 84.3, 21, 2700.00, 8.0),
(gen_random_uuid(), 'Northside Dental Care', 88.7, 91.8, 85.9, 22, 2850.00, 8.0),
-- Southside Family Dental staff
(gen_random_uuid(), 'Southside Family Dental', 82.1, 86.4, 79.8, 18, 2200.00, 8.0),
(gen_random_uuid(), 'Southside Family Dental', 80.5, 85.2, 78.1, 17, 2100.00, 8.0),
(gen_random_uuid(), 'Southside Family Dental', 83.7, 87.6, 81.3, 19, 2350.00, 8.0);

-- Service revenue data
INSERT INTO service_revenue (practice_name, service_type, revenue_amount, patient_count, service_date) VALUES
-- Downtown Dental services
('Downtown Dental', 'Cleanings', 35000, 175, '2024-01-15'),
('Downtown Dental', 'Fillings', 28000, 80, '2024-01-15'),
('Downtown Dental', 'Crowns', 45000, 30, '2024-01-15'),
('Downtown Dental', 'Root Canals', 18000, 15, '2024-01-15'),
('Downtown Dental', 'Cosmetic', 22000, 25, '2024-01-15'),
-- Westside Smiles services
('Westside Smiles', 'Cleanings', 28000, 140, '2024-01-15'),
('Westside Smiles', 'Fillings', 22000, 65, '2024-01-15'),
('Westside Smiles', 'Crowns', 35000, 25, '2024-01-15'),
('Westside Smiles', 'Root Canals', 14000, 12, '2024-01-15'),
('Westside Smiles', 'Cosmetic', 18000, 20, '2024-01-15'),
-- Northside Dental Care services
('Northside Dental Care', 'Cleanings', 32000, 160, '2024-01-15'),
('Northside Dental Care', 'Fillings', 25000, 70, '2024-01-15'),
('Northside Dental Care', 'Crowns', 40000, 28, '2024-01-15'),
('Northside Dental Care', 'Root Canals', 16000, 13, '2024-01-15'),
('Northside Dental Care', 'Cosmetic', 20000, 22, '2024-01-15'),
-- Southside Family Dental services
('Southside Family Dental', 'Cleanings', 24000, 120, '2024-01-15'),
('Southside Family Dental', 'Fillings', 18000, 55, '2024-01-15'),
('Southside Family Dental', 'Crowns', 30000, 20, '2024-01-15'),
('Southside Family Dental', 'Root Canals', 12000, 10, '2024-01-15'),
('Southside Family Dental', 'Cosmetic', 15000, 18, '2024-01-15');

-- Practice leaderboard data
INSERT INTO practice_leaderboard (practice_name, staff_name, metric_type, metric_value, ranking, period_start, period_end) VALUES
-- Revenue leaders
('Downtown Dental', 'Dr. Sarah Johnson', 'revenue', 3200.00, 1, '2024-01-01', '2024-01-31'),
('Northside Dental Care', 'Dr. Michael Chen', 'revenue', 2900.00, 2, '2024-01-01', '2024-01-31'),
('Downtown Dental', 'Dr. Emily Wilson', 'revenue', 2800.00, 3, '2024-01-01', '2024-01-31'),
('Westside Smiles', 'Dr. James Rodriguez', 'revenue', 2650.00, 4, '2024-01-01', '2024-01-31'),
-- Patient satisfaction leaders
('Downtown Dental', 'Dr. Sarah Johnson', 'patient_satisfaction', 94.2, 1, '2024-01-01', '2024-01-31'),
('Downtown Dental', 'Dr. Alex Thompson', 'patient_satisfaction', 93.8, 2, '2024-01-01', '2024-01-31'),
('Northside Dental Care', 'Dr. Michael Chen', 'patient_satisfaction', 92.1, 3, '2024-01-01', '2024-01-31'),
('Northside Dental Care', 'Dr. Lisa Park', 'patient_satisfaction', 91.8, 4, '2024-01-01', '2024-01-31'),
-- Efficiency leaders
('Downtown Dental', 'Dr. Sarah Johnson', 'efficiency', 89.7, 1, '2024-01-01', '2024-01-31'),
('Downtown Dental', 'Dr. Alex Thompson', 'efficiency', 87.9, 2, '2024-01-01', '2024-01-31'),
('Northside Dental Care', 'Dr. Michael Chen', 'efficiency', 86.8, 3, '2024-01-01', '2024-01-31'),
('Northside Dental Care', 'Dr. Lisa Park', 'efficiency', 85.9, 4, '2024-01-01', '2024-01-31');

-- AI practice insights data
INSERT INTO ai_practice_insights (practice_name, insight_type, insight_category, title, description, confidence_score, priority_level, actionable_items, predicted_impact) VALUES
('Downtown Dental', 'prediction', 'revenue', 'Revenue Growth Opportunity', 'AI analysis suggests implementing premium cosmetic packages could increase revenue by 15% based on patient demographics and current service gaps.', 87.5, 'high', '["Introduce premium whitening packages", "Train staff on cosmetic consultation techniques", "Implement patient financing options"]', 18750.00),

('Westside Smiles', 'recommendation', 'efficiency', 'Schedule Optimization', 'Current appointment scheduling shows 23% downtime during peak hours. Recommend implementing smart scheduling algorithms.', 91.2, 'medium', '["Implement AI-powered scheduling system", "Redistribute appointment types during peak hours", "Add buffer time for complex procedures"]', 8500.00),

('Northside Dental Care', 'alert', 'risk', 'Patient Retention Warning', 'AI detected 18% decrease in repeat appointments among 35-50 age group. Immediate patient engagement required.', 89.7, 'high', '["Launch targeted retention campaign", "Implement patient feedback system", "Offer loyalty program for regular checkups"]', -12000.00),

('Southside Family Dental', 'prediction', 'opportunity', 'Untapped Market Potential', 'Demographic analysis reveals high demand for pediatric services in surrounding area. Expanding pediatric offerings could capture significant market share.', 83.4, 'medium', '["Hire pediatric specialist", "Redesign waiting area for families", "Partner with local schools for dental education"]', 15200.00),

('Downtown Dental', 'recommendation', 'efficiency', 'Staff Productivity Enhancement', 'Dr. Johnson showing exceptional performance metrics. Consider promoting as lead trainer for best practice sharing across network.', 94.1, 'low', '["Establish mentorship program", "Create training materials based on top performer methods", "Implement peer-to-peer learning sessions"]', 5000.00),

('Westside Smiles', 'alert', 'risk', 'Equipment Utilization Alert', 'AI monitoring shows declining usage of advanced imaging equipment. ROI analysis suggests need for staff retraining or service restructuring.', 76.8, 'medium', '["Schedule advanced imaging training", "Review service pricing structure", "Implement equipment usage tracking"]', 3200.00);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_staff_performance_updated_at
    BEFORE UPDATE ON staff_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_revenue_updated_at
    BEFORE UPDATE ON service_revenue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();