-- Create a default "General" channel for users who aren't part of any organization
INSERT INTO collaboration_channels (name, description, type, created_by, tenant_id, corporation_id, member_count, unread_count)
SELECT 
  'General Discussion',
  'General collaboration channel for all users',
  'public',
  auth.uid(),
  NULL,
  NULL,
  1,
  0
WHERE NOT EXISTS (
  SELECT 1 FROM collaboration_channels 
  WHERE name = 'General Discussion' AND type = 'public' AND tenant_id IS NULL AND corporation_id IS NULL
);

-- Ensure there's at least one channel visible to all authenticated users
UPDATE collaboration_channels 
SET type = 'public', tenant_id = NULL, corporation_id = NULL
WHERE name IN ('General Discussion', 'Neural Chat', 'AI Canvas', 'Smart Tasks', 'Team');