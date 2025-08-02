import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, 
  Camera, 
  Star, 
  Gift, 
  Calendar, 
  FileText, 
  Trophy,
  Users,
  Target,
  Phone,
  Mail,
  Bell
} from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface LoyaltyReward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  category: 'treatment' | 'product' | 'experience';
  available: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export default function PatientConcierge() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your AI dental assistant. How can I help you today?' },
    { type: 'user', text: 'When is my next appointment?' },
    { type: 'bot', text: 'Your next appointment is scheduled for March 15, 2024 at 2:00 PM with Dr. Smith for your crown placement. Would you like me to send you a reminder?' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const loyaltyRewards: LoyaltyReward[] = [
    {
      id: '1',
      title: 'Free Teeth Whitening',
      description: 'Professional in-office whitening treatment',
      pointsCost: 500,
      category: 'treatment',
      available: true
    },
    {
      id: '2',
      title: 'Electric Toothbrush',
      description: 'Premium sonic toothbrush with multiple settings',
      pointsCost: 300,
      category: 'product',
      available: true
    },
    {
      id: '3',
      title: 'Spa Day Package',
      description: 'Relaxing spa experience at partner location',
      pointsCost: 800,
      category: 'experience',
      available: false
    }
  ];

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Perfect Attendance',
      description: 'Attend 12 consecutive appointments',
      icon: '📅',
      completed: false,
      progress: 8,
      maxProgress: 12
    },
    {
      id: '2',
      title: 'Referral Champion',
      description: 'Refer 5 friends to the practice',
      icon: '👥',
      completed: true,
      progress: 5,
      maxProgress: 5
    },
    {
      id: '3',
      title: 'Health Enthusiast',
      description: 'Complete 4 preventive care visits this year',
      icon: '🦷',
      completed: false,
      progress: 3,
      maxProgress: 4
    }
  ];

  const sendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { type: 'user', text: newMessage }]);
      setNewMessage('');
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: 'I understand your question. Let me help you with that. Is there anything specific you\'d like to know about your treatment plan or upcoming appointments?' 
        }]);
      }, 1000);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Patient AI Concierge</h1>
        <p className="text-lg text-muted-foreground">
          Your personal dental assistant with AI-powered insights and loyalty rewards
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="chat">AI Assistant</TabsTrigger>
          <TabsTrigger value="insights">My Insights</TabsTrigger>
          <TabsTrigger value="loyalty">Loyalty & Rewards</TabsTrigger>
          <TabsTrigger value="progress">Treatment Progress</TabsTrigger>
        </TabsList>

        {/* AI Chat Assistant */}
        <TabsContent value="chat" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  AI Chat Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="h-80 border rounded-lg p-4 bg-gray-50 overflow-y-auto">
                  {messages.map((msg, index) => (
                    <div key={index} className={`mb-3 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <span className={`inline-block p-3 rounded-lg max-w-xs ${
                        msg.type === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-white border shadow-sm'
                      }`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ask about your treatment, appointments, or dental care..." 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage}>Send</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Practice
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  View Treatment Plan
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="w-4 h-4 mr-2" />
                  Upload Photos
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Message Doctor
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patient Insights */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  My X-Ray Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-8 bg-blue-50 rounded-lg">
                  <Camera className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                  <p className="font-medium mb-2">Latest X-ray Analysis</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    AI found 2 areas that need attention but overall oral health is good
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span>Overall Health Score</span>
                      <span className="font-bold">8.2/10</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  <Button>View Detailed Report</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Treatment Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                  <p className="font-medium text-green-800">Excellent Oral Hygiene</p>
                  <p className="text-sm text-green-700">Keep up the great work with daily brushing and flossing!</p>
                </div>
                <div className="p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
                  <p className="font-medium text-yellow-800">Schedule Cleaning</p>
                  <p className="text-sm text-yellow-700">Your next cleaning is due in 2 weeks</p>
                </div>
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <p className="font-medium text-blue-800">Consider Whitening</p>
                  <p className="text-sm text-blue-700">Professional whitening could enhance your smile</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Loyalty & Rewards */}
        <TabsContent value="loyalty" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6 text-center">
                <Star className="w-12 h-12 mx-auto mb-3 text-yellow-500" />
                <p className="text-3xl font-bold">850</p>
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gold" />
                <p className="text-3xl font-bold">Gold</p>
                <p className="text-sm text-muted-foreground">Member Status</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <p className="text-3xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Referrals Made</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Available Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loyaltyRewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{reward.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="font-medium">{reward.pointsCost} points</span>
                      </div>
                      <Badge className={reward.category === 'treatment' ? 'bg-blue-100 text-blue-800' : 
                                     reward.category === 'product' ? 'bg-green-100 text-green-800' : 
                                     'bg-purple-100 text-purple-800'}>
                        {reward.category}
                      </Badge>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full"
                      disabled={!reward.available || reward.pointsCost > 850}
                    >
                      {reward.available ? 'Redeem' : 'Not Available'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{achievement.title}</h4>
                        {achievement.completed && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="flex-1 h-2" />
                        <span className="text-xs text-muted-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Progress */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Treatment Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">95%</p>
                  <p className="text-sm text-muted-foreground">Treatment Complete</p>
                  <Progress value={95} className="mt-2 h-3" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Initial Consultation</span>
                    <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span className="text-sm">Root Canal Treatment</span>
                    <Badge className="bg-green-100 text-green-800">✓ Complete</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm">Crown Placement</span>
                    <Badge className="bg-blue-100 text-blue-800">Next: Mar 15</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">Follow-up Visit</span>
                    <Badge variant="outline">Pending</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Oral Health Tracking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Brushing Frequency</span>
                    <span className="text-sm font-medium">2.1x daily</span>
                  </div>
                  <Progress value={88} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Flossing Consistency</span>
                    <span className="text-sm font-medium">6/7 days</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Gum Health Score</span>
                    <span className="text-sm font-medium">Excellent</span>
                  </div>
                  <Progress value={94} className="h-2" />
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <p className="text-sm font-medium text-blue-800">Health Tip</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Great job maintaining your oral health! Consider using an antimicrobial mouthwash for even better results.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}