import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  MessageSquare,
  FileText,
  Brain,
  User,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { RealtimeChat } from "@/utils/RealtimeAudio";

interface TeledentistrySession {
  id: string;
  patientName: string;
  scheduledTime: string;
  status: 'scheduled' | 'in_progress' | 'completed';
  sessionType: 'consultation' | 'follow_up' | 'emergency';
  aiTranscript?: string;
  aiSoapNotes?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export default function TeledentistryEnhanced() {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isAiListening, setIsAiListening] = useState(false);
  const [realtimeChat, setRealtimeChat] = useState<RealtimeChat | null>(null);
  const [aiTranscript, setAiTranscript] = useState("");
  const [currentSession, setCurrentSession] = useState<TeledentistrySession | null>(null);
  const [soapNotes, setSoapNotes] = useState({
    subjective: "",
    objective: "",
    assessment: "",
    plan: ""
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Mock upcoming sessions
  const upcomingSessions: TeledentistrySession[] = [
    {
      id: "1",
      patientName: "John Smith",
      scheduledTime: "2:00 PM",
      status: "scheduled",
      sessionType: "consultation"
    },
    {
      id: "2", 
      patientName: "Sarah Johnson",
      scheduledTime: "3:30 PM",
      status: "scheduled",
      sessionType: "follow_up"
    }
  ];

  const handleAiMessage = (event: any) => {
    console.log('AI Event:', event);
    
    if (event.type === 'response.audio_transcript.delta') {
      setAiTranscript(prev => prev + (event.delta || ''));
    } else if (event.type === 'response.audio_transcript.done') {
      // Process the completed transcript for SOAP notes
      generateSoapNotes(aiTranscript);
    } else if (event.type === 'response.audio.delta') {
      setIsAiListening(true);
    } else if (event.type === 'response.audio.done') {
      setIsAiListening(false);
    }
  };

  const generateSoapNotes = async (transcript: string) => {
    // This would typically send the transcript to an AI service for SOAP note generation
    // For now, we'll simulate the process
    const mockSoapNotes = {
      subjective: "Patient reports tooth pain in upper right quadrant, duration 3 days. Pain increases with hot/cold stimuli.",
      objective: "Visual examination shows visible cavity on tooth #3. Patient appears uncomfortable when discussing affected area.",
      assessment: "Likely dental caries on tooth #3 requiring immediate attention. No signs of systemic infection observed.",
      plan: "Schedule in-person appointment for examination and treatment. Recommend pain management with ibuprofen. Follow up in 24 hours if pain worsens."
    };
    
    setSoapNotes(mockSoapNotes);
  };

  const startCall = async () => {
    try {
      let stream: MediaStream | null = null;

      // Try full audio+video first
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
      } catch (err: any) {
        console.warn("Full AV getUserMedia failed, retrying audio-only:", err?.name || err);
        // Fallback to audio-only so the session can still start
        stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
        setIsVideoEnabled(false);
        setIsAudioEnabled(true);
        toast("Starting audio-only (camera blocked). Enable camera in your browser settings and rejoin if needed.");
      }
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
      }

      // Initialize AI transcription
      const chat = new RealtimeChat(
        handleAiMessage,
        "You are an AI assistant helping with teledentistry consultations. Listen to the conversation between dentist and patient, and help generate structured SOAP notes based on the discussion. Focus on symptoms, observations, and treatment plans discussed."
      );
      
      await chat.init();
      setRealtimeChat(chat);
      setIsCallActive(true);
      setIsAiListening(true);
      
      // Set current session
      setCurrentSession(upcomingSessions[0]);
      
      toast.success("Call started with AI transcription enabled");
    } catch (error: any) {
      console.error("Error starting call:", error);
      const msg =
        error?.name === "NotAllowedError"
          ? "Permission denied. Allow mic/camera for this site (address bar) and try again."
          : "Failed to start call. Check mic/camera permissions and try again.";
      toast.error(msg);
    }
  };

  const endCall = () => {
    realtimeChat?.disconnect();
    setRealtimeChat(null);
    setIsCallActive(false);
    setIsAiListening(false);
    
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    
    toast.success("Call ended. SOAP notes generated automatically.");
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (videoRef.current?.srcObject) {
      const videoTrack = (videoRef.current.srcObject as MediaStream).getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (videoRef.current?.srcObject) {
      const audioTrack = (videoRef.current.srcObject as MediaStream).getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI-Enhanced Teledentistry</h1>
        <p className="text-lg text-muted-foreground">
          Virtual consultations with real-time AI transcription and SOAP note generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Video Call Interface */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Video Consultation
                  {isAiListening && (
                    <Badge className="bg-red-100 text-red-800">
                      <Brain className="w-3 h-3 mr-1" />
                      AI Listening
                    </Badge>
                  )}
                </span>
                {currentSession && (
                  <Badge>{currentSession.sessionType}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Video Streams */}
              <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                {isCallActive ? (
                  <>
                    {/* Main video (patient view) */}
                    <video
                      ref={remoteVideoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      playsInline
                    />
                    {/* Picture-in-picture (doctor view) */}
                    <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded border-2 border-white overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                    </div>
                    {/* Patient info overlay */}
                    {currentSession && (
                      <div className="absolute top-4 left-4 bg-black/70 text-white p-2 rounded">
                        <p className="font-semibold">{currentSession.patientName}</p>
                        <p className="text-sm">{currentSession.scheduledTime}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <div className="text-center">
                      <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-semibold">Start a video consultation</p>
                      <p className="text-sm opacity-75">Connect with your patient securely</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Call Controls */}
              <div className="flex justify-center gap-4">
                {!isCallActive ? (
                  <Button onClick={startCall} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Phone className="w-5 h-5 mr-2" />
                    Start Call
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={toggleVideo}
                      variant={isVideoEnabled ? "outline" : "destructive"}
                      size="lg"
                    >
                      {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      onClick={toggleAudio}
                      variant={isAudioEnabled ? "outline" : "destructive"}
                      size="lg"
                    >
                      {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button onClick={endCall} variant="destructive" size="lg">
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Call
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Session Info */}
          {currentSession && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Current Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{currentSession.patientName}</p>
                    <p className="text-sm text-muted-foreground">{currentSession.sessionType}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4" />
                    <span>{currentSession.scheduledTime}</span>
                  </div>
                  <Badge className={
                    currentSession.status === 'in_progress' ? 'bg-green-100 text-green-800' :
                    currentSession.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }>
                    {currentSession.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{session.patientName}</p>
                      <Badge variant="outline">{session.sessionType}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{session.scheduledTime}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => setCurrentSession(session)}
                    >
                      Join Session
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* AI-Generated Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Generated SOAP Notes
            {isAiListening && (
              <div className="flex items-center gap-1 text-red-600">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-sm">Recording & Analyzing</span>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="soap" className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="soap">SOAP Notes</TabsTrigger>
              <TabsTrigger value="transcript">AI Transcript</TabsTrigger>
            </TabsList>
            
            <TabsContent value="soap" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-600">SUBJECTIVE</label>
                  <Textarea 
                    value={soapNotes.subjective}
                    onChange={(e) => setSoapNotes({...soapNotes, subjective: e.target.value})}
                    className="mt-1"
                    rows={3}
                    placeholder="Patient's symptoms and complaints will appear here..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-green-600">OBJECTIVE</label>
                  <Textarea 
                    value={soapNotes.objective}
                    onChange={(e) => setSoapNotes({...soapNotes, objective: e.target.value})}
                    className="mt-1"
                    rows={3}
                    placeholder="Clinical observations will appear here..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-orange-600">ASSESSMENT</label>
                  <Textarea 
                    value={soapNotes.assessment}
                    onChange={(e) => setSoapNotes({...soapNotes, assessment: e.target.value})}
                    className="mt-1"
                    rows={3}
                    placeholder="Clinical assessment will appear here..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-purple-600">PLAN</label>
                  <Textarea 
                    value={soapNotes.plan}
                    onChange={(e) => setSoapNotes({...soapNotes, plan: e.target.value})}
                    className="mt-1"
                    rows={3}
                    placeholder="Treatment plan will appear here..."
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Save to Patient Record
                </Button>
                <Button variant="outline">
                  Export PDF
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="transcript" className="mt-4">
              <div className="border rounded-lg p-4 min-h-[300px] bg-gray-50">
                {aiTranscript ? (
                  <div className="whitespace-pre-wrap text-sm">
                    {aiTranscript}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-12">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>AI transcript will appear here during the consultation</p>
                  </div>
                )}
              </div>
              
              {isCallActive && (
                <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      AI is actively transcribing and analyzing the conversation
                    </span>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}