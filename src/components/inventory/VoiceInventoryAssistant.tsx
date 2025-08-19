import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, MicOff, Volume2, VolumeX, Bot, Zap, Package, 
  Search, Plus, ShoppingCart, AlertTriangle, Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface VoiceCommand {
  id: string;
  command: string;
  action: string;
  timestamp: Date;
  status: 'processing' | 'completed' | 'failed';
  result?: string;
}

interface AIResponse {
  text: string;
  action?: 'search' | 'add_item' | 'create_order' | 'check_stock' | 'get_analytics';
  data?: any;
  confidence: number;
}

export function VoiceInventoryAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState<VoiceCommand[]>([]);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    // Initialize Web Speech API
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

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
  }, []);

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
      }, 5000);
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
      status: 'processing'
    };
    
    setCommands(prev => [newCommand, ...prev.slice(0, 4)]);

    try {
      // Simulate AI processing with more sophisticated responses
      const response = await simulateAIProcessing(command);
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

  const simulateAIProcessing = async (command: string): Promise<AIResponse> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const lowerCommand = command.toLowerCase();

    // Advanced command recognition
    if (lowerCommand.includes('search') || lowerCommand.includes('find') || lowerCommand.includes('look for')) {
      const item = extractItemName(lowerCommand);
      return {
        text: `I found ${Math.floor(Math.random() * 50) + 10} units of ${item} in stock. Current location: Storage Room A, Shelf 3. Would you like me to show more details?`,
        action: 'search',
        data: { item, quantity: Math.floor(Math.random() * 50) + 10 },
        confidence: 92
      };
    }

    if (lowerCommand.includes('add') || lowerCommand.includes('create') || lowerCommand.includes('new item')) {
      const item = extractItemName(lowerCommand);
      return {
        text: `I'll help you add ${item} to the inventory. Setting up the item with default parameters. You can modify the details in the form that's opening.`,
        action: 'add_item',
        data: { item },
        confidence: 88
      };
    }

    if (lowerCommand.includes('order') || lowerCommand.includes('purchase') || lowerCommand.includes('reorder')) {
      return {
        text: `I've identified 3 items that need reordering: dental gloves, composite resin, and impression material. Total estimated cost: $847. Shall I create the purchase orders?`,
        action: 'create_order',
        data: { items: ['dental gloves', 'composite resin', 'impression material'], cost: 847 },
        confidence: 95
      };
    }

    if (lowerCommand.includes('stock') || lowerCommand.includes('inventory') || lowerCommand.includes('how much')) {
      return {
        text: `Current inventory status: 89% stocked. 3 items are below reorder point, 2 items expire within 30 days. Overall inventory value: $47,382.`,
        action: 'check_stock',
        data: { stockLevel: 89, lowStock: 3, expiring: 2, value: 47382 },
        confidence: 97
      };
    }

    if (lowerCommand.includes('analytics') || lowerCommand.includes('report') || lowerCommand.includes('insights')) {
      return {
        text: `This month's inventory insights: Usage increased 12% compared to last month. Top consumed items are dental gloves and composite materials. Predicted savings of $1,200 through bulk purchasing.`,
        action: 'get_analytics',
        data: { growth: 12, savings: 1200 },
        confidence: 91
      };
    }

    if (lowerCommand.includes('lab') || lowerCommand.includes('laboratory')) {
      return {
        text: `You have 4 active lab orders. 2 are in progress, 1 is ready for pickup, and 1 is being shipped. Estimated completion for all orders is within 3 days.`,
        action: 'check_stock',
        data: { activeOrders: 4, inProgress: 2, ready: 1, shipping: 1 },
        confidence: 94
      };
    }

    // Default response for unrecognized commands
    return {
      text: `I didn't quite understand that command. I can help you search inventory, add new items, create orders, check stock levels, get analytics, or manage lab orders. Try saying "search for dental gloves" or "show me inventory analytics".`,
      confidence: 60
    };
  };

  const extractItemName = (command: string): string => {
    // Simple item extraction - in real implementation, use NLP
    const items = ['dental gloves', 'composite resin', 'impression material', 'fluoride varnish', 'local anesthetic'];
    for (const item of items) {
      if (command.toLowerCase().includes(item)) {
        return item;
      }
    }
    return 'dental supplies';
  };

  const getCommandIcon = (action: string) => {
    switch (action) {
      case 'search': return <Search className="w-4 h-4" />;
      case 'add_item': return <Plus className="w-4 h-4" />;
      case 'create_order': return <ShoppingCart className="w-4 h-4" />;
      case 'check_stock': return <Package className="w-4 h-4" />;
      case 'get_analytics': return <Zap className="w-4 h-4" />;
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
          <Bot className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Voice Inventory Assistant</h2>
          <p className="text-muted-foreground">Speak naturally to manage your inventory</p>
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
                className={`w-24 h-24 rounded-full ${
                  isListening 
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                    : 'bg-gradient-primary hover:shadow-glow'
                } text-primary-foreground transition-all duration-300`}
              >
                {isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              {/* Audio Level Indicator */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping" />
              )}
            </div>

            {/* Status and Audio Level */}
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-4">
                <Badge variant={isListening ? 'destructive' : 'outline'}>
                  {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
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
                </div>
              </div>

              {/* Audio Level Visualization */}
              {isListening && (
                <div className="w-64">
                  <Progress value={audioLevel} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">Voice Activity</p>
                </div>
              )}

              {/* Current Transcript */}
              {transcript && (
                <div className="max-w-md p-3 bg-accent/10 rounded-lg">
                  <p className="text-sm">{transcript}</p>
                </div>
              )}
            </div>

            {/* Quick Commands */}
            <div className="w-full max-w-2xl">
              <p className="text-sm font-medium mb-3 text-center">Try saying:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  '"Search for dental gloves"',
                  '"Add composite resin to inventory"',
                  '"Create purchase order"',
                  '"Check stock levels"',
                  '"Show me analytics"',
                  '"Lab order status"'
                ].map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => processVoiceCommand(example.replace(/"/g, ''))}
                    className="text-left justify-start"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Response */}
      {aiResponse && (
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-accent" />
              AI Assistant Response
              <Badge variant="outline">
                {aiResponse.confidence}% confidence
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-foreground">{aiResponse.text}</p>
              
              {aiResponse.action && aiResponse.data && (
                <div className="p-3 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {getCommandIcon(aiResponse.action)}
                    <span className="font-medium">Action: {aiResponse.action.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <pre className="text-xs text-muted-foreground">
                    {JSON.stringify(aiResponse.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Commands */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Commands
          </CardTitle>
          <CardDescription>
            Your voice command history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {commands.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No commands yet. Start by saying something!
              </p>
            ) : (
              commands.map((command) => (
                <div key={command.id} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    {getCommandIcon(command.action)}
                    <Badge variant={getStatusColor(command.status) as any}>
                      {command.status}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{command.command}</p>
                    {command.result && (
                      <p className="text-xs text-muted-foreground mt-1">{command.result}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {command.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}