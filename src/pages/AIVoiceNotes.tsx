import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Mic, Save, ListMusic, FileText } from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { usePatients } from "@/hooks/usePatients";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface VoiceNote {
  id: string;
  patient_id: string | null;
  dentist_id: string;
  summary: string | null;
  transcription: string | null;
  created_at: string;
}

export default function AIVoiceNotes() {
  const { patients, loading: loadingPatients } = usePatients();
  const { user } = useAuth();
  const { toast } = useToast();

  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [transcript, setTranscript] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState<VoiceNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    document.title = "AI Voice Notes – Transcription & Storage";
  }, []);

  const selectedPatientName = useMemo(() => {
    const p = patients.find((x) => x.id === selectedPatientId);
    return p ? `${p.first_name} ${p.last_name}` : "";
  }, [patients, selectedPatientId]);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!selectedPatientId) {
        setNotes([]);
        return;
      }
      setLoadingNotes(true);
      const { data, error } = await supabase
        .from("voice_notes")
        .select("id, patient_id, dentist_id, summary, transcription, created_at")
        .eq("patient_id", selectedPatientId)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(error);
        toast({ title: "Load failed", description: "Could not load voice notes", variant: "destructive" });
      } else {
        setNotes(data || []);
      }
      setLoadingNotes(false);
    };
    fetchNotes();
  }, [selectedPatientId, toast]);

  const handleSave = async () => {
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in to save notes.", variant: "destructive" });
      return;
    }
    if (!selectedPatientId) {
      toast({ title: "Select a patient", description: "Choose a patient to attach this note.", variant: "destructive" });
      return;
    }
    if (!transcript.trim()) {
      toast({ title: "No transcript", description: "Record or enter some text first.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      let dentistProfileId: string | null = null;
      const { data: prof, error: profErr } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (profErr) throw profErr;
      dentistProfileId = prof?.id || null;
      if (!dentistProfileId) {
        throw new Error("Your profile could not be found. Please complete your profile.");
      }
      const { error } = await supabase.from("voice_notes").insert({
        patient_id: selectedPatientId,
        dentist_id: dentistProfileId,
        summary: title || null,
        transcription: transcript,
        status: "completed",
      });
      if (error) throw error;

      toast({ title: "Saved", description: "Voice note saved successfully." });
      setTitle("");
      setTranscript("");

      // Refresh list
      const { data } = await supabase
        .from("voice_notes")
        .select("id, patient_id, dentist_id, summary, transcription, created_at")
        .eq("patient_id", selectedPatientId)
        .order("created_at", { ascending: false });
      setNotes(data || []);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Save failed", description: e.message || "Could not save note.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Voice Notes</h1>
        <p className="text-muted-foreground">Hands-free clinical documentation with AI transcription and secure storage</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Start Voice Recording
          </CardTitle>
          <CardDescription>Select patient, record, review transcript, then save to the chart.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-1">
              <Label>Patient</Label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.first_name} {p.last_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Title (optional)</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Post-op instructions, Exam notes" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <VoiceRecorder onTranscription={(text) => setTranscript((prev) => (prev ? `${prev} ${text}` : text))} />
            <Button onClick={handleSave} disabled={saving} className="ml-auto">
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Note"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Transcript</Label>
            <Textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcript will appear here. You can also edit it manually before saving."
              rows={8}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListMusic className="h-5 w-5" /> Recent Notes {selectedPatientName ? `– ${selectedPatientName}` : ""}
          </CardTitle>
          <CardDescription>Saved voice notes for the selected patient</CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedPatientId ? (
            <p className="text-muted-foreground">Select a patient to view their notes.</p>
          ) : loadingNotes ? (
            <p className="text-muted-foreground">Loading notes…</p>
          ) : notes.length === 0 ? (
            <p className="text-muted-foreground">No notes yet.</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n) => (
                <div key={n.id} className="p-3 rounded-lg border bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{n.summary || "Untitled note"}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</span>
                  </div>
                  {n.transcription && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{n.transcription}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
