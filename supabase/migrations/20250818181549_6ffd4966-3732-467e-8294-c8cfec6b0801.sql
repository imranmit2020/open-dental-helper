-- Create collaboration channels table
CREATE TABLE public.collaboration_channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'direct')),
  tenant_id uuid REFERENCES public.tenants(id),
  corporation_id uuid REFERENCES public.corporations(id),
  created_by uuid NOT NULL,
  member_count integer NOT NULL DEFAULT 0,
  unread_count integer NOT NULL DEFAULT 0,
  last_message text,
  last_activity timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create collaboration messages table
CREATE TABLE public.collaboration_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content text NOT NULL,
  sender_id uuid NOT NULL,
  sender_name text NOT NULL,
  sender_avatar text,
  channel_id uuid NOT NULL REFERENCES public.collaboration_channels(id) ON DELETE CASCADE,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'task', 'announcement')),
  attachments text[],
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create collaboration tasks table
CREATE TABLE public.collaboration_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to uuid NOT NULL,
  assigned_by uuid NOT NULL,
  due_date timestamp with time zone,
  channel_id uuid REFERENCES public.collaboration_channels(id) ON DELETE SET NULL,
  tenant_id uuid REFERENCES public.tenants(id),
  corporation_id uuid REFERENCES public.corporations(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create collaboration channel members table
CREATE TABLE public.collaboration_channel_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid NOT NULL REFERENCES public.collaboration_channels(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  last_read_at timestamp with time zone DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.collaboration_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collaboration_channel_members ENABLE ROW LEVEL SECURITY;

-- Create policies for collaboration_channels
CREATE POLICY "Users can view channels they belong to" ON public.collaboration_channels
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collaboration_channel_members ccm
      WHERE ccm.channel_id = collaboration_channels.id 
      AND ccm.user_id = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM public.tenant_users tu
      WHERE tu.user_id = auth.uid() 
      AND tu.tenant_id = collaboration_channels.tenant_id
    )
    OR
    EXISTS (
      SELECT 1 FROM public.corporate_users cu
      WHERE cu.user_id = auth.uid() 
      AND cu.corporation_id = collaboration_channels.corporation_id
    )
  );

CREATE POLICY "Users can create channels in their tenant/corporation" ON public.collaboration_channels
  FOR INSERT
  WITH CHECK (
    auth.uid() = created_by
    AND (
      (tenant_id IS NULL AND corporation_id IS NULL) OR
      (tenant_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.user_id = auth.uid() AND tu.tenant_id = collaboration_channels.tenant_id
      )) OR
      (corporation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.corporate_users cu
        WHERE cu.user_id = auth.uid() AND cu.corporation_id = collaboration_channels.corporation_id
      ))
    )
  );

CREATE POLICY "Channel creators can update their channels" ON public.collaboration_channels
  FOR UPDATE
  USING (auth.uid() = created_by);

-- Create policies for collaboration_messages
CREATE POLICY "Users can view messages in channels they belong to" ON public.collaboration_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collaboration_channel_members ccm
      WHERE ccm.channel_id = collaboration_messages.channel_id 
      AND ccm.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.collaboration_channels cc
      JOIN public.tenant_users tu ON tu.tenant_id = cc.tenant_id
      WHERE cc.id = collaboration_messages.channel_id 
      AND tu.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.collaboration_channels cc
      JOIN public.corporate_users cu ON cu.corporation_id = cc.corporation_id
      WHERE cc.id = collaboration_messages.channel_id 
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to channels they belong to" ON public.collaboration_messages
  FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (
        SELECT 1 FROM public.collaboration_channel_members ccm
        WHERE ccm.channel_id = collaboration_messages.channel_id 
        AND ccm.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.collaboration_channels cc
        JOIN public.tenant_users tu ON tu.tenant_id = cc.tenant_id
        WHERE cc.id = collaboration_messages.channel_id 
        AND tu.user_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM public.collaboration_channels cc
        JOIN public.corporate_users cu ON cu.corporation_id = cc.corporation_id
        WHERE cc.id = collaboration_messages.channel_id 
        AND cu.user_id = auth.uid()
      )
    )
  );

-- Create policies for collaboration_tasks
CREATE POLICY "Users can view tasks in their tenant/corporation" ON public.collaboration_tasks
  FOR SELECT
  USING (
    assigned_to = auth.uid() 
    OR assigned_by = auth.uid()
    OR (
      tenant_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.user_id = auth.uid() AND tu.tenant_id = collaboration_tasks.tenant_id
      )
    )
    OR (
      corporation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.corporate_users cu
        WHERE cu.user_id = auth.uid() AND cu.corporation_id = collaboration_tasks.corporation_id
      )
    )
  );

CREATE POLICY "Users can create tasks in their tenant/corporation" ON public.collaboration_tasks
  FOR INSERT
  WITH CHECK (
    auth.uid() = assigned_by
    AND (
      (tenant_id IS NULL AND corporation_id IS NULL) OR
      (tenant_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.tenant_users tu
        WHERE tu.user_id = auth.uid() AND tu.tenant_id = collaboration_tasks.tenant_id
      )) OR
      (corporation_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.corporate_users cu
        WHERE cu.user_id = auth.uid() AND cu.corporation_id = collaboration_tasks.corporation_id
      ))
    )
  );

CREATE POLICY "Users can update tasks they created or are assigned to" ON public.collaboration_tasks
  FOR UPDATE
  USING (
    assigned_to = auth.uid() 
    OR assigned_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() 
      AND p.role IN ('admin', 'dentist')
    )
  );

-- Create policies for collaboration_channel_members
CREATE POLICY "Users can view channel members for channels they belong to" ON public.collaboration_channel_members
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.collaboration_channel_members ccm2
      WHERE ccm2.channel_id = collaboration_channel_members.channel_id 
      AND ccm2.user_id = auth.uid()
    )
  );

CREATE POLICY "Channel admins can manage members" ON public.collaboration_channel_members
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collaboration_channels cc
      WHERE cc.id = collaboration_channel_members.channel_id 
      AND cc.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.collaboration_channel_members ccm
      WHERE ccm.channel_id = collaboration_channel_members.channel_id 
      AND ccm.user_id = auth.uid() 
      AND ccm.role = 'admin'
    )
  );

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_collaboration_channels_updated_at
  BEFORE UPDATE ON public.collaboration_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_messages_updated_at
  BEFORE UPDATE ON public.collaboration_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collaboration_tasks_updated_at
  BEFORE UPDATE ON public.collaboration_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_collaboration_channels_tenant_id ON public.collaboration_channels(tenant_id);
CREATE INDEX idx_collaboration_channels_corporation_id ON public.collaboration_channels(corporation_id);
CREATE INDEX idx_collaboration_messages_channel_id ON public.collaboration_messages(channel_id);
CREATE INDEX idx_collaboration_messages_created_at ON public.collaboration_messages(created_at);
CREATE INDEX idx_collaboration_tasks_assigned_to ON public.collaboration_tasks(assigned_to);
CREATE INDEX idx_collaboration_tasks_tenant_id ON public.collaboration_tasks(tenant_id);
CREATE INDEX idx_collaboration_channel_members_channel_id ON public.collaboration_channel_members(channel_id);
CREATE INDEX idx_collaboration_channel_members_user_id ON public.collaboration_channel_members(user_id);