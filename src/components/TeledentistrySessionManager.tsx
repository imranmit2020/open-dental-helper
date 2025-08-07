import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Clock,
  AlertCircle,
  Save,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { useTeledentistry, TeledentistrySession } from '@/hooks/useTeledentistry';

interface TeledentistrySessionManagerProps {
  session: TeledentistrySession;
  onSessionEnd?: () => void;
}

const TeledentistrySessionManager: React.FC<TeledentistrySessionManagerProps> = ({
  session,
  onSessionEnd
}) => {
  const { toast } = useToast();
  const { startSession, endSession, updateNotes } = useTeledentistry();
  
  const [isCallActive, setIsCallActive] = useState(session.status === 'in_progress');
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isAiListening, setIsAiListening] = useState(false);
  const [realtimeChat, setRealtimeChat] = useState<RealtimeChat | null>(null);
  const [aiTranscript, setAiTranscript] = useState(session.ai_transcript || '');
  const [soapNotes, setSoapNotes] = useState(session.ai_soap_notes || {
    subjective: '',
    objective: '',
    assessment: '',
    plan: ''
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const handleAiMessage = (event: any) => {
    console.log('AI Event:', event);
    
    if (event.type === 'response.audio_transcript.delta') {
      setAiTranscript(prev => prev + (event.delta || ''));
    } else if (event.type === 'response.audio_transcript.done') {
      generateSoapNotes(aiTranscript);
    } else if (event.type === 'response.audio.delta') {
      setIsAiListening(true);
    } else if (event.type === 'response.audio.done') {
      setIsAiListening(false);
    }
  };

  const generateSoapNotes = async (transcript: string) => {
    // Enhanced AI prompt for better SOAP note generation
    const prompt = `Based on this teledentistry consultation transcript, generate structured SOAP notes:

${transcript}

Please extract:
- SUBJECTIVE: Patient complaints, symptoms, history
- OBJECTIVE: Observable findings, clinical observations
- ASSESSMENT: Diagnosis, clinical impression
- PLAN: Treatment recommendations, follow-up plans`;

    // This would integrate with an AI service to generate proper SOAP notes
    // For now, we'll use the existing mock logic but save the notes
    const updatedNotes = {
      subjective: soapNotes.subjective || "Patient reports dental discomfort based on consultation",
      objective: soapNotes.objective || "Visual examination conducted via video consultation",
      assessment: soapNotes.assessment || "Preliminary assessment based on patient presentation",
      plan: soapNotes.plan || "Recommended in-person follow-up for comprehensive examination"
    };
    
    setSoapNotes(updatedNotes);
    
    // Auto-save notes
    updateNotes({
      sessionId: session.id,
      aiSoapNotes: updatedNotes,
      aiTranscript: transcript
    });
  };

  const startCall = async () => {
    try {
      // Get user media for video/audio
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Initialize AI transcription with enhanced prompt
      const aiInstructions = `You are an AI assistant for teledentistry consultations. Your role is to:
      1. Listen carefully to the conversation between dentist and patient
      2. Generate accurate transcriptions of the consultation
      3. Identify key clinical information: symptoms, observations, diagnoses, treatment plans
      4. Help structure information for SOAP notes
      5. Flag any urgent concerns or red flags that need immediate attention
      
      Focus on medical accuracy and clear documentation for patient records.`;

      const chat = new RealtimeChat(handleAiMessage, aiInstructions);
      
      await chat.init();
      setRealtimeChat(chat);
      setIsCallActive(true);
      setIsAiListening(true);
      
      // Update session status in database
      startSession(session.id);
      
      toast({
        title: "Call Started",
        description: "Teledentistry session started with AI transcription enabled",
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast({
        title: "Error",
        description: "Failed to start call. Please check camera and microphone permissions.",
        variant: "destructive",
      });
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
    
    // Save session data to database
    endSession({
      sessionId: session.id,
      aiTranscript,
      aiSoapNotes: soapNotes,
      followUpRequired: soapNotes.plan.toLowerCase().includes('follow')
    });
    
    onSessionEnd?.();
    
    toast({
      title: "Call Ended",
      description: "Session completed and notes saved automatically.",
    });
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

  const saveNotes = () => {
    updateNotes({
      sessionId: session.id,
      aiSoapNotes: soapNotes,
      aiTranscript
    });
    
    toast({
      title: "Notes Saved",
      description: "SOAP notes have been saved to the patient record.",
    });
  };

  const exportNotes = () => {
    const notesText = `
TELEDENTISTRY SESSION NOTES
Patient: ${session.patient_name}
Date: ${new Date(session.scheduled_at).toLocaleDateString()}
Session Type: ${session.session_type}

SUBJECTIVE:
${soapNotes.subjective}

OBJECTIVE:
${soapNotes.objective}

ASSESSMENT:
${soapNotes.assessment}

PLAN:
${soapNotes.plan}

AI TRANSCRIPT:
${aiTranscript}
    `;
    
    const blob = new Blob([notesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teledentistry-notes-${session.patient_name}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Video className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Teledentistry Session</h2>
                <p className="text-sm text-muted-foreground">
                  {session.patient_name} • {session.session_type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isAiListening && (
                <Badge className="bg-red-100 text-red-800 animate-pulse">
                  <Brain className="w-3 h-3 mr-1" />
                  AI Active
                </Badge>
              )}
              <Badge variant={isCallActive ? "default" : "secondary"}>
                {isCallActive ? "In Progress" : session.status}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Scheduled: {new Date(session.scheduled_at).toLocaleString()}
            </div>
            {session.started_at && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Started: {new Date(session.started_at).toLocaleString()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video Interface */}
      <Card>
        <CardContent className="p-6">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4" style={{ aspectRatio: '16/9' }}>
            {isCallActive ? (
              <>
                {/* Main video (patient view) */}
                <video
                  ref={remoteVideoRef}
                  className="w-full h-full object-cover bg-gray-800"
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
                {/* Session info overlay */}
                <div className="absolute top-4 left-4 bg-black/70 text-white p-3 rounded">
                  <p className="font-semibold">{session.patient_name}</p>
                  <p className="text-sm opacity-90">{session.session_type}</p>
                  {isAiListening && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-xs">AI Recording</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-xl font-semibold">Ready to start session</p>
                  <p className="text-sm opacity-75">Click start to begin video consultation</p>
                </div>
              </div>
            )}
          </div>

          {/* Call Controls */}
          <div className="flex justify-center gap-4">
            {!isCallActive ? (
              <Button onClick={startCall} size="lg" className="bg-green-600 hover:bg-green-700">
                <Phone className="w-5 h-5 mr-2" />
                Start Session
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
                  End Session
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* AI Documentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Generated Documentation
            </div>
            <div className="flex gap-2">
              <Button onClick={saveNotes} variant="outline" size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button onClick={exportNotes} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
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
                  <label className="text-sm font-medium text-blue-600 mb-2 block">SUBJECTIVE</label>
                  <Textarea 
                    value={soapNotes.subjective}
                    onChange={(e) => setSoapNotes({...soapNotes, subjective: e.target.value})}
                    rows={4}
                    placeholder="Patient's symptoms and complaints will appear here..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-green-600 mb-2 block">OBJECTIVE</label>
                  <Textarea 
                    value={soapNotes.objective}
                    onChange={(e) => setSoapNotes({...soapNotes, objective: e.target.value})}
                    rows={4}
                    placeholder="Clinical observations will appear here..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-orange-600 mb-2 block">ASSESSMENT</label>
                  <Textarea 
                    value={soapNotes.assessment}
                    onChange={(e) => setSoapNotes({...soapNotes, assessment: e.target.value})}
                    rows={4}
                    placeholder="Clinical assessment will appear here..."
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-purple-600 mb-2 block">PLAN</label>
                  <Textarea 
                    value={soapNotes.plan}
                    onChange={(e) => setSoapNotes({...soapNotes, plan: e.target.value})}
                    rows={4}
                    placeholder="Treatment plan will appear here..."
                  />
                </div>
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
};

export default TeledentistrySessionManager;