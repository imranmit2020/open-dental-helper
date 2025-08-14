-- Create storage bucket for ETL files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('etl-files', 'etl-files', false);

-- Create RLS policies for ETL files bucket
CREATE POLICY "Admins can view ETL files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'etl-files' AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
));

CREATE POLICY "Admins can upload ETL files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'etl-files' AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
));

CREATE POLICY "Admins can update ETL files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'etl-files' AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
));

CREATE POLICY "Admins can delete ETL files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'etl-files' AND (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
));