import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, MicOff, FileText, Brain, Play, Pause, Save, Edit } from "lucide-react";
import { toast } from "sonner";

interface VoiceNote {
  id: string;
  timestamp: Date;
  duration: number;
  rawTranscription: string;
  structuredNote: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  patientId: string;
  status: 'processing' | 'completed' | 'reviewed';
}

export default function VoiceToChart() {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("patient_001");
  const [currentNote, setCurrentNote] = useState<VoiceNote | null>(null);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const mockVoiceNote: VoiceNote = {
    id: "note_001",
    timestamp: new Date(),
    duration: 125,
    rawTranscription: "Patient presents with chief complaint of tooth pain upper right quadrant lasting for approximately three weeks. Pain is described as throbbing and sharp, worsens with hot and cold stimuli. Patient has been taking ibuprofen with minimal relief. No swelling noted. On examination tooth number three shows large carious lesion extending to pulp chamber. Percussion test positive. Radiographic examination reveals periapical radiolucency. Recommend immediate endodontic therapy followed by crown restoration. Patient consents to treatment. Prescribed amoxicillin and ibuprofen for pain management.",
    structuredNote: {
      subjective: "Patient reports severe tooth pain in upper right quadrant for 3 weeks. Pain described as throbbing and sharp, worsens with temperature changes. Taking ibuprofen with minimal relief.",
      objective: "Tooth #3 presents with large carious lesion extending to pulp chamber. Positive percussion test. No facial swelling observed. Radiographic examination shows periapical radiolucency.",
      assessment: "Acute pulpitis with periapical involvement, tooth #3. Requires immediate endodontic intervention.",
      plan: "1. Initiate root canal therapy on tooth #3\n2. Crown restoration following completion of RCT\n3. Prescribed: Amoxicillin 500mg TID x 7 days\n4. Ibuprofen 600mg QID PRN pain\n5. Follow-up in 1 week"
    },
    patientId: "patient_001",
    status: 'completed'
  };

  const startRecording = () => {
    setIsRecording(true);
    toast.success("Recording started");
  };

  const stopRecording = () => {
    setIsRecording(false);
    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      setCurrentNote(mockVoiceNote);
      setIsProcessing(false);
      toast.success("Voice note processed and structured");
    }, 3000);
  };

  const saveNote = () => {
    if (currentNote) {
      setVoiceNotes([...voiceNotes, { ...currentNote, status: 'reviewed' }]);
      setCurrentNote(null);
      toast.success("Clinical note saved to patient chart");
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Voice-to-Chart</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered voice transcription with automatic SOAP note generation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recording Interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Voice Recording
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Selection */}
            <div>
              <label className="text-sm font-medium">Select Patient</label>
              <select 
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="patient_001">John Smith - Routine Checkup</option>
                <option value="patient_002">Sarah Johnson - Emergency Visit</option>
                <option value="patient_003">Mike Davis - Follow-up</option>
              </select>
            </div>

            {/* Recording Controls */}
            <div className="text-center space-y-4">
              {!isRecording ? (
                <Button 
                  onClick={startRecording}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600"
                >
                  <Mic className="w-8 h-8" />
                </Button>
              ) : (
                <Button 
                  onClick={stopRecording}
                  size="lg"
                  className="h-16 w-16 rounded-full bg-gray-500 hover:bg-gray-600"
                >
                  <MicOff className="w-8 h-8" />
                </Button>
              )}
              
              <div className="space-y-2">
                {isRecording && (
                  <>
                    <p className="text-lg font-medium text-red-500">Recording...</p>
                    <div className="flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </>
                )}
                
                {isProcessing && (
                  <>
                    <p className="text-lg font-medium text-blue-500">Processing...</p>
                    <div className="flex items-center justify-center gap-2">
                      <Brain className="w-5 h-5 animate-spin" />
                      <span className="text-sm">AI is structuring your notes</span>
                    </div>
                  </>
                )}
                
                {!isRecording && !isProcessing && (
                  <p className="text-muted-foreground">Click to start recording</p>
                )}
              </div>
            </div>

            {/* Recording Tips */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Recording Tips</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Speak clearly and at normal pace</li>
                <li>• Include patient complaints, observations, and treatment plans</li>
                <li>• Mention medications and follow-up instructions</li>
                <li>• AI will automatically structure into SOAP format</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* AI Processing Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Generated Clinical Note
              {currentNote && (
                <Badge className="ml-2">
                  {formatDuration(currentNote.duration)}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!currentNote ? (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Record a voice note to see AI-generated SOAP notes</p>
              </div>
            ) : (
              <Tabs defaultValue="structured" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="structured">SOAP Note</TabsTrigger>
                  <TabsTrigger value="raw">Raw Transcription</TabsTrigger>
                </TabsList>
                
                <TabsContent value="structured" className="space-y-4">
                  <div className="space-y-4">
                    {/* Subjective */}
                    <div>
                      <label className="text-sm font-medium text-blue-600">SUBJECTIVE</label>
                      <Textarea 
                        value={currentNote.structuredNote.subjective}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    {/* Objective */}
                    <div>
                      <label className="text-sm font-medium text-green-600">OBJECTIVE</label>
                      <Textarea 
                        value={currentNote.structuredNote.objective}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    {/* Assessment */}
                    <div>
                      <label className="text-sm font-medium text-orange-600">ASSESSMENT</label>
                      <Textarea 
                        value={currentNote.structuredNote.assessment}
                        className="mt-1"
                        rows={2}
                      />
                    </div>
                    
                    {/* Plan */}
                    <div>
                      <label className="text-sm font-medium text-purple-600">PLAN</label>
                      <Textarea 
                        value={currentNote.structuredNote.plan}
                        className="mt-1"
                        rows={4}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={saveNote} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save to Chart
                    </Button>
                    <Button variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="raw" className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Raw Transcription</label>
                    <Textarea 
                      value={currentNote.rawTranscription}
                      className="mt-1"
                      rows={10}
                      readOnly
                    />
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Duration: {formatDuration(currentNote.duration)}</span>
                    <span>•</span>
                    <span>Processed: {currentNote.timestamp.toLocaleTimeString()}</span>
                    <span>•</span>
                    <span>Confidence: 94%</span>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Voice Notes */}
      {voiceNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Voice Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {voiceNotes.map((note) => (
                <div key={note.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Clinical Note</p>
                      <p className="text-sm text-muted-foreground">
                        {note.timestamp.toLocaleDateString()} • {formatDuration(note.duration)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{note.status}</Badge>
                    <Button variant="ghost" size="sm">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}