-- Check if user has any channels first
SELECT COUNT(*) as channel_count FROM collaboration_channels;

-- Check if the current user has any tenant/corporation associations
SELECT 
  tu.tenant_id,
  cu.corporation_id
FROM tenant_users tu
FULL OUTER JOIN corporate_users cu ON cu.user_id = tu.user_id
WHERE tu.user_id = auth.uid() OR cu.user_id = auth.uid();

-- Fix the collaboration_channels policy to be less restrictive for development
DROP POLICY IF EXISTS "Users can view channels they belong to" ON collaboration_channels;

-- Create a more permissive policy for now to allow users to see channels
CREATE POLICY "Users can view channels they belong to" 
ON collaboration_channels FOR SELECT 
USING (
  -- Users can see channels they created
  created_by = auth.uid() OR
  -- Users can see public channels
  type = 'public' OR
  -- Users can see channels in their tenant (if they have one)
  (tenant_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM tenant_users tu 
    WHERE tu.user_id = auth.uid() AND tu.tenant_id = collaboration_channels.tenant_id
  )) OR
  -- Users can see channels in their corporation (if they have one)
  (corporation_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM corporate_users cu 
    WHERE cu.user_id = auth.uid() AND cu.corporation_id = collaboration_channels.corporation_id
  )) OR
  -- Users can see channels they're explicitly members of
  EXISTS (
    SELECT 1 FROM collaboration_channel_members ccm 
    WHERE ccm.channel_id = collaboration_channels.id AND ccm.user_id = auth.uid()
  )
);

-- Also ensure users can automatically join channels they create
CREATE OR REPLACE FUNCTION auto_join_channel_creator()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically add the creator as an admin member
  INSERT INTO collaboration_channel_members (channel_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin')
  ON CONFLICT (channel_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-join creators
DROP TRIGGER IF EXISTS auto_join_channel_creator_trigger ON collaboration_channels;
CREATE TRIGGER auto_join_channel_creator_trigger
  AFTER INSERT ON collaboration_channels
  FOR EACH ROW
  EXECUTE FUNCTION auto_join_channel_creator();