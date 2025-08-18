import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Monitor, 
  Mic, 
  MicOff,
  Camera, 
  CameraOff,
  Send, 
  Paperclip, 
  Bot, 
  User, 
  Clock, 
  Star,
  AlertCircle,
  CheckCircle,
  Zap,
  Search,
  FileText,
  Headphones,
  Settings,
  Shield,
  Users,
  Calendar,
  Download
} from "lucide-react";

interface SupportAgent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'away' | 'offline';
  specialties: string[];
  rating: number;
  responseTime: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'ai';
  message: string;
  timestamp: string;
  type: 'text' | 'file' | 'screen' | 'system';
  attachments?: string[];
}

interface SupportTicket {
  id: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: string;
  created_at: string;
  agent?: string;
}

const TechSupport = () => {
  const { toast } = useToast();
  
  // State management
  const [activeTab, setActiveTab] = useState("chat");
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [supportCategory, setSupportCategory] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  
  // Mock data
  const [supportAgents] = useState<SupportAgent[]>([
    {
      id: "1",
      name: "Sarah Martinez",
      avatar: "/avatars/sarah.jpg",
      status: "online",
      specialties: ["Software Issues", "Account Management", "Billing"],
      rating: 4.9,
      responseTime: "< 2 min"
    },
    {
      id: "2", 
      name: "David Chen",
      avatar: "/avatars/david.jpg",
      status: "online",
      specialties: ["Technical Integration", "API Support", "Database"],
      rating: 4.8,
      responseTime: "< 3 min"
    },
    {
      id: "3",
      name: "Emily Rodriguez", 
      avatar: "/avatars/emily.jpg",
      status: "busy",
      specialties: ["Hardware Issues", "Network Setup", "Security"],
      rating: 4.7,
      responseTime: "< 5 min"
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      sender: "ai",
      message: "Hi! I'm your AI support assistant. I can help you find solutions quickly or connect you with the right specialist. What can I help you with today?",
      timestamp: new Date().toISOString(),
      type: "text"
    }
  ]);

  const [supportTickets] = useState<SupportTicket[]>([
    {
      id: "ST-001",
      title: "Patient data sync issue",
      priority: "high",
      status: "in_progress",
      category: "Software",
      created_at: new Date(Date.now() - 3600000).toISOString(),
      agent: "Sarah Martinez"
    },
    {
      id: "ST-002", 
      title: "Appointment scheduling error",
      priority: "medium",
      status: "open",
      category: "Bug Report",
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  const [knowledgeBase] = useState([
    {
      id: "kb-1",
      title: "How to reset patient passwords",
      category: "Account Management",
      views: 1250,
      helpful: 98
    },
    {
      id: "kb-2",
      title: "Troubleshooting appointment sync issues", 
      category: "Technical",
      views: 890,
      helpful: 95
    },
    {
      id: "kb-3",
      title: "Setting up automated backups",
      category: "Data Management", 
      views: 650,
      helpful: 92
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: "text"
    };

    setChatMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        message: "I understand you're having an issue. Let me search our knowledge base for solutions... Would you like me to connect you with a specialist?",
        timestamp: new Date().toISOString(),
        type: "text"
      };
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const startVideoCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setIsConnected(true);
      setIsCameraOn(true);
      toast({
        title: "Video Call Started",
        description: "Connecting you with a support specialist...",
      });
    } catch (error) {
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to start video call",
        variant: "destructive",
      });
    }
  };

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      setIsScreenSharing(true);
      toast({
        title: "Screen Sharing Active",
        description: "Your screen is now being shared with support",
      });
    } catch (error) {
      toast({
        title: "Screen Share Failed",
        description: "Unable to start screen sharing",
        variant: "destructive",
      });
    }
  };

  const createTicket = () => {
    if (!ticketTitle.trim() || !ticketDescription.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Support Ticket Created",
      description: `Ticket #ST-${Math.random().toString(36).substr(2, 6).toUpperCase()} has been created`,
    });

    // Reset form
    setTicketTitle("");
    setTicketDescription("");
    setSupportCategory("");
    setPriority("medium");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <div className="w-3 h-3 rounded-full bg-green-500" />;
      case 'busy': return <div className="w-3 h-3 rounded-full bg-red-500" />;
      case 'away': return <div className="w-3 h-3 rounded-full bg-yellow-500" />;
      default: return <div className="w-3 h-3 rounded-full bg-gray-500" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tech Support Center</h1>
          <p className="text-muted-foreground mt-1">
            Get instant help from our AI assistant or connect with specialists
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            24/7 Available
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            Avg Response: 2min
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Video Call
          </TabsTrigger>
          <TabsTrigger value="tickets" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="remote" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Remote Assist
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Chat Interface */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Support Assistant
                </CardTitle>
                <CardDescription>
                  Get instant answers or escalate to human specialists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-96 overflow-y-auto border rounded-lg p-4 space-y-3 bg-muted/20">
                  {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${msg.sender === 'user' ? 'order-2' : 'order-1'}`}>
                        <div className={`p-3 rounded-lg ${
                          msg.sender === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : msg.sender === 'ai'
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-background border'
                        }`}>
                          <p className="text-sm">{msg.message}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                      <Avatar className={`w-8 h-8 ${msg.sender === 'user' ? 'order-1' : 'order-2'}`}>
                        <AvatarFallback className={msg.sender === 'ai' ? 'bg-blue-100' : 'bg-primary'}>
                          {msg.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={sendMessage}>
                    <Send className="w-4 h-4" />
                  </Button>
                  <Button variant="outline">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Available Agents */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Available Specialists
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supportAgents.map((agent) => (
                  <div key={agent.id} className="p-3 border rounded-lg space-y-2 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{agent.name}</span>
                          {getStatusIcon(agent.status)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-muted-foreground">{agent.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Response: {agent.responseTime}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {agent.specialties.slice(0, 2).map((spec) => (
                        <Badge key={spec} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                    <Button size="sm" className="w-full" onClick={() => setSelectedAgent(agent)}>
                      Connect
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="video" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Support Session
                </CardTitle>
                <CardDescription>
                  Face-to-face support with screen sharing capabilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  {isConnected ? (
                    <div className="text-center">
                      <div className="w-24 h-24 bg-primary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <User className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-lg font-medium">Connected with Sarah Martinez</p>
                      <p className="text-sm text-muted-foreground">Technical Specialist</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Ready to connect</p>
                      <p className="text-sm text-muted-foreground">Start a video call with our support team</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={startVideoCall}
                    className={isConnected ? "bg-red-500 hover:bg-red-600" : ""}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {isConnected ? "End Call" : "Start Video Call"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsMicOn(!isMicOn)}
                    disabled={!isConnected}
                  >
                    {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCameraOn(!isCameraOn)}
                    disabled={!isConnected}
                  >
                    {isCameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={startScreenShare}
                    disabled={!isConnected}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    {isScreenSharing ? "Stop Sharing" : "Share Screen"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Phone className="w-4 h-4 mr-2" />
                  Schedule Call Back
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download TeamViewer
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  System Diagnostics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
                <CardDescription>Track and manage your support requests</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ticket.title}</span>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">#{ticket.id}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Category: {ticket.category}</span>
                      <span>Status: {ticket.status}</span>
                      {ticket.agent && <span>Agent: {ticket.agent}</span>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Created: {new Date(ticket.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create New Ticket</CardTitle>
                <CardDescription>Submit a support request</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={supportCategory} onValueChange={setSupportCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="software">Software Issue</SelectItem>
                      <SelectItem value="hardware">Hardware Problem</SelectItem>
                      <SelectItem value="account">Account Support</SelectItem>
                      <SelectItem value="billing">Billing Question</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="bug">Bug Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Brief description of the issue"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Detailed description of the issue..."
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={createTicket} className="w-full">
                  Create Ticket
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Knowledge Base
              </CardTitle>
              <CardDescription>
                Find instant answers to common questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Search knowledge base..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {knowledgeBase.map((article) => (
                  <Card key={article.id} className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">{article.title}</h3>
                        <Badge variant="outline">{article.category}</Badge>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{article.views} views</span>
                          <span>{article.helpful}% helpful</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="remote" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Remote Assistance
              </CardTitle>
              <CardDescription>
                Allow our technicians to securely access your system for direct support
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900">Secure Connection</span>
                    </div>
                    <p className="text-sm text-blue-800">
                      All remote sessions are encrypted and monitored. You maintain full control and can disconnect at any time.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">Remote Session Options:</h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch id="view-only" />
                        <Label htmlFor="view-only">View-only mode</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="file-transfer" />
                        <Label htmlFor="file-transfer">Allow file transfer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="system-control" />
                        <Label htmlFor="system-control">Allow system control</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Monitor className="w-4 h-4 mr-2" />
                        Start Remote Session
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Start Remote Assistance</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will generate a secure connection code that you can share with our support technician. 
                          The session will be encrypted and you can end it at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction>Generate Connection Code</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Remote Assistant App
                  </Button>

                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Connection Code</p>
                    <p className="text-2xl font-mono font-bold">ABC-123-XYZ</p>
                    <p className="text-xs text-muted-foreground mt-1">Valid for 15 minutes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechSupport;