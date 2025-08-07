-- Enable real-time for appointments table
ALTER TABLE public.appointments REPLICA IDENTITY FULL;

-- Add appointments to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- Insert dummy appointment data if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.appointments LIMIT 1) THEN
    -- First, ensure we have some patients
    IF NOT EXISTS (SELECT 1 FROM public.patients LIMIT 1) THEN
      INSERT INTO public.patients (first_name, last_name, email, phone, date_of_birth, gender, address) VALUES
      ('John', 'Smith', 'john.smith@email.com', '+1-555-0101', '1985-03-15', 'male', '123 Main St, City, State'),
      ('Sarah', 'Johnson', 'sarah.johnson@email.com', '+1-555-0102', '1990-07-22', 'female', '456 Oak Ave, City, State'),
      ('Michael', 'Brown', 'michael.brown@email.com', '+1-555-0103', '1978-11-08', 'male', '789 Pine Rd, City, State'),
      ('Emily', 'Davis', 'emily.davis@email.com', '+1-555-0104', '1992-05-12', 'female', '321 Elm St, City, State'),
      ('David', 'Wilson', 'david.wilson@email.com', '+1-555-0105', '1983-09-30', 'male', '654 Cedar Ln, City, State');
    END IF;

    -- Insert dummy appointments
    INSERT INTO public.appointments (patient_id, title, description, appointment_date, duration, status, treatment_type, notes)
    SELECT 
      p.id,
      CASE 
        WHEN random() < 0.3 THEN 'Routine Cleaning'
        WHEN random() < 0.5 THEN 'Dental Examination'
        WHEN random() < 0.7 THEN 'Filling Procedure'
        WHEN random() < 0.85 THEN 'Root Canal Treatment'
        ELSE 'Tooth Extraction'
      END,
      CASE 
        WHEN random() < 0.3 THEN 'Regular dental cleaning and checkup'
        WHEN random() < 0.5 THEN 'Comprehensive dental examination'
        WHEN random() < 0.7 THEN 'Cavity filling treatment'
        WHEN random() < 0.85 THEN 'Root canal therapy for infected tooth'
        ELSE 'Wisdom tooth extraction procedure'
      END,
      NOW() + (INTERVAL '1 day' * (random() * 30 - 15)::int) + (INTERVAL '1 hour' * (8 + random() * 10)::int),
      CASE 
        WHEN random() < 0.3 THEN 30
        WHEN random() < 0.6 THEN 60
        WHEN random() < 0.8 THEN 90
        ELSE 120
      END,
      CASE 
        WHEN random() < 0.4 THEN 'scheduled'
        WHEN random() < 0.6 THEN 'confirmed'
        WHEN random() < 0.8 THEN 'completed'
        WHEN random() < 0.9 THEN 'cancelled'
        ELSE 'no-show'
      END,
      CASE 
        WHEN random() < 0.3 THEN 'preventive'
        WHEN random() < 0.5 THEN 'restorative'
        WHEN random() < 0.7 THEN 'endodontic'
        WHEN random() < 0.85 THEN 'oral_surgery'
        ELSE 'cosmetic'
      END,
      CASE 
        WHEN random() < 0.5 THEN 'Patient arrived on time. No complications.'
        WHEN random() < 0.7 THEN 'Patient reported mild discomfort. Prescribed pain medication.'
        ELSE 'Follow-up appointment scheduled for next month.'
      END
    FROM (
      SELECT id FROM public.patients ORDER BY created_at LIMIT 5
    ) p,
    generate_series(1, 3) -- Generate 3 appointments per patient
    ON CONFLICT DO NOTHING;
  END IF;
END $$;