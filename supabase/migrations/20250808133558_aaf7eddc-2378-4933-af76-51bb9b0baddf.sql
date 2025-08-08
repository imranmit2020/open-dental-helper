-- Idempotent migration for voice_notes table and RLS
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'voice_notes'
  ) THEN
    CREATE TABLE public.voice_notes (
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
    ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Policies
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'voice_notes' AND policyname = 'Patients can view own voice notes'
  ) THEN
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
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'voice_notes' AND policyname = 'Staff insert voice_notes in tenant'
  ) THEN
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
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'voice_notes' AND policyname = 'Staff select voice_notes in tenant'
  ) THEN
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
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'voice_notes' AND policyname = 'Staff update voice_notes in tenant'
  ) THEN
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
  END IF;
END $$;

-- updated_at trigger (idempotent)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_voice_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_voice_notes_updated_at
    BEFORE UPDATE ON public.voice_notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;