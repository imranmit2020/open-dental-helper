-- Fix RLS policy for patients table to ensure staff can insert patients
-- First, let's check the existing policies and then create a proper insert policy

-- Drop the existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Staff can insert patients" ON public.patients;

-- Create a comprehensive policy that allows staff to insert patients
CREATE POLICY "Staff can insert patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::text, 'dentist'::text, 'staff'::text])
  )
);

-- Also ensure the update policy exists for staff
DROP POLICY IF EXISTS "Staff can update patients" ON public.patients;
CREATE POLICY "Staff can update patients" 
ON public.patients 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::text, 'dentist'::text, 'staff'::text])
  )
);

-- And delete policy for completeness
DROP POLICY IF EXISTS "Staff can delete patients" ON public.patients;
CREATE POLICY "Staff can delete patients" 
ON public.patients 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = ANY (ARRAY['admin'::text, 'dentist'::text, 'staff'::text])
  )
);