import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Zap, FileText, Brain, Clock } from "lucide-react";

export default function SmartDocumentation() {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Smart Chart Entry
            </CardTitle>
            <CardDescription>AI-assisted documentation with auto-completion</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea 
              placeholder="Start typing your notes... AI will suggest completions"
              className="min-h-32"
            />
            <Button className="w-full">
              <Brain className="h-4 w-4 mr-2" />
              Generate AI Suggestions
            </Button>
          </CardContent>
        </Card>

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
              <ul className="space-y-2 text-sm">
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
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <p className="text-amber-800 text-sm">
              🚀 This AI-powered documentation system is being developed to revolutionize clinical charting efficiency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}