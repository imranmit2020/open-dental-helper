-- Voice notes table + policies (idempotent)
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  dentist_id UUID,
  summary TEXT,
  transcription TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Recreate policies safely
DO $$ BEGIN
  DROP POLICY IF EXISTS "Patients can view own voice notes" ON public.voice_notes;
  DROP POLICY IF EXISTS "Staff can manage voice notes" ON public.voice_notes;
END $$;

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

CREATE POLICY "Staff can manage voice notes"
ON public.voice_notes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.user_id = auth.uid()
      AND pr.role = ANY (ARRAY['admin','dentist','staff'])
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles pr
    WHERE pr.user_id = auth.uid()
      AND pr.role = ANY (ARRAY['admin','dentist','staff'])
  )
);

-- updated_at trigger (already exists in this project, but safe to (re)create trigger)
DROP TRIGGER IF EXISTS update_voice_notes_updated_at ON public.voice_notes;
CREATE TRIGGER update_voice_notes_updated_at
BEFORE UPDATE ON public.voice_notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_voice_notes_patient_id ON public.voice_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_created_at ON public.voice_notes(created_at);
