-- Create team_invitations table to track invites
CREATE TABLE IF NOT EXISTS public.team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid,
  email text NOT NULL,
  first_name text,
  last_name text,
  role text NOT NULL CHECK (role IN ('admin','dentist','hygienist','staff')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','accepted','revoked','expired','failed')),
  token uuid DEFAULT gen_random_uuid(),
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  sent_at timestamptz,
  accepted_at timestamptz,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Policies: allow creators to see their own, and tenant admins/super-admins to manage
CREATE POLICY "Creators can view their own invitations"
  ON public.team_invitations
  FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Tenant admins and super-admin can view invitations"
  ON public.team_invitations
  FOR SELECT
  USING (
    public.is_super_admin(auth.uid()) OR
    public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
  );

CREATE POLICY "Tenant admins and super-admin can insert invitations"
  ON public.team_invitations
  FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND (
      public.is_super_admin(auth.uid()) OR
      public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
    )
  );

CREATE POLICY "Tenant admins and super-admin can update invitations"
  ON public.team_invitations
  FOR UPDATE
  USING (
    public.is_super_admin(auth.uid()) OR
    public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
  );

CREATE POLICY "Tenant admins and super-admin can delete invitations"
  ON public.team_invitations
  FOR DELETE
  USING (
    public.is_super_admin(auth.uid()) OR
    public.get_user_tenant_role(auth.uid(), tenant_id) = 'admin'
  );

-- Update trigger for updated_at
CREATE TRIGGER update_team_invitations_updated_at
  BEFORE UPDATE ON public.team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON public.team_invitations (email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON public.team_invitations (status);
CREATE INDEX IF NOT EXISTS idx_team_invitations_tenant ON public.team_invitations (tenant_id);