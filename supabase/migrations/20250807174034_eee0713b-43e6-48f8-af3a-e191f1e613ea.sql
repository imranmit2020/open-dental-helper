-- Insert dummy medical conditions with correct status values
INSERT INTO public.medical_conditions (patient_id, condition_name, diagnosed_date, status, notes)
SELECT 
  p.id,
  CASE (random() * 10)::int 
    WHEN 0 THEN 'Diabetes Type 2'
    WHEN 1 THEN 'Hypertension'
    WHEN 2 THEN 'Cardiac Arrhythmia'
    WHEN 3 THEN 'Osteoporosis'
    WHEN 4 THEN 'Allergic Rhinitis'
    WHEN 5 THEN 'Anxiety Disorder'
    WHEN 6 THEN 'Sleep Apnea'
    WHEN 7 THEN 'Migraine'
    WHEN 8 THEN 'Asthma'
    ELSE 'High Cholesterol'
  END,
  CURRENT_DATE - (random() * 365 * 2)::int,
  'active',  -- Use only 'active' status to avoid constraint issues
  'Diagnosed and being monitored regularly'
FROM patients p
WHERE NOT EXISTS (SELECT 1 FROM medical_conditions WHERE patient_id = p.id)
LIMIT 15;

-- Insert dummy allergies if none exist
INSERT INTO public.allergies (patient_id, allergen, severity, reaction, notes)
SELECT 
  p.id,
  CASE (random() * 8)::int 
    WHEN 0 THEN 'Penicillin'
    WHEN 1 THEN 'Latex'
    WHEN 2 THEN 'Ibuprofen'
    WHEN 3 THEN 'Aspirin'
    WHEN 4 THEN 'Local Anesthetic'
    WHEN 5 THEN 'Codeine'
    WHEN 6 THEN 'Sulfa Drugs'
    ELSE 'Shellfish'
  END,
  CASE (random() * 3)::int 
    WHEN 0 THEN 'Mild'
    WHEN 1 THEN 'Moderate'
    ELSE 'Severe'
  END,
  CASE (random() * 4)::int 
    WHEN 0 THEN 'Rash'
    WHEN 1 THEN 'Swelling'
    WHEN 2 THEN 'Difficulty breathing'
    ELSE 'Nausea'
  END,
  'Patient reported allergy - verify before treatment'
FROM patients p
WHERE NOT EXISTS (SELECT 1 FROM allergies WHERE patient_id = p.id)
AND random() < 0.6  -- Only 60% of patients have allergies
LIMIT 12;

-- Insert dummy medications with correct status values
INSERT INTO public.medications (patient_id, medication_name, dosage, frequency, start_date, status, notes)
SELECT 
  p.id,
  CASE (random() * 10)::int 
    WHEN 0 THEN 'Amoxicillin'
    WHEN 1 THEN 'Ibuprofen'
    WHEN 2 THEN 'Metformin'
    WHEN 3 THEN 'Lisinopril'
    WHEN 4 THEN 'Atorvastatin'
    WHEN 5 THEN 'Aspirin'
    WHEN 6 THEN 'Omeprazole'
    WHEN 7 THEN 'Acetaminophen'
    WHEN 8 THEN 'Clindamycin'
    ELSE 'Hydrocodone'
  END,
  CASE (random() * 6)::int 
    WHEN 0 THEN '500mg'
    WHEN 1 THEN '400mg'
    WHEN 2 THEN '10mg'
    WHEN 3 THEN '20mg'
    WHEN 4 THEN '81mg'
    ELSE '5mg'
  END,
  CASE (random() * 5)::int 
    WHEN 0 THEN 'Once daily'
    WHEN 1 THEN 'Twice daily'
    WHEN 2 THEN 'Three times daily'
    WHEN 3 THEN 'As needed'
    ELSE 'Before meals'
  END,
  CURRENT_DATE - (random() * 180)::int,
  'active',  -- Use only 'active' status to avoid constraint issues
  'Prescribed for dental/medical condition'
FROM patients p
WHERE NOT EXISTS (SELECT 1 FROM medications WHERE patient_id = p.id)
LIMIT 20;