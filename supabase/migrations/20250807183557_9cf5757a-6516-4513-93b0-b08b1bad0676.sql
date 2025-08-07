-- Drop existing problematic policies
DROP POLICY IF EXISTS "corporate_users_select_policy" ON corporate_users;
DROP POLICY IF EXISTS "corporate_users_insert_policy" ON corporate_users;
DROP POLICY IF EXISTS "corporate_users_update_policy" ON corporate_users;
DROP POLICY IF EXISTS "corporate_users_delete_policy" ON corporate_users;

-- Create simple, non-recursive policies for corporate_users
CREATE POLICY "Users can view their own corporate assignments"
ON corporate_users FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Only authenticated users can insert corporate assignments"
ON corporate_users FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own corporate assignments"
ON corporate_users FOR UPDATE
USING (user_id = auth.uid());

-- Drop existing problematic policies for tenant_users
DROP POLICY IF EXISTS "tenant_users_select_policy" ON tenant_users;
DROP POLICY IF EXISTS "tenant_users_insert_policy" ON tenant_users;
DROP POLICY IF EXISTS "tenant_users_update_policy" ON tenant_users;
DROP POLICY IF EXISTS "tenant_users_delete_policy" ON tenant_users;

-- Create simple, non-recursive policies for tenant_users
CREATE POLICY "Users can view their own tenant assignments"
ON tenant_users FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Only authenticated users can insert tenant assignments"
ON tenant_users FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own tenant assignments"
ON tenant_users FOR UPDATE
USING (user_id = auth.uid());