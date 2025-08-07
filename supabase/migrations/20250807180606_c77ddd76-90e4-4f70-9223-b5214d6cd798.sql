-- Insert practice analytics data for multi-practice dashboard
INSERT INTO practice_analytics (metric_type, metric_name, metric_value, period_start, period_end, metadata) VALUES
-- Downtown Practice data
('revenue', 'Monthly Revenue', 125000, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('patients', 'Patient Count', 450, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('appointments', 'Appointments Count', 680, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('utilization', 'Chair Utilization', 85, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('acceptance_rate', 'Treatment Acceptance Rate', 78, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('no_show_rate', 'No Show Rate', 8, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('insurance_success', 'Insurance Claim Success Rate', 94, '2024-01-01', '2024-01-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),

-- Westside Practice data
('revenue', 'Monthly Revenue', 98000, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('patients', 'Patient Count', 320, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('appointments', 'Appointments Count', 520, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('utilization', 'Chair Utilization', 72, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('acceptance_rate', 'Treatment Acceptance Rate', 82, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('no_show_rate', 'No Show Rate', 12, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('insurance_success', 'Insurance Claim Success Rate', 88, '2024-01-01', '2024-01-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),

-- Northside Practice data
('revenue', 'Monthly Revenue', 112000, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('patients', 'Patient Count', 380, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('appointments', 'Appointments Count', 590, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('utilization', 'Chair Utilization', 78, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('acceptance_rate', 'Treatment Acceptance Rate', 75, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('no_show_rate', 'No Show Rate', 15, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('insurance_success', 'Insurance Claim Success Rate', 91, '2024-01-01', '2024-01-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),

-- Southside Practice data
('revenue', 'Monthly Revenue', 89000, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),
('patients', 'Patient Count', 290, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),
('appointments', 'Appointments Count', 440, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),
('utilization', 'Chair Utilization', 68, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),
('acceptance_rate', 'Treatment Acceptance Rate', 70, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),
('no_show_rate', 'No Show Rate', 18, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),
('insurance_success', 'Insurance Claim Success Rate', 85, '2024-01-01', '2024-01-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),

-- Historical data for trends (February)
('revenue', 'Monthly Revenue', 130000, '2024-02-01', '2024-02-29', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('revenue', 'Monthly Revenue', 102000, '2024-02-01', '2024-02-29', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('revenue', 'Monthly Revenue', 118000, '2024-02-01', '2024-02-29', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('revenue', 'Monthly Revenue', 95000, '2024-02-01', '2024-02-29', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}'),

-- March data
('revenue', 'Monthly Revenue', 128000, '2024-03-01', '2024-03-31', '{"practice_name": "Downtown Dental", "location": "Downtown", "practice_id": 1}'),
('revenue', 'Monthly Revenue', 105000, '2024-03-01', '2024-03-31', '{"practice_name": "Westside Smiles", "location": "Westside", "practice_id": 2}'),
('revenue', 'Monthly Revenue', 115000, '2024-03-01', '2024-03-31', '{"practice_name": "Northside Dental Care", "location": "Northside", "practice_id": 3}'),
('revenue', 'Monthly Revenue', 92000, '2024-03-01', '2024-03-31', '{"practice_name": "Southside Family Dental", "location": "Southside", "practice_id": 4}');