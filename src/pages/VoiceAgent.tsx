import React, { useState, useEffect } from 'react';
import { Mic, PhoneCall, PhoneOff, Volume2, VolumeX, MessageSquare, Bot, Key, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface VoiceAgentProps {}

export const VoiceAgent: React.FC<VoiceAgentProps> = () => {
  const { t } = useLanguage();
  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
  const [agentId, setAgentId] = useState('dental-assistant-001');
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<Array<{id: string, message: string, sender: 'user' | 'agent', timestamp: Date}>>([]);
  const { toast } = useToast();

  // Mock conversation functionality since ElevenLabs integration requires API setup
  const mockConversation = {
    startSession: async () => {
      setIsConnected(true);
      setIsListening(true);
      
      // Add welcome message
      setConversationHistory(prev => [...prev, {
        id: Date.now().toString(),
        message: "Hello! I'm your dental AI assistant. How can I help you today?",
        sender: 'agent',
        timestamp: new Date()
      }]);

      return 'mock-session-id';
    },
    
    endSession: async () => {
      setIsConnected(false);
      setIsListening(false);
      
      setConversationHistory(prev => [...prev, {
        id: Date.now().toString(),
        message: "Thank you for using the dental AI assistant. Have a great day!",
        sender: 'agent',
        timestamp: new Date()
      }]);
    },
    
    setVolume: async ({ volume }: { volume: number }) => {
      toast({
        title: volume > 0 ? "Unmuted" : "Muted",
        description: `Voice agent ${volume > 0 ? 'unmuted' : 'muted'}`,
      });
    }
  };

  const saveApiKey = () => {
    localStorage.setItem('elevenlabs_api_key', apiKey);
    toast({
      title: "API Key Saved",
      description: "ElevenLabs API key has been saved locally",
    });
  };

  const startConversation = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key to start the voice agent",
        variant: "destructive",
      });
      return;
    }

    try {
      await mockConversation.startSession();
      toast({
        title: "Voice Agent Started",
        description: "You can now speak with the dental AI assistant",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to voice agent",
        variant: "destructive",
      });
    }
  };

  const endConversation = async () => {
    try {
      await mockConversation.endSession();
      toast({
        title: "Session Ended",
        description: "Voice agent session has been terminated",
      });
    } catch (error) {
      console.error('Error ending conversation:', error);
      setIsConnected(false);
      setIsListening(false);
    }
  };

  const toggleMute = async () => {
    try {
      const newVolume = isListening ? 0 : 1;
      await mockConversation.setVolume({ volume: newVolume });
      setIsListening(!isListening);
    } catch (error) {
      console.error('Error toggling volume:', error);
    }
  };

  const simulateUserQuery = (query: string) => {
    setConversationHistory(prev => [...prev, {
      id: Date.now().toString(),
      message: query,
      sender: 'user',
      timestamp: new Date()
    }]);

    // Simulate AI response
    setTimeout(() => {
      const responses = {
        "schedule appointment": "I'd be happy to help you schedule an appointment. What day and time would work best for you?",
        "tooth pain": "I understand you're experiencing tooth pain. This could be due to several factors. I recommend scheduling an urgent appointment with Dr. Wilson. In the meantime, you can take over-the-counter pain medication and avoid very hot or cold foods.",
        "cleaning": "Regular dental cleanings are important for maintaining oral health. We recommend cleanings every 6 months. Would you like to schedule your next cleaning?",
        "cost": "Dental treatment costs vary depending on the procedure. I can provide estimates for common treatments or connect you with our billing department for specific cost information."
      };

      const responseKey = Object.keys(responses).find(key => query.toLowerCase().includes(key));
      const response = responseKey ? responses[responseKey as keyof typeof responses] : "I understand your concern. Let me connect you with the appropriate team member who can better assist you with your specific needs.";

      setConversationHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        message: response,
        sender: 'agent',
        timestamp: new Date()
      }]);
    }, 1500);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">{t('voiceAgent.title', 'AI Voice Agent')}</h1>
        <p className="text-lg text-muted-foreground">
          {t('voiceAgent.description', '24/7 Virtual dental assistant for appointment scheduling and patient support')}
        </p>
      </div>

      {/* API Key Setup */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {t('voiceAgent.apiConfiguration', 'ElevenLabs Configuration')}
          </CardTitle>
          <CardDescription>
            {t('voiceAgent.apiDescription', 'Enter your ElevenLabs API key to enable voice agent functionality')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="password"
              placeholder="Enter your ElevenLabs API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1"
            />
            <Button onClick={saveApiKey} variant="outline">
              Save Key
            </Button>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">Get your ElevenLabs API key:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>Sign up at <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="underline">elevenlabs.io</a></li>
                <li>Navigate to your profile settings</li>
                <li>Generate an API key in the API section</li>
                <li>Copy and paste it above</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Voice Agent Control */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5" />
            {t('voiceAgent.controlTitle', 'Voice Agent Control')}
            {isConnected && (
              <Badge className="bg-success text-success-foreground">
                Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {t('voiceAgent.controlDescription', 'Start a conversation with your AI dental assistant')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4">
            {!isConnected ? (
              <Button
                onClick={startConversation}
                disabled={!apiKey}
                size="lg"
                className="btn-gradient"
              >
                <PhoneCall className="w-5 h-5 mr-2" />
                Start Voice Session
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={endConversation}
                  variant="destructive"
                  size="lg"
                >
                  <PhoneOff className="w-5 h-5 mr-2" />
                  End Session
                </Button>
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="lg"
                >
                  {isListening ? (
                    <>
                      <VolumeX className="w-5 h-5 mr-2" />
                      Mute
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-5 h-5 mr-2" />
                      Unmute
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Status Display */}
          {isConnected && (
            <div className="text-center p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20">
              <Mic className={`w-8 h-8 mx-auto mb-2 text-success ${isListening ? 'animate-pulse' : ''}`} />
              <h3 className="text-lg font-semibold mb-2">Voice Agent Active</h3>
              <p className="text-muted-foreground">
                {isListening ? 'Listening for your voice...' : 'Muted - click unmute to continue'}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge variant="outline">Appointment Scheduling</Badge>
                <Badge variant="outline">Treatment Questions</Badge>
                <Badge variant="outline">Pre-visit Preparation</Badge>
                <Badge variant="outline">Post-care Instructions</Badge>
              </div>
            </div>
          )}

          {/* Demo Conversation Buttons */}
          {isConnected && (
            <div className="space-y-3">
              <h4 className="font-medium text-center">Try these demo interactions:</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateUserQuery("I need to schedule an appointment")}
                >
                  Schedule Appointment
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateUserQuery("I have tooth pain")}
                >
                  Tooth Pain Query
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateUserQuery("When should I get a cleaning?")}
                >
                  Cleaning Question
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => simulateUserQuery("How much does treatment cost?")}
                >
                  Cost Inquiry
                </Button>
              </div>
            </div>
          )}

          {/* Conversation History */}
          {conversationHistory.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Conversation History:</h4>
              <div className="max-h-64 overflow-y-auto space-y-2 p-4 bg-muted/50 rounded-lg">
                {conversationHistory.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PhoneCall className="w-5 h-5 text-primary" />
              24/7 Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Always-on virtual assistant for patient inquiries and emergency support
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-secondary" />
              Smart Scheduling
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              AI-powered appointment booking with automatic calendar integration
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="w-5 h-5 text-info" />
              Medical Guidance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Answers common dental questions and provides pre/post-care instructions
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="w-5 h-5 text-warning" />
              Natural Speech
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Human-like conversation with emotional intelligence and empathy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};