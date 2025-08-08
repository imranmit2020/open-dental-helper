import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Save, 
  Brain,
  User,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";
import { VoiceTranscriptionService } from "@/services/VoiceTranscriptionService";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import type { Patient } from "@/hooks/usePatients";
import { debounce } from "@/utils/debounce";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PatientNote {
  id: string;
  patientName: string;
  date: string;
  time: string;
  content: string;
  type: 'manual' | 'voice';
  transcript?: string;
  aiSummary?: string;
  medicalTerms?: string[];
  anxietyLevel?: number;
  painIndicators?: string[];
  confidence?: number;
}

interface PatientNotesDialogProps {
  trigger?: React.ReactNode;
}

const PatientNotesDialog: React.FC<PatientNotesDialogProps> = ({ trigger }) => {
  const { toast } = useToast();
  const [notes, setNotes] = useState<PatientNote[]>([
    {
      id: "1",
      patientName: "Sarah Johnson",
      date: "2024-01-15",
      time: "10:30 AM",
      content: "Patient reported sensitivity in upper right molar. Examination revealed small cavity. Recommended filling procedure.",
      type: "manual"
    },
    {
      id: "2", 
      patientName: "Michael Chen",
      date: "2024-01-15",
      time: "11:15 AM",
      content: "Crown preparation completed successfully. Patient tolerated procedure well with minimal discomfort.",
      type: "voice",
      transcript: "Crown preparation went really well today. Patient seemed comfortable throughout the procedure. Used local anesthetic and patient reported minimal discomfort. Crown fits perfectly.",
      aiSummary: "Crown preparation completed successfully. Patient tolerated procedure well with minimal discomfort.",
      medicalTerms: ["crown", "anesthetic"],
      anxietyLevel: 0.1,
      painIndicators: [],
      confidence: 0.95
    }
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [voiceService] = useState(() => new VoiceTranscriptionService());
  const [newNote, setNewNote] = useState({
    patientName: "",
    content: "",
    type: "manual" as 'manual' | 'voice'
  });

  const { searchPatients } = useOptimizedPatients();
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const runSearch = useMemo(() => debounce(async (q: string) => {
    const query = q.trim();
    if (query.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    try {
      const results = await searchPatients(query);
      setSearchResults(results);
    } catch (e) {
      console.error('Error searching patients:', e);
    } finally {
      setIsSearching(false);
    }
  }, 300), [searchPatients]);

const formatDob = (dob?: string | null) => {
  if (!dob) return "Not available";
  const d = new Date(dob as string);
  return isNaN(d.getTime()) ? "Not available" : format(d, "MMM d, yyyy");
};

const [isOpen, setIsOpen] = useState(false);
const { user } = useAuth();
const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const startRecording = async () => {
    if (!voiceService.isSupported()) {
      toast({
        title: "Voice Recognition Not Supported",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    setCurrentTranscript("");

    try {
      await voiceService.startListening((result) => {
        setCurrentTranscript(result.transcript);
        
        if (result.transcript.length > 10) {
          // Auto-generate AI summary for longer transcripts
          const aiSummary = generateAISummary(result.transcript);
          setNewNote(prev => ({
            ...prev,
            content: aiSummary,
            type: 'voice'
          }));
        }
      });
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Failed to start voice recording.",
        variant: "destructive"
      });
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    voiceService.stopListening();
    setIsRecording(false);
    
    if (currentTranscript) {
      toast({
        title: "Voice Note Recorded",
        description: "Voice note has been transcribed and processed.",
      });
    }
  };

  const generateAISummary = (transcript: string): string => {
    // Simplified AI summary generation
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const keywords = ['patient', 'procedure', 'treatment', 'pain', 'comfort', 'success', 'completed'];
    
    const importantSentences = sentences.filter(sentence => 
      keywords.some(keyword => sentence.toLowerCase().includes(keyword))
    );

    return importantSentences.slice(0, 2).join('. ') + '.';
  };

  const saveNote = async () => {
    if (!newNote.patientName || !newNote.content) {
      toast({
        title: "Missing Information",
        description: "Please fill in patient name and note content.",
        variant: "destructive"
      });
      return;
    }
    if (!selectedPatientId) {
      toast({ title: "Select patient", description: "Choose a patient from the suggestions", variant: "destructive" });
      return;
    }

    try {
      // Try to resolve dentist profile id (optional)
      let dentistProfileId: string | null = null;
      if (user?.id) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        dentistProfileId = prof?.id || null;
      }

      // Persist to voice_notes table
      const { error } = await supabase.from('voice_notes').insert({
        patient_id: selectedPatientId,
        dentist_id: dentistProfileId,
        summary: newNote.content,
        transcription: newNote.type === 'voice' ? currentTranscript : null,
        status: 'completed',
      });
      if (error) throw error;

      const note: PatientNote = {
        id: Date.now().toString(),
        patientName: newNote.patientName,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        content: newNote.content,
        type: newNote.type,
        ...(newNote.type === 'voice' && {
          transcript: currentTranscript,
          aiSummary: newNote.content,
          confidence: 0.9
        })
      };

      setNotes(prev => [note, ...prev]);
      setNewNote({ patientName: "", content: "", type: "manual" });
      setCurrentTranscript("");
      setSelectedPatientId(null);

      toast({ title: "Note Saved", description: "Patient note saved to the database." });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Save failed", description: e?.message || 'Could not save note.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Patient Notes
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Patient Notes & AI Voice Documentation
          </DialogTitle>
          <DialogDescription>
            Create, manage, and review patient notes with AI-powered voice transcription
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="create" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Note</TabsTrigger>
            <TabsTrigger value="history">Notes History</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Voice Documentation
                </CardTitle>
                <CardDescription>
                  Record voice notes that are automatically transcribed and summarized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <div className="relative">
                      <Input
                        id="patientName"
                        value={newNote.patientName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewNote(prev => ({ ...prev, patientName: val }));
                          if (val.length > 2) {
                            setIsSearching(true);
                            runSearch(val);
                          } else {
                            setSearchResults([]);
                          }
                        }}
                        placeholder="Search patient by name or email"
                        autoComplete="off"
                      />
                      {(isSearching || (newNote.patientName.length > 2 && searchResults.length > 0)) && (
                        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow max-h-60 overflow-auto">
                          {isSearching ? (
                            <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                          ) : (
                            searchResults.map((p) => (
                              <button
                                key={p.id}
                                type="button"
                                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
onClick={() => {
                                  setNewNote(prev => ({ ...prev, patientName: `${p.first_name} ${p.last_name}` }));
                                  setSelectedPatientId(p.id);
                                  setSearchResults([]);
                                }}
                              >
                                <div className="font-medium">{p.first_name} {p.last_name}</div>
                                <div className="text-xs text-muted-foreground">DOB: {formatDob(p.date_of_birth)}</div>
                              </button>
                            ))
                          )}
                          {!isSearching && searchResults.length === 0 && newNote.patientName.length > 2 && (
                            <div className="p-3 text-sm text-muted-foreground">No patients found</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="flex-1">
                        <Mic className="w-4 h-4 mr-2" />
                        Start Voice Recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="destructive" className="flex-1">
                        <Square className="w-4 h-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>
                </div>

                {isRecording && (
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-red-700">Recording in progress...</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {currentTranscript || "Listening for your voice..."}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label htmlFor="noteContent">Note Content</Label>
                  <Textarea
                    id="noteContent"
                    value={newNote.content}
                    onChange={(e) => setNewNote(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter note content or use voice recording above"
                    rows={6}
                  />
                </div>

                {currentTranscript && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Voice Transcript</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700">{currentTranscript}</p>
                    </CardContent>
                  </Card>
                )}

                <Button onClick={saveNote} className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 max-h-[60vh] overflow-y-auto">
            {notes.map((note) => (
              <Card key={note.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {note.patientName}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={note.type === 'voice' ? 'default' : 'secondary'}>
                        {note.type === 'voice' ? (
                          <>
                            <Mic className="w-3 h-3 mr-1" />
                            Voice Note
                          </>
                        ) : (
                          <>
                            <FileText className="w-3 h-3 mr-1" />
                            Manual Note
                          </>
                        )}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {note.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {note.time}
                    </span>
                    {note.confidence && (
                      <span className="flex items-center gap-1">
                        <Brain className="w-3 h-3" />
                        {Math.round(note.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <h5 className="font-medium mb-1">Clinical Summary</h5>
                    <p className="text-sm text-gray-700">{note.content}</p>
                  </div>

                  {note.transcript && (
                    <div>
                      <h5 className="font-medium mb-1">Original Transcript</h5>
                      <p className="text-sm text-gray-600 italic">{note.transcript}</p>
                    </div>
                  )}

                  {note.medicalTerms && note.medicalTerms.length > 0 && (
                    <div>
                      <h5 className="font-medium mb-2">Medical Terms Detected</h5>
                      <div className="flex gap-1 flex-wrap">
                        {note.medicalTerms.map((term, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {note.anxietyLevel !== undefined && note.anxietyLevel > 0 && (
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm">
                        Patient Anxiety Level: {Math.round(note.anxietyLevel * 100)}%
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientNotesDialog;