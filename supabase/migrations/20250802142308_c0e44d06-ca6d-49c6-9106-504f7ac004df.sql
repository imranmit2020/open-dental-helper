-- Update the current user's role to staff so they can manage patients
UPDATE profiles 
SET role = 'staff' 
WHERE user_id = '6962aa5a-fe6f-4bee-abef-c4adb47ad993';