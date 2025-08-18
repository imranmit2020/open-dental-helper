-- Fix infinite recursion in collaboration_channel_members policies
DROP POLICY IF EXISTS "Users can view channel members for channels they belong to" ON collaboration_channel_members;

-- Create a simpler policy that doesn't cause recursion
CREATE POLICY "Users can view channel members for channels they belong to" 
ON collaboration_channel_members FOR SELECT 
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM collaboration_channels cc 
    WHERE cc.id = collaboration_channel_members.channel_id 
    AND (
      cc.created_by = auth.uid() OR
      cc.type = 'public' OR
      EXISTS (
        SELECT 1 FROM tenant_users tu 
        WHERE tu.user_id = auth.uid() AND tu.tenant_id = cc.tenant_id
      ) OR
      EXISTS (
        SELECT 1 FROM corporate_users cu 
        WHERE cu.user_id = auth.uid() AND cu.corporation_id = cc.corporation_id
      )
    )
  )
);

-- Also fix the channel admins policy to avoid potential recursion
DROP POLICY IF EXISTS "Channel admins can manage members" ON collaboration_channel_members;

CREATE POLICY "Channel admins can manage members" 
ON collaboration_channel_members FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM collaboration_channels cc 
    WHERE cc.id = collaboration_channel_members.channel_id 
    AND cc.created_by = auth.uid()
  )
);

-- Ensure users can join channels automatically when they're created
INSERT INTO collaboration_channel_members (channel_id, user_id, role)
SELECT id, created_by, 'admin'
FROM collaboration_channels cc
WHERE NOT EXISTS (
  SELECT 1 FROM collaboration_channel_members ccm 
  WHERE ccm.channel_id = cc.id AND ccm.user_id = cc.created_by
);