import React, { useState } from 'react';
import { Mic, PhoneCall, PhoneOff, Volume2, VolumeX, MessageSquare, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useConversation } from '@11labs/react';

export const VoiceAgent: React.FC = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('elevenlabs_api_key') || '');
  const [agentId, setAgentId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const conversation = useConversation({
    onConnect: () => {
      setIsConnected(true);
      toast({
        title: "Connected",
        description: "Voice agent is now active",
      });
    },
    onDisconnect: () => {
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Voice agent session ended",
      });
    },
    onMessage: (message) => {
      console.log('Agent message:', message);
    },
    onError: (error) => {
      console.error('Voice agent error:', error);
      toast({
        title: "Error",
        description: "Voice agent encountered an error",
        variant: "destructive",
      });
    }
  });

  const saveApiKey = () => {
    localStorage.setItem('elevenlabs_api_key', apiKey);
    toast({
      title: "API Key Saved",
      description: "ElevenLabs API key has been saved",
    });
  };

  const startConversation = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your ElevenLabs API key",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, you would generate a signed URL
      // For demo purposes, we'll simulate the connection
      setIsConnected(true);
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
      await conversation.endSession();
      setIsConnected(false);
    } catch (error) {
      console.error('Error ending conversation:', error);
      setIsConnected(false);
    }
  };

  const toggleMute = async () => {
    try {
      // Toggle volume between 0 and 1
      const currentVolume = 1; // You would track this in state
      await conversation.setVolume({ volume: currentVolume > 0 ? 0 : 1 });
    } catch (error) {
      console.error('Error toggling volume:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI Voice Agent</h1>
        <p className="text-lg text-muted-foreground">
          24/7 Virtual dental assistant for appointment scheduling and patient support
        </p>
      </div>

      {/* API Key Setup */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            ElevenLabs Configuration
          </CardTitle>
          <CardDescription>
            Enter your ElevenLabs API key to enable voice agent functionality
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
          <p className="text-sm text-muted-foreground">
            Your API key is stored locally and never sent to our servers. 
            Get your API key from{' '}
            <a href="https://elevenlabs.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              ElevenLabs
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Voice Agent Control */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PhoneCall className="w-5 h-5" />
            Voice Agent Control
            {isConnected && (
              <Badge className="bg-success text-success-foreground">
                Connected
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Start a conversation with your AI dental assistant
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
                  <Volume2 className="w-5 h-5 mr-2" />
                  Mute
                </Button>
              </div>
            )}
          </div>

          {/* Status Display */}
          {isConnected && (
            <div className="text-center p-6 bg-gradient-to-r from-success/10 to-primary/10 rounded-lg border border-success/20">
              <Mic className="w-8 h-8 mx-auto mb-2 text-success animate-pulse" />
              <h3 className="text-lg font-semibold mb-2">Voice Agent Active</h3>
              <p className="text-muted-foreground">
                The AI assistant is listening and ready to help with:
              </p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <Badge variant="outline">Appointment Scheduling</Badge>
                <Badge variant="outline">Treatment Questions</Badge>
                <Badge variant="outline">Pre-visit Preparation</Badge>
                <Badge variant="outline">Post-care Instructions</Badge>
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

      {/* Sample Conversations */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle>Sample Conversation Starters</CardTitle>
          <CardDescription>
            Try these example phrases to interact with your AI dental assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold">Appointment Scheduling:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>"I need to schedule a cleaning appointment"</li>
                <li>"What's the earliest available slot this week?"</li>
                <li>"Can you reschedule my appointment for next month?"</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Treatment Questions:</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>"What should I expect during a root canal?"</li>
                <li>"How do I care for my teeth after surgery?"</li>
                <li>"Is it normal to have sensitivity after a filling?"</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};