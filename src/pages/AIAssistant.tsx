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
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <Bot className="h-10 w-10 text-primary/70" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Hello! I'm your AI assistant
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Ask me anything about your clinic data. I can help with appointments, patients, revenue analytics, and more.
                    </p>
                  </div>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Badge variant="outline" className="bg-primary/5">Analytics</Badge>
                    <Badge variant="outline" className="bg-primary/5">Appointments</Badge>
                    <Badge variant="outline" className="bg-primary/5">Patients</Badge>
                    <Badge variant="outline" className="bg-primary/5">Revenue</Badge>
                  </div>
                </div>
              )}
              
              {messages.map((message) => (
                <div key={message.id} className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex-none">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                        <Bot className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                  
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                    <div className={`relative group ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-card border border-border'
                    } rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200`}>
                      {/* Message content with better typography */}
                      <div className={`prose prose-sm max-w-none ${
                        message.role === 'user' 
                          ? 'prose-invert' 
                          : 'prose-slate dark:prose-invert'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </div>
                      </div>
                      
                      {/* Data sources with improved styling */}
                      {message.data_sources && message.data_sources.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/20">
                          <div className="flex items-center gap-2 mb-2">
                            <Database className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              Data Sources
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {message.data_sources.map((source, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs px-2 py-1 bg-secondary/50 hover:bg-secondary/70 transition-colors"
                              >
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Timestamp with better positioning */}
                      <div className={`mt-3 flex items-center gap-1 ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}>
                        <span className="text-xs text-muted-foreground/70">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="flex-none">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center shadow-md">
                        <User className="h-5 w-5 text-secondary-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex-none">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
                      <Bot className="h-5 w-5 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-1 max-w-[80%]">
                    <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        </div>
                        <span className="text-sm text-muted-foreground">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          {/* Input Area */}
          <div className="p-6 bg-background/50 backdrop-blur-sm">
            {/* Query Type Selector */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={queryType === 'general' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('general')}
                className="text-xs"
              >
                General
              </Button>
              <Button
                variant={queryType === 'data' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('data')}
                className="text-xs"
              >
                <Database className="h-3 w-3 mr-1" />
                Data Query
              </Button>
              <Button
                variant={queryType === 'analytics' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setQueryType('analytics')}
                className="text-xs"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                Analytics
              </Button>
            </div>
            
            {/* Input Field */}
            <div className="flex gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your clinic data..."
                className="flex-1 h-12 px-4 text-sm border-border/50 focus:border-primary/50 bg-background/80"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!input.trim() || isLoading}
                size="default"
                className="h-12 px-6 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAssistant;