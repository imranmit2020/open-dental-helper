import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, MicOff, Volume2, VolumeX, Bot, Zap, Package, 
  Search, Plus, ShoppingCart, AlertTriangle, Clock,
  Play, Pause, RotateCcw, Settings, Headphones
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  timestamp: Date;
  status: 'processing' | 'completed' | 'failed';
  result?: string;
  confidence: number;
}

interface AIResponse {
  text: string;
  action?: 'search_order' | 'create_order' | 'update_status' | 'check_quality' | 'schedule_pickup';
  data?: any;
  confidence: number;
}

export function VoiceLabAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [voiceSettings, setVoiceSettings] = useState({
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    language: 'en-US'
  });
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = voiceSettings.language;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(finalTranscript);
          processVoiceCommand(finalTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };
    }

    speechSynthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (speechSynthesisRef.current) {
        speechSynthesisRef.current.cancel();
      }
    };
  }, [voiceSettings.language]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      setTranscript('');
      recognitionRef.current.start();
      
      // Simulate audio level for visual feedback
      const interval = setInterval(() => {
        setAudioLevel(Math.random() * 100);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        setAudioLevel(0);
      }, 10000);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAudioLevel(0);
    }
  };

  const speak = (text: string) => {
    if (speechSynthesisRef.current && text) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = voiceSettings.speed;
      utterance.pitch = voiceSettings.pitch;
      utterance.volume = voiceSettings.volume;
      utterance.lang = voiceSettings.language;
      
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    const newCommand: VoiceCommand = {
      id: Date.now().toString(),
      command,
      action: 'processing',
      timestamp: new Date(),
      status: 'processing',
      confidence: Math.random() * 20 + 80
    };
    
    setCommands(prev => [newCommand, ...prev.slice(0, 9)]);

    try {
      // Simulate AI processing with lab-specific responses
      const response = await simulateLabAIProcessing(command);
      setAiResponse(response);

      // Update command status
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id 
          ? { ...cmd, status: 'completed', result: response.text }
          : cmd
      ));

      // Speak the response
      speak(response.text);

    } catch (error) {
      console.error('Error processing voice command:', error);
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id 
          ? { ...cmd, status: 'failed', result: 'Failed to process command' }
          : cmd
      ));
      toast.error('Failed to process voice command');
    } finally {
      setIsProcessing(false);
    }
  };

  const simulateLabAIProcessing = async (command: string): Promise<AIResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const lowerCommand = command.toLowerCase();

    // Lab-specific command recognition
    if (lowerCommand.includes('status') || lowerCommand.includes('order') || lowerCommand.includes('find')) {
      const orderNumber = extractOrderNumber(lowerCommand);
      return {
        text: `I found order ${orderNumber}. The ceramic crown for John Smith is currently in the quality testing phase, 85% complete. Expected delivery is February 20th. Quality score is 96.5%. Would you like more details?`,
        action: 'search_order',
        data: { orderNumber, status: 'quality_testing', progress: 85 },
        confidence: 94
      };
    }

    if (lowerCommand.includes('create') || lowerCommand.includes('new order') || lowerCommand.includes('add order')) {
      return {
        text: `I'll help you create a new lab order. I've opened the order form with default parameters for a ceramic crown. Please specify the patient name and any special requirements.`,
        action: 'create_order',
        data: { type: 'crown', material: 'ceramic' },
        confidence: 91
      };
    }

    if (lowerCommand.includes('quality') || lowerCommand.includes('test') || lowerCommand.includes('inspection')) {
      return {
        text: `Current quality metrics show: 3 orders in testing phase, average quality score of 94.2%. Order LAB-001 passed all tests with 96.5% score. Order LAB-002 needs minor adjustment on surface finish.`,
        action: 'check_quality',
        data: { averageScore: 94.2, inTesting: 3, passedToday: 5 },
        confidence: 97
      };
    }

    if (lowerCommand.includes('pickup') || lowerCommand.includes('delivery') || lowerCommand.includes('schedule')) {
      return {
        text: `I've scheduled pickups for tomorrow at 2 PM. Orders LAB-001 and LAB-003 are ready for collection. I've sent notifications to the dental office. Tracking numbers have been generated.`,
        action: 'schedule_pickup',
        data: { scheduledTime: '2 PM tomorrow', readyOrders: ['LAB-001', 'LAB-003'] },
        confidence: 89
      };
    }

    if (lowerCommand.includes('materials') || lowerCommand.includes('inventory') || lowerCommand.includes('stock')) {
      return {
        text: `Current material levels: Ceramic blocks - 89% stock, Zirconia blanks - 67% stock, Titanium rods - 45% stock (reorder recommended). Delivery expected Thursday for titanium supplies.`,
        action: 'check_quality',
        data: { ceramic: 89, zirconia: 67, titanium: 45 },
        confidence: 95
      };
    }

    if (lowerCommand.includes('help') || lowerCommand.includes('what can you do')) {
      return {
        text: `I can help you with lab orders, quality checks, scheduling pickups, checking material levels, updating order status, and tracking deliveries. Try saying "check order status," "schedule a pickup," or "what's our quality score today."`,
        confidence: 99
      };
    }

    // Default response for unrecognized commands
    return {
      text: `I'm not sure I understood that command. I can help with lab orders, quality checks, scheduling, and material inventory. Try being more specific, like "check order LAB-001 status" or "schedule pickup for ready orders."`,
      confidence: 60
    };
  };

  const extractOrderNumber = (command: string): string => {
    const orderMatch = command.match(/lab[- ]?(\d+)/i);
    if (orderMatch) {
      return `LAB-${orderMatch[1].padStart(3, '0')}`;
    }
    return 'LAB-001'; // Default
  };

  const getCommandIcon = (action: string) => {
    switch (action) {
      case 'search_order': return <Search className="w-4 h-4" />;
      case 'create_order': return <Plus className="w-4 h-4" />;
      case 'update_status': return <Clock className="w-4 h-4" />;
      case 'check_quality': return <ShoppingCart className="w-4 h-4" />;
      case 'schedule_pickup': return <Package className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'secondary';
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <Headphones className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Voice Lab Assistant</h2>
          <p className="text-muted-foreground">AI-powered voice control for lab operations</p>
        </div>
      </div>

      {/* Voice Controls */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Main Voice Button */}
            <div className="relative">
              <Button
                size="lg"
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`w-32 h-32 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg shadow-red-500/50' 
                    : 'bg-gradient-primary hover:shadow-glow'
                } text-primary-foreground transition-all duration-300`}
              >
                {isListening ? (
                  <MicOff className="w-12 h-12" />
                ) : (
                  <Mic className="w-12 h-12" />
                )}
              </Button>
              
              {/* Audio Level Indicator */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
              )}
            </div>

            {/* Status and Controls */}
            <div className="text-center space-y-4 w-full max-w-lg">
              <div className="flex items-center justify-center gap-4">
                <Badge variant={isListening ? 'destructive' : isProcessing ? 'secondary' : 'outline'}>
                  {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready to assist'}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={isSpeaking ? stopSpeaking : undefined}
                    disabled={!isSpeaking}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Audio Level Visualization */}
              {isListening && (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-red-500 rounded-full transition-all duration-75"
                        style={{
                          width: '3px',
                          height: `${Math.max(4, (audioLevel * 0.8 + Math.random() * 20))}px`,
                          opacity: audioLevel > (i * 5) ? 1 : 0.3
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Voice Activity Detected</p>
                </div>
              )}

              {/* Current Transcript */}
              {transcript && (
                <div className="max-w-md p-4 bg-accent/10 rounded-lg border">
                  <p className="text-sm font-medium mb-1">You said:</p>
                  <p className="text-sm">{transcript}</p>
                </div>
              )}
            </div>

            {/* Lab-Specific Quick Commands */}
            <div className="w-full max-w-3xl">
              <p className="text-sm font-medium mb-4 text-center">Lab Commands - Try saying:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  '"Check order LAB-001 status"',
                  '"Create new crown order"',
                  '"What\'s our quality score today?"',
                  '"Schedule pickup for ready orders"',
                  '"Check material inventory"',
                  '"Update order LAB-002 to completed"',
                  '"When is the next delivery?"',
                  '"Show orders in testing phase"',
                  '"Generate quality report"'
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => processVoiceCommand(example.replace(/"/g, ''))}
                    className="text-left justify-start text-xs p-2 h-auto"
                    disabled={isProcessing || isListening}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Response Display */}
      {aiResponse && (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              Lab Assistant Response
              <Badge variant="outline">
                {aiResponse.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-accent/10 rounded-lg">
                <p className="text-foreground">{aiResponse.text}</p>
              </div>
              
              {aiResponse.action && aiResponse.data && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getCommandIcon(aiResponse.action)}
                    <span className="font-medium">Action: {aiResponse.action.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <pre className="whitespace-pre-wrap">{JSON.stringify(aiResponse.data, null, 2)}</pre>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => speak(aiResponse.text)}>
                  <Volume2 className="w-4 h-4 mr-1" />
                  Repeat
                </Button>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-1" />
                  Take Action
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Command History */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Voice Commands
          </CardTitle>
          <CardDescription>
            Your voice interaction history with the lab assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commands.length === 0 ? (
              <div className="text-center py-8">
                <Mic className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No voice commands yet.</p>
                <p className="text-sm text-muted-foreground">Start by clicking the microphone button!</p>
              </div>
            ) : (
              commands.map((command) => (
                <div key={command.id} className="flex items-start gap-3 p-4 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getCommandIcon(command.action)}
                    <Badge variant={getStatusColor(command.status) as any}>
                      {command.status}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{command.command}</p>
                    {command.result && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{command.result}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted-foreground">
                        {command.timestamp.toLocaleTimeString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {command.confidence.toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => speak(command.result || command.command)}>
                      <Volume2 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => processVoiceCommand(command.command)}>
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-y-4 flex-col">
              <div className="relative">
                <Bot className="w-12 h-12 text-primary animate-pulse" />
                <div className="absolute -top-1 -right-1">
                  <Zap className="w-4 h-4 text-accent animate-bounce" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">Processing Voice Command</h3>
                <p className="text-muted-foreground">AI is analyzing your request...</p>
              </div>
              <Progress value={75} className="w-full max-w-xs h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}