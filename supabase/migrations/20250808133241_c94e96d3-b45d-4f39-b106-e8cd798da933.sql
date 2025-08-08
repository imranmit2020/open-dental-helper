-- Create voice_notes table for AI Voice Notes feature
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  created_by UUID NOT NULL,
  title TEXT,
  transcript TEXT,
  audio_url TEXT,
  duration_seconds INTEGER,
  language TEXT,
  sentiment NUMERIC,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Patients can view their own voice notes
CREATE POLICY "Patients can view own voice notes"
ON public.voice_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.patients p
    WHERE p.id = voice_notes.patient_id
      AND p.user_id = auth.uid()
  )
);

-- Staff can insert voice notes for patients in their tenant
CREATE POLICY "Staff insert voice_notes in tenant"
ON public.voice_notes
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.patients p
    JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
    WHERE p.id = voice_notes.patient_id
      AND tu.user_id = auth.uid()
  )
);

-- Staff can select voice notes for patients in their tenant
CREATE POLICY "Staff select voice_notes in tenant"
ON public.voice_notes
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.patients p
    JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
    WHERE p.id = voice_notes.patient_id
      AND tu.user_id = auth.uid()
  )
);

-- Staff can update voice notes for patients in their tenant
CREATE POLICY "Staff update voice_notes in tenant"
ON public.voice_notes
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.patients p
    JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
    WHERE p.id = voice_notes.patient_id
      AND tu.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.patients p
    JOIN public.tenant_users tu ON tu.tenant_id = p.tenant_id
    WHERE p.id = voice_notes.patient_id
      AND tu.user_id = auth.uid()
  )
);

-- updated_at trigger
CREATE TRIGGER update_voice_notes_updated_at
BEFORE UPDATE ON public.voice_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();