-- Create user favorites table for charting modules
CREATE TABLE public.user_module_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_key TEXT NOT NULL,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, module_key, tenant_id)
);

-- Enable RLS
ALTER TABLE public.user_module_favorites ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own favorites" 
ON public.user_module_favorites 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_user_module_favorites_updated_at
BEFORE UPDATE ON public.user_module_favorites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();