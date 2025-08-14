import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import { useTenant } from '@/contexts/TenantContext';
import { Send, Bot, User, Loader2, Database, BarChart3, Users, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data_sources?: string[];
}

const AIAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [queryType, setQueryType] = useState<'data' | 'analytics' | 'general'>('general');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { userRole, isSuperAdmin } = useRoleAccess();
  const { currentTenant } = useTenant();

  const quickQueries = [
    { text: "Show me today's appointments", type: 'data' as const, icon: Calendar },
    { text: "Patient statistics this month", type: 'analytics' as const, icon: BarChart3 },
    { text: "Active staff members", type: 'data' as const, icon: Users },
    { text: "Revenue trends", type: 'analytics' as const, icon: BarChart3 },
    { text: "Overdue invoices", type: 'data' as const, icon: Database },
  ];

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the AI assistant edge function
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: input.trim(),
          queryType,
          tenantId: currentTenant?.id,
          userRole,
          isSuperAdmin,
        },
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I apologize, but I cannot process your request at the moment. Please ensure the OpenAI API key is configured.',
        timestamp: new Date(),
        data_sources: data.data_sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, but I cannot process your request at the moment. The AI assistant service may not be available or properly configured.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "AI Assistant Error",
        description: "Unable to process your request. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuery = (query: string, type: typeof queryType) => {
    setInput(query);
    setQueryType(type);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-none">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">AI Assistant</h1>
            <p className="text-muted-foreground">
              Ask questions about your {isSuperAdmin ? 'corporate' : 'clinic'} data and get instant insights
            </p>
          </div>
          <Badge variant="outline" className="bg-primary/10">
            {isSuperAdmin ? 'Corporate Level' : 'Clinic Level'}
          </Badge>
        </div>

        {/* Quick Query Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
          {quickQueries.map((query, index) => {
            const Icon = query.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 flex flex-col items-center gap-2"
                onClick={() => handleQuickQuery(query.text, query.type)}
              >
                <Icon className="h-4 w-4" />
                <span className="text-xs text-center">{query.text}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        <CardHeader className="flex-none">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Chat with AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Hello! I'm your AI assistant. Ask me anything about your clinic data.</p>
                  <p className="text-sm mt-2">Try asking about appointments, patients, revenue, or analytics.</p>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-none">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                        <Bot className="h-4 w-4 text-secondary-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="bg-card border rounded-lg p-3">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      {message.data_sources && message.data_sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t">
                          <p className="text-xs text-muted-foreground mb-1">Data sources:</p>
                          <div className="flex flex-wrap gap-1">
                            {message.data_sources.map((source, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-card border rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          {/* Input Area */}
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your clinic data..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant={queryType === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('general')}
              >
                General
              </Button>
              <Button
                variant={queryType === 'data' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('data')}
              >
                Data Query
              </Button>
              <Button
                variant={queryType === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('analytics')}
              >
                Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;