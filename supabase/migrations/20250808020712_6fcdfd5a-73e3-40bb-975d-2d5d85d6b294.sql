-- Ensure handle_new_user populates role and links tenant invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data ->> 'role', 'patient');
  v_first text := NEW.raw_user_meta_data ->> 'first_name';
  v_last text := NEW.raw_user_meta_data ->> 'last_name';
  v_phone text := NEW.raw_user_meta_data ->> 'phone';
  v_invitation record;
BEGIN
  -- Upsert profile with role
  INSERT INTO public.profiles (user_id, first_name, last_name, email, phone, role)
  VALUES (NEW.id, v_first, v_last, NEW.email, v_phone, v_role)
  ON CONFLICT (user_id) DO UPDATE
    SET first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = COALESCE(EXCLUDED.role, public.profiles.role);

  -- Attach to tenant via latest valid invitation by email
  SELECT * INTO v_invitation
  FROM public.team_invitations
  WHERE email = NEW.email
    AND status IN ('sent','pending')
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invitation IS NOT NULL THEN
    INSERT INTO public.tenant_users (tenant_id, user_id, role)
    VALUES (v_invitation.tenant_id, NEW.id, v_invitation.role)
    ON CONFLICT DO NOTHING;

    UPDATE public.profiles
      SET role = v_invitation.role
    WHERE user_id = NEW.id;

    UPDATE public.team_invitations
      SET status = 'accepted', accepted_at = now()
    WHERE id = v_invitation.id;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger to invoke on new auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Backfill: create profiles for existing auth users without profile
INSERT INTO public.profiles (user_id, first_name, last_name, email, phone, role)
SELECT u.id,
       u.raw_user_meta_data ->> 'first_name' AS first_name,
       u.raw_user_meta_data ->> 'last_name' AS last_name,
       u.email,
       u.raw_user_meta_data ->> 'phone' AS phone,
       COALESCE(u.raw_user_meta_data ->> 'role', 'patient') AS role
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;

-- Backfill: tenant assignments based on invitations
INSERT INTO public.tenant_users (tenant_id, user_id, role)
SELECT ti.tenant_id, u.id, ti.role
FROM public.team_invitations ti
JOIN auth.users u ON u.email = ti.email
LEFT JOIN public.tenant_users tu ON tu.user_id = u.id AND tu.tenant_id = ti.tenant_id
WHERE tu.user_id IS NULL;

-- Ensure profiles role aligns with most recent invitation
UPDATE public.profiles p
SET role = ti.role
FROM (
  SELECT DISTINCT ON (email) *
  FROM public.team_invitations
  ORDER BY email, created_at DESC
) ti
JOIN auth.users u ON u.email = ti.email
WHERE p.user_id = u.id;