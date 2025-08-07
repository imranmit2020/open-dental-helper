-- Set admin role for current authenticated users
-- Since we can't determine the exact user_id at migration time, 
-- we'll create a more general approach

-- First, let's check if any user doesn't have an admin role and set one admin
UPDATE profiles 
SET role = 'admin' 
WHERE user_id = (
  SELECT user_id 
  FROM profiles 
  WHERE role = 'patient' 
  LIMIT 1
);