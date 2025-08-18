import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { HolographicVideoCall } from '@/components/collaboration/HolographicVideoCall';
import { AIWhiteboard } from '@/components/collaboration/AIWhiteboard';
import { VoiceIntelligence } from '@/components/collaboration/VoiceIntelligence';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Users, 
  CheckSquare, 
  Plus, 
  Clock, 
  Filter,
  Search,
  Video,
  Phone,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  MoreVertical,
  Star,
  Hash,
  Bell,
  Settings,
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  Activity,
  Bot,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  channel_id: string;
  created_at: string;
  attachments?: string[];
  message_type: string;
  metadata?: any;
}

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  tenant_id?: string;
  corporation_id?: string;
  created_by: string;
  member_count: number;
  unread_count: number;
  last_message?: string;
  last_activity: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to: string;
  assigned_by: string;
  due_date?: string;
  created_at: string;
  channel_id?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar_url?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  last_seen?: string;
  expertise?: string[];
  current_location?: string;
  in_call?: boolean;
}

interface SmartWorkflow {
  id: string;
  name: string;
  trigger: string;
  actions: string[];
  status: 'active' | 'inactive';
  success_rate: number;
}

export default function Collaboration() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isVideoCallActive, setIsVideoCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [smartWorkflows, setSmartWorkflows] = useState<SmartWorkflow[]>([]);
  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChannels();
    fetchTeamMembersData();
    fetchTasks();
    fetchSmartWorkflows();
    generateAISuggestions();
    setupRealtimeSubscriptions();
  }, [user]);

  useEffect(() => {
    if (activeChannel) {
      fetchMessages(activeChannel.id);
    }
  }, [activeChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_channels')
        .select('*')
        .order('last_activity', { ascending: false });

      if (error) throw error;
      setChannels(data || []);
      
      if (data && data.length > 0 && !activeChannel) {
        setActiveChannel(data[0]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabase
        .from('collaboration_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('collaboration_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add AI enhancements to tasks
      const enhancedTasks = (data || []).map(task => ({
        ...task,
        ai_suggested: Math.random() > 0.6,
        estimated_time: Math.floor(Math.random() * 8) + 1,
        completion_percentage: task.status === 'completed' ? 100 : 
                              task.status === 'in_progress' ? Math.floor(Math.random() * 80) + 20 : 0
      }));
      
      setTasks(enhancedTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTeamMembersData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, role')
        .not('role', 'eq', 'patient');

      if (error) throw error;
      
      const members: TeamMember[] = (data || []).map(profile => ({
        id: profile.user_id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
        role: profile.role,
        avatar_url: undefined,
        status: 'offline',
        last_seen: new Date().toISOString(),
        expertise: ['General Practice'], // Default expertise
        current_location: 'Clinic',
        in_call: false
      }));
      
      setTeamMembers(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartWorkflows = async () => {
    const mockWorkflows: SmartWorkflow[] = [
      {
        id: '1',
        name: 'Patient Follow-up Automation',
        trigger: 'Appointment completed',
        actions: ['Send feedback request', 'Schedule follow-up', 'Update patient record'],
        status: 'active',
        success_rate: 94
      },
      {
        id: '2',
        name: 'Urgent Case Alert',
        trigger: 'Pain level > 8',
        actions: ['Notify on-call dentist', 'Priority scheduling', 'Send care instructions'],
        status: 'active',
        success_rate: 98
      },
      {
        id: '3',
        name: 'Equipment Maintenance',
        trigger: 'Usage threshold reached',
        actions: ['Schedule maintenance', 'Order supplies', 'Notify technician'],
        status: 'active',
        success_rate: 87
      }
    ];
    setSmartWorkflows(mockWorkflows);
  };

  const generateAISuggestions = async () => {
    const suggestions = [
      "Schedule team meeting to discuss patient case #1247",
      "Review X-ray analysis results with Dr. Johnson",
      "Update treatment protocols based on latest research",
      "Assign hygienist training module to Emily",
      "Optimize afternoon appointment scheduling"
    ];
    setSmartSuggestions(suggestions);
  };

  const updateTeamPresence = () => {
    setTeamMembers(prev => prev.map(member => ({
      ...member,
      status: Math.random() > 0.8 ? 
        (['online', 'busy', 'away'] as const)[Math.floor(Math.random() * 3)] : 
        member.status
    })));
  };


  const setupRealtimeSubscriptions = () => {
    const messageChannel = supabase
      .channel('collaboration_messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'collaboration_messages'
        },
        (payload) => {
          const newMessage = payload.new as Message;
          if (activeChannel && newMessage.channel_id === activeChannel.id) {
            setMessages(prev => [...prev, newMessage]);
          }
        }
      )
      .subscribe();

    const presenceChannel = supabase
      .channel('team_presence')
      .on('presence', { event: 'sync' }, () => {
        const newState = presenceChannel.presenceState();
        updateMemberPresence(newState);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        updateMemberPresence({ [key]: newPresences });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        updateMemberPresence({ [key]: [] });
      })
      .subscribe();

    // Track current user presence
    if (user) {
      presenceChannel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      });
    }

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(presenceChannel);
    };
  };

  const updateMemberPresence = (presenceState: any) => {
    setTeamMembers(prev => 
      prev.map(member => ({
        ...member,
        status: Object.keys(presenceState).includes(member.id) ? 'online' : 'offline'
      }))
    );
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel || !user) return;

    try {
      const messageData = {
        content: newMessage.trim(),
        sender_id: user.id,
        sender_name: user.user_metadata?.first_name ? 
          `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() :
          user.email?.split('@')[0] || 'Unknown',
        channel_id: activeChannel.id,
        message_type: 'text' as const,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('collaboration_messages')
        .insert([messageData]);

      if (error) throw error;

      setNewMessage('');
      toast.success('Message sent');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const createChannel = async () => {
    if (!newChannelName.trim() || !user) return;

    try {
      const channelData = {
        name: newChannelName.trim(),
        description: newChannelDescription.trim(),
        type: 'public',
        created_by: user.id,
        member_count: 1,
        unread_count: 0,
        last_activity: new Date().toISOString()
      };

      const { error } = await supabase
        .from('collaboration_channels')
        .insert([channelData]);

      if (error) throw error;

      setNewChannelName('');
      setNewChannelDescription('');
      fetchChannels();
      toast.success('Channel created successfully');
    } catch (error) {
      console.error('Error creating channel:', error);
      toast.error('Failed to create channel');
    }
  };

  const createTask = async (title: string, description: string, assignedTo: string, priority: string) => {
    if (!user) return;

    try {
      const taskData = {
        title,
        description,
        status: 'pending',
        priority,
        assigned_to: assignedTo,
        assigned_by: user.id,
        channel_id: activeChannel?.id,
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('collaboration_tasks')
        .insert([taskData]);

      if (error) throw error;

      fetchTasks();
      toast.success('Task created successfully');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('collaboration_tasks')
        .update({ status })
        .eq('id', taskId);

      if (error) throw error;

      fetchTasks();
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeChannel || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `collaboration/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      const messageData = {
        content: `File shared: ${file.name}`,
        sender_id: user.id,
        sender_name: user.user_metadata?.first_name ? 
          `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim() :
          user.email?.split('@')[0] || 'Unknown',
        channel_id: activeChannel.id,
        message_type: 'file' as const,
        attachments: [data.publicUrl],
        metadata: { fileName: file.name, fileSize: file.size },
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('collaboration_messages')
        .insert([messageData]);

      if (error) throw error;

      toast.success('File shared successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to share file');
    }
  };

  const startVideoCall = () => {
    setIsVideoCallActive(true);
    toast.success('Video call started');
  };

  const endVideoCall = () => {
    setIsVideoCallActive(false);
    setIsMuted(false);
    setIsCameraOff(false);
    toast.success('Video call ended');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Team Collaboration</h2>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-1" />
                  New Channel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Channel</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Channel name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                  />
                  <Textarea
                    placeholder="Channel description (optional)"
                    value={newChannelDescription}
                    onChange={(e) => setNewChannelDescription(e.target.value)}
                  />
                  <Button onClick={createChannel} className="w-full">
                    Create Channel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6 bg-muted/50 border border-border rounded-lg p-1 mb-6">
              <TabsTrigger value="chat" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                Neural Chat
              </TabsTrigger>
              <TabsTrigger value="holographic" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Video className="h-4 w-4 mr-2" />
                Holographic
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Palette className="h-4 w-4 mr-2" />
                AI Canvas
              </TabsTrigger>
              <TabsTrigger value="voice" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Mic className="h-4 w-4 mr-2" />
                Voice AI
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <CheckSquare className="h-4 w-4 mr-2" />
                Smart Tasks
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Users className="h-4 w-4 mr-2" />
                Team
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {activeTab === 'chat' && (
            <div className="p-2">
              <div className="space-y-2">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      activeChannel?.id === channel.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveChannel(channel)}
                  >
                    <div className="flex items-center space-x-2">
                      <Hash className="h-4 w-4" />
                      <span className="font-medium">{channel.name}</span>
                      {channel.unread_count > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {channel.unread_count}
                        </Badge>
                      )}
                    </div>
                    {channel.last_message && (
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {channel.last_message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="p-2 space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                          <h4 className="font-medium">{task.title}</h4>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {task.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                          <Badge variant="outline" className="text-xs">
                            {task.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="p-2">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar_url} />
                        <AvatarFallback>
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(member.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Main Content - Revolutionary Features */}
      <div className="flex-1 flex flex-col bg-background">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b bg-card p-4">
            <TabsList className="flex w-full gap-1 bg-muted p-1 rounded-lg overflow-x-auto">
              <TabsTrigger 
                value="chat" 
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <MessageSquare className="h-3 w-3" />
                Chat
              </TabsTrigger>
              <TabsTrigger 
                value="holographic" 
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Video className="h-3 w-3" />
                Holographic
              </TabsTrigger>
              <TabsTrigger 
                value="whiteboard" 
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Palette className="h-3 w-3" />
                Whiteboard
              </TabsTrigger>
              <TabsTrigger 
                value="voice" 
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Mic className="h-3 w-3" />
                Voice
              </TabsTrigger>
              <TabsTrigger 
                value="tasks" 
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <CheckSquare className="h-3 w-3" />
                Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm whitespace-nowrap"
              >
                <Users className="h-3 w-3" />
                Team
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="holographic" className="flex-1 p-6">
            <HolographicVideoCall />
          </TabsContent>
          
          <TabsContent value="whiteboard" className="flex-1 p-6">
            <AIWhiteboard />
          </TabsContent>
          
          <TabsContent value="voice" className="flex-1 p-6">
            <VoiceIntelligence />
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1">
            {/* Main Content */}
            {activeChannel ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Hash className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">{activeChannel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {activeChannel.member_count} members
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={startVideoCall}>
                    <Video className="h-4 w-4 mr-1" />
                    Video Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Voice Call
                  </Button>
                  <Button variant="outline" size="sm">
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Video Call Overlay */}
            {isVideoCallActive && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-card p-6 rounded-lg text-center">
                  <div className="mb-4">
                    <Video className="h-16 w-16 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Video Call Active</h3>
                    <p className="text-muted-foreground">Call with {activeChannel.name}</p>
                  </div>
                  <div className="flex items-center justify-center space-x-4">
                    <Button
                      variant={isMuted ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant={isCameraOff ? "destructive" : "outline"}
                      size="sm"
                      onClick={() => setIsCameraOff(!isCameraOff)}
                    >
                      {isCameraOff ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={endVideoCall}>
                      End Call
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={message.id} className="flex space-x-3">
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarImage src={message.sender_avatar} />
                      <AvatarFallback>
                        {message.sender_name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium">{message.sender_name}</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p>{message.content}</p>
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, i) => (
                              <a
                                key={i}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-primary hover:underline"
                              >
                                <Paperclip className="h-4 w-4" />
                                <span>{message.metadata?.fileName || 'Attachment'}</span>
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Message #${activeChannel.name}`}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Welcome to Team Collaboration</h3>
              <p className="text-muted-foreground">
                Select a channel to start collaborating with your team
              </p>
            </div>
          </div>
        )}
          </TabsContent>
          
          <TabsContent value="tasks" className="flex-1 p-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Smart Task Management</h2>
              <p className="text-muted-foreground">AI-powered task creation and management coming soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="flex-1 p-6">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Team Management</h2>
              <div className="grid gap-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge variant={member.status === 'online' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}