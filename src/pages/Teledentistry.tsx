import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Share,
  Upload,
  Bot,
  User,
  FileText,
  Camera,
  Monitor
} from "lucide-react";

export default function Teledentistry() {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isInCall, setIsInCall] = useState(false);
  const [aiNotes, setAiNotes] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: "patient", message: "Hi Dr. Smith, I'm experiencing some tooth pain", time: "2:34 PM" },
    { id: 2, sender: "doctor", message: "I can see you now. Can you show me which tooth is bothering you?", time: "2:35 PM" },
  ]);

  const currentPatient = {
    name: "Sarah Johnson",
    age: 34,
    lastVisit: "2024-01-15",
    conditions: ["Mild gingivitis", "Wisdom tooth extraction (2023)"],
    medications: ["Ibuprofen 400mg"]
  };

  const aiLiveNotes = [
    "Patient reports pain in upper right quadrant",
    "Visible inflammation around tooth #3",
    "Pain rated 7/10, started 3 days ago",
    "No fever or swelling reported"
  ];

  const suggestedDiagnosis = [
    { condition: "Acute pulpitis", confidence: 0.85, severity: "moderate" },
    { condition: "Dental abscess", confidence: 0.23, severity: "high" },
    { condition: "Tooth sensitivity", confidence: 0.12, severity: "low" }
  ];

  const toggleCall = () => {
    setIsInCall(!isInCall);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Teledentistry & AI Chat</h1>
            <p className="text-muted-foreground">Virtual consultation with AI-powered assistance</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isInCall ? "default" : "secondary"}>
            {isInCall ? "In Call" : "Ready"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Call Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Video Window */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden">
                {isInCall ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900">
                    <div className="text-center text-white">
                      <User className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">{currentPatient.name}</p>
                      <p className="text-sm opacity-75">Patient Video</p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Video className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium text-foreground">Video Call Ready</p>
                      <p className="text-sm text-muted-foreground">Click start to begin consultation</p>
                    </div>
                  </div>
                )}
                
                {/* Doctor's Video (Picture-in-Picture) */}
                {isInCall && (
                  <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg border-2 border-white/20 overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <User className="h-8 w-8 opacity-50" />
                    </div>
                  </div>
                )}

                {/* Call Controls */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full p-2">
                    <Button
                      variant={isAudioOn ? "secondary" : "destructive"}
                      size="icon"
                      className="rounded-full"
                      onClick={() => setIsAudioOn(!isAudioOn)}
                    >
                      {isAudioOn ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant={isVideoOn ? "secondary" : "destructive"}
                      size="icon"
                      className="rounded-full"
                      onClick={() => setIsVideoOn(!isVideoOn)}
                    >
                      {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      variant={isInCall ? "destructive" : "default"}
                      size="icon"
                      className="rounded-full"
                      onClick={toggleCall}
                    >
                      {isInCall ? <PhoneOff className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                    </Button>

                    <Button variant="secondary" size="icon" className="rounded-full">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          message.sender === 'doctor'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-75 mt-1">{message.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Textarea placeholder="Type a message..." className="resize-none" rows={2} />
                  <Button size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Camera className="h-4 w-4 mr-2" />
                  Take Screenshot
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Monitor className="h-4 w-4 mr-2" />
                  Share X-ray
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Documents
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Prescription
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* AI Assistant Panel */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-foreground">{currentPatient.name}</p>
                <p className="text-sm text-muted-foreground">Age: {currentPatient.age}</p>
                <p className="text-sm text-muted-foreground">Last Visit: {currentPatient.lastVisit}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Conditions:</p>
                <div className="space-y-1">
                  {currentPatient.conditions.map((condition, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">Medications:</p>
                <div className="space-y-1">
                  {currentPatient.medications.map((med, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {med}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Live Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Live Notes
              </CardTitle>
              <CardDescription>
                Auto-generated consultation notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {aiLiveNotes.map((note, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <p className="text-sm text-foreground">{note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Suggested Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Diagnosis Suggestions
              </CardTitle>
              <CardDescription>
                Based on symptoms discussed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {suggestedDiagnosis.map((diagnosis, index) => (
                <div key={index} className="p-3 bg-gradient-card rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-foreground">{diagnosis.condition}</h4>
                    <Badge variant={diagnosis.severity === "high" ? "destructive" : diagnosis.severity === "moderate" ? "secondary" : "outline"}>
                      {diagnosis.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${diagnosis.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(diagnosis.confidence * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Prescribe & Send</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate Prescription
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Follow-up
              </Button>
              <Button variant="outline" className="w-full">
                Send Care Instructions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}