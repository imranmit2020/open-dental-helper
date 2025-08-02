import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageSquare, Camera, Star, Gift, Calendar, FileText } from "lucide-react";

export default function PatientConcierge() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! I\'m your AI dental assistant. How can I help you today?' }
  ]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold gradient-text text-center">Patient AI Concierge</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              AI Chat Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 border rounded-lg p-4 bg-gray-50">
              {messages.map((msg, index) => (
                <div key={index} className={`mb-2 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                  <span className={`inline-block p-2 rounded ${msg.type === 'user' ? 'bg-primary text-white' : 'bg-white'}`}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Ask about your treatment, appointments, or dental care..." />
              <Button>Send</Button>
            </div>
          </CardContent>
        </Card>

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
              <p className="font-medium">Latest X-ray Analysis</p>
              <p className="text-sm text-muted-foreground">AI found 2 areas that need attention</p>
              <Button className="mt-3">View Detailed Report</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
            <p className="font-bold">850 Points</p>
            <p className="text-sm text-muted-foreground">Loyalty Rewards</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="font-bold">Next Visit</p>
            <p className="text-sm text-muted-foreground">March 15, 2024</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="font-bold">Treatment Plan</p>
            <p className="text-sm text-muted-foreground">95% Complete</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}