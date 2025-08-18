-- First, let's check what channels exist and make them public
UPDATE collaboration_channels 
SET type = 'public', tenant_id = NULL, corporation_id = NULL
WHERE type != 'public' OR tenant_id IS NOT NULL OR corporation_id IS NOT NULL;

-- Create a fallback policy that allows users to see public channels even without membership
CREATE OR REPLACE FUNCTION get_user_accessible_channels()
RETURNS TABLE(
  id uuid,
  name text,
  description text,
  type text,
  created_by uuid,
  tenant_id uuid,
  corporation_id uuid,
  member_count integer,
  unread_count integer,
  last_activity timestamp with time zone,
  last_message text
) 
LANGUAGE sql 
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cc.id,
    cc.name,
    cc.description,
    cc.type,
    cc.created_by,
    cc.tenant_id,
    cc.corporation_id,
    cc.member_count,
    cc.unread_count,
    cc.last_activity,
    cc.last_message
  FROM collaboration_channels cc
  WHERE 
    -- Users can see channels they created
    cc.created_by = auth.uid() OR
    -- Users can see public channels
    cc.type = 'public' OR
    -- Users can see channels in their tenant (if they have one)
    (cc.tenant_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM tenant_users tu 
      WHERE tu.user_id = auth.uid() AND tu.tenant_id = cc.tenant_id
    )) OR
    -- Users can see channels in their corporation (if they have one)
    (cc.corporation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM corporate_users cu 
      WHERE cu.user_id = auth.uid() AND cu.corporation_id = cc.corporation_id
    )) OR
    -- Users can see channels they're explicitly members of
    EXISTS (
      SELECT 1 FROM collaboration_channel_members ccm 
      WHERE ccm.channel_id = cc.id AND ccm.user_id = auth.uid()
    );
$$;