-- Enable real-time for user_approval_requests table
ALTER TABLE public.user_approval_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_approval_requests;

-- Insert dummy data if table is empty
INSERT INTO public.user_approval_requests (
  user_id,
  email,
  first_name,
  last_name,
  requested_role,
  organization_type,
  organization_name,
  phone,
  status,
  requested_at
) 
SELECT 
  gen_random_uuid(),
  'john.smith@dentalclinic.com',
  'John',
  'Smith',
  'dentist',
  'clinic',
  'Downtown Dental Clinic',
  '+1-555-0123',
  'pending',
  now() - interval '2 hours'
WHERE NOT EXISTS (SELECT 1 FROM public.user_approval_requests LIMIT 1);

INSERT INTO public.user_approval_requests (
  user_id,
  email,
  first_name,
  last_name,
  requested_role,
  organization_type,
  organization_name,
  phone,
  status,
  requested_at
) 
SELECT 
  gen_random_uuid(),
  'sarah.johnson@westsidemiles.com',
  'Sarah',
  'Johnson',
  'staff',
  'clinic',
  'Westside Smiles',
  '+1-555-0124',
  'pending',
  now() - interval '45 minutes'
WHERE (SELECT COUNT(*) FROM public.user_approval_requests) < 2;

INSERT INTO public.user_approval_requests (
  user_id,
  email,
  first_name,
  last_name,
  requested_role,
  organization_type,
  organization_name,
  phone,
  status,
  requested_at,
  reviewed_at,
  reviewed_by,
  admin_notes
) 
SELECT 
  gen_random_uuid(),
  'mike.wilson@northsidedental.com',
  'Mike',
  'Wilson',
  'dentist',
  'clinic',
  'Northside Dental Care',
  '+1-555-0125',
  'approved',
  now() - interval '1 day',
  now() - interval '20 hours',
  (SELECT id FROM auth.users WHERE email = 'imranahmedcv@yahoo.com' LIMIT 1),
  'Approved after verification of credentials'
WHERE (SELECT COUNT(*) FROM public.user_approval_requests) < 3;

INSERT INTO public.user_approval_requests (
  user_id,
  email,
  first_name,
  last_name,
  requested_role,
  organization_type,
  organization_name,
  phone,
  status,
  requested_at,
  reviewed_at,
  reviewed_by,
  admin_notes
) 
SELECT 
  gen_random_uuid(),
  'lisa.brown@corporatehealth.com',
  'Lisa',
  'Brown',
  'admin',
  'corporation',
  'Corporate Health Solutions',
  '+1-555-0126',
  'rejected',
  now() - interval '3 days',
  now() - interval '2 days',
  (SELECT id FROM auth.users WHERE email = 'imranahmedcv@yahoo.com' LIMIT 1),
  'Insufficient documentation provided'
WHERE (SELECT COUNT(*) FROM public.user_approval_requests) < 4;

INSERT INTO public.user_approval_requests (
  user_id,
  email,
  first_name,
  last_name,
  requested_role,
  organization_type,
  organization_name,
  phone,
  status,
  requested_at
) 
SELECT 
  gen_random_uuid(),
  'david.garcia@familydental.com',
  'David',
  'Garcia',
  'staff',
  'clinic',
  'Family Dental Practice',
  '+1-555-0127',
  'pending',
  now() - interval '15 minutes'
WHERE (SELECT COUNT(*) FROM public.user_approval_requests) < 5;