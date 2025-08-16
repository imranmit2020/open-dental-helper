import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Zap, FileText, Brain, Clock, Loader2, Lightbulb, PlusCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SmartDocumentationSkeleton from "@/components/SmartDocumentationSkeleton";

export default function SmartDocumentation() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [specialty, setSpecialty] = useState("general dentistry");
  const [activeTab, setActiveTab] = useState("compose");
  const { toast } = useToast();

  const specialties = [
    "general dentistry",
    "orthodontics", 
    "periodontics",
    "endodontics",
    "oral surgery",
    "pediatric dentistry",
    "prosthodontics"
  ];

  const templates = [
    { name: "Routine Cleaning", text: "Patient presents for routine prophylaxis and examination." },
    { name: "Dental Restoration", text: "Tooth #14 requires composite restoration due to caries." },
    { name: "Orthodontic Consultation", text: "Patient evaluated for orthodontic treatment planning." },
    { name: "Periodontal Assessment", text: "Comprehensive periodontal examination and pocket depth measurements." },
    { name: "Endodontic Treatment", text: "Root canal therapy initiated on tooth #3." }
  ];

  useEffect(() => {
    setPageLoading(false);
  }, []);

  const handleAIAction = async (action: string) => {
    if (!text.trim() && action !== 'template') {
      toast({
        title: "Input Required",
        description: "Please enter some text first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smart-documentation', {
        body: {
          text: text.trim(),
          action,
          specialty
        },
      });

      if (error) throw error;

      setResult(data.result);
      toast({
        title: "AI Assistance Complete",
        description: `Successfully ${action === 'complete' ? 'completed' : action === 'suggest' ? 'generated suggestions for' : action === 'improve' ? 'improved' : 'created template for'} your documentation.`,
      });

    } catch (error) {
      console.error('Smart Documentation error:', error);
      toast({
        title: "AI Assistant Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (templateText: string) => {
    setText(templateText);
    setActiveTab("compose");
  };

  const handleUseResult = () => {
    setText(result);
    setResult("");
  };

  if (pageLoading) {
    return <SmartDocumentationSkeleton />;
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Zap className="h-8 w-8 text-amber-500" />
            Smart Documentation
          </h1>
          <p className="text-muted-foreground">
            AI-powered auto-completion and intelligent templating
          </p>
        </div>
        <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700">
          AI-Powered
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main AI Documentation Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-500" />
                    AI Documentation Assistant
                  </CardTitle>
                  <CardDescription>Write, complete, and improve clinical documentation</CardDescription>
                </div>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec.charAt(0).toUpperCase() + spec.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="compose">Compose</TabsTrigger>
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                </TabsList>

                <TabsContent value="compose" className="space-y-4">
                  <Textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Start typing your clinical notes... The AI will help you complete and improve them."
                    className="min-h-40 text-base"
                  />
                  
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      onClick={() => handleAIAction('complete')}
                      disabled={isLoading}
                      variant="default"
                    >
                      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      Auto-Complete
                    </Button>
                    <Button 
                      onClick={() => handleAIAction('suggest')}
                      disabled={isLoading}
                      variant="outline"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Suggestions
                    </Button>
                    <Button 
                      onClick={() => handleAIAction('improve')}
                      disabled={isLoading}
                      variant="outline"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Improve Text
                    </Button>
                    <Button 
                      onClick={() => handleAIAction('template')}
                      disabled={isLoading}
                      variant="outline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Create Template
                    </Button>
                  </div>

                  {result && (
                    <div className="space-y-3">
                      <Separator />
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-blue-800 dark:text-blue-200">AI Result</h4>
                          <Button onClick={handleUseResult} size="sm" variant="outline">
                            Use This Text
                          </Button>
                        </div>
                        <div className="text-sm whitespace-pre-wrap text-blue-900 dark:text-blue-100 leading-relaxed">
                          {result}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="templates" className="space-y-4">
                  <div className="grid gap-3">
                    {templates.map((template, index) => (
                      <Card key={index} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => handleTemplateSelect(template.text)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">{template.text}</p>
                            </div>
                            <PlusCircle className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Stats and Features Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Clock className="h-5 w-5" />
                Time Savings
              </CardTitle>
              <CardDescription>Reduce documentation time by 70%</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">70%</div>
              <p className="text-sm text-muted-foreground">
                Average reduction in charting time with AI assistance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-purple-700">AI Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Intelligent auto-completion
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Template suggestions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Grammar and spell check
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Medical terminology assistance
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Specialty-specific content
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-amber-700">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    setText("Patient presents with chief complaint of ");
                    setActiveTab("compose");
                  }}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Start New Note
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("templates")}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Browse Templates
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}