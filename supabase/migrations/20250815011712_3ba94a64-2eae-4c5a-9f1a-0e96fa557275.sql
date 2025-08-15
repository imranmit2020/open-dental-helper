-- Add INSERT policy for lab provider accounts registration
CREATE POLICY "Anyone can insert lab provider accounts during signup" 
ON public.lab_provider_accounts 
FOR INSERT 
WITH CHECK (true);

-- Add INSERT policy for lab provider users
CREATE POLICY "Users can insert own lab provider user record" 
ON public.lab_provider_users 
FOR INSERT 
WITH CHECK (user_id = auth.uid());