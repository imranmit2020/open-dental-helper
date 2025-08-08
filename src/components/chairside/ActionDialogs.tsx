import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTenant } from "@/contexts/TenantContext";

interface BaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  onSuccess?: () => void;
}

export function PrescribeMedicationDialog({ open, onOpenChange, patientId, onSuccess }: BaseDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const submit = async () => {
    if (!patientId) return toast.error("Select a patient first");
    if (!medicationName) return toast.error("Medication name is required");
    try {
      setLoading(true);
      let prescribedBy: string | null = null;
      if (user?.id) {
        const { data: prof, error: profErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!profErr && prof?.id) prescribedBy = prof.id as string;
      }
      const { error } = await supabase.from("medications").insert({
        patient_id: patientId,
        prescribed_by: prescribedBy,
        medication_name: medicationName,
        dosage: dosage || null,
        frequency: frequency || null,
        start_date: startDate ? new Date(startDate).toISOString().slice(0, 10) : null,
        end_date: endDate ? new Date(endDate).toISOString().slice(0, 10) : null,
        status: "active",
      });
      if (error) throw error;
      toast.success("Medication prescribed");
      onOpenChange(false);
      setMedicationName("");
      setDosage("");
      setFrequency("");
      setStartDate("");
      setEndDate("");
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to prescribe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prescribe Medication</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="medication_name">Medication</Label>
            <Input id="medication_name" value={medicationName} onChange={(e) => setMedicationName(e.target.value)} placeholder="e.g., Amoxicillin" />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 500 mg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Input id="frequency" value={frequency} onChange={(e) => setFrequency(e.target.value)} placeholder="e.g., TID for 7 days" />
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start">Start date</Label>
              <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End date</Label>
              <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>Prescribe</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ScheduleFollowUpDialog({ open, onOpenChange, patientId, onSuccess }: BaseDialogProps) {
  const { user } = useAuth();
  const { currentTenant } = useTenant();
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("Follow-up Visit");
  const [dateTime, setDateTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState("");

  const submit = async () => {
    if (!patientId) return toast.error("Select a patient first");
    if (!currentTenant?.id) return toast.error("No clinic selected");
    if (!dateTime) return toast.error("Date & time is required");
    try {
      setLoading(true);
      const { error } = await supabase.from("appointments").insert({
        tenant_id: currentTenant.id,
        patient_id: patientId,
        title: title || "Follow-up Visit",
        description: notes || null,
        appointment_date: new Date(dateTime).toISOString(),
        duration: duration || 60,
        status: "scheduled",
        treatment_type: "follow_up",
      });
      if (error) throw error;
      toast.success("Follow-up scheduled");
      onOpenChange(false);
      setTitle("Follow-up Visit");
      setDateTime("");
      setDuration(60);
      setNotes("");
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Follow-up</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="fu-title">Title</Label>
            <Input id="fu-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="fu-datetime">Date & time</Label>
              <Input id="fu-datetime" type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fu-duration">Duration (min)</Label>
              <Input id="fu-duration" type="number" min={15} step={15} value={duration} onChange={(e) => setDuration(parseInt(e.target.value || "60", 10))} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fu-notes">Notes</Label>
            <Textarea id="fu-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SecondOpinionDialog({ open, onOpenChange, patientId, onSuccess }: BaseDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [question, setQuestion] = useState("");
  const [priority, setPriority] = useState("normal");

  const submit = async () => {
    if (!patientId) return toast.error("Select a patient first");
    try {
      setLoading(true);
      const { error } = await supabase.from("patient_journey_events").insert({
        patient_id: patientId,
        event_type: "second_opinion_requested",
        source_module: "chairside",
        event_data: { question, priority, requested_by: user?.id || null },
        ai_insights: null,
      });
      if (error) throw error;
      toast.success("Second opinion requested");
      onOpenChange(false);
      setQuestion("");
      setPriority("normal");
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Failed to request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Get Second Opinion</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid gap-2">
            <Label htmlFor="so-question">Question / context</Label>
            <Textarea id="so-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Briefly describe the case or question" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="so-priority">Priority</Label>
            <select id="so-priority" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button onClick={submit} disabled={loading}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- New: Update Allergies Dialog ---
export function UpdateAllergiesDialog({ open, onOpenChange, patientId, onSuccess }: BaseDialogProps) {
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState<Array<{ id: string; allergen: string; severity: string | null; notes: string | null }>>([]);
  const [newAllergen, setNewAllergen] = useState("");
  const [newSeverity, setNewSeverity] = useState<string | null>("moderate");
  const [newNotes, setNewNotes] = useState("");

  const normalizeSeverity = (s: string | null): 'mild' | 'moderate' | 'severe' => {
    if (s === 'low') return 'mild';
    if (s === 'medium') return 'moderate';
    if (s === 'high') return 'severe';
    if (s === 'mild' || s === 'moderate' || s === 'severe') return s as 'mild' | 'moderate' | 'severe';
    return 'moderate';
  };

  const load = async () => {
    if (!patientId) return;
    const { data, error } = await supabase
      .from('allergies')
      .select('id, allergen, severity, notes')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) {
      console.error(error);
      toast.error('Failed to load allergies');
      return;
    }
    setAllergies((data || []) as any);
  };

  React.useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, patientId]);

  const addAllergy = async () => {
    if (!patientId) return toast.error('Select a patient first');
    if (!newAllergen) return toast.error('Allergen is required');
    try {
      setLoading(true);
      const { data, error } = await supabase.from('allergies').insert({
        patient_id: patientId,
        allergen: newAllergen,
        severity: newSeverity,
        notes: newNotes || null,
      }).select('id, allergen, severity, notes').single();
      if (error) throw error;
      setAllergies((prev) => [data as any, ...prev]);
      setNewAllergen('');
      setNewSeverity('moderate');
      setNewNotes('');
      toast.success('Allergy added');
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to add allergy');
    } finally {
      setLoading(false);
    }
  };

  const deleteAllergy = async (id: string) => {
    try {
      const { error } = await supabase.from('allergies').delete().eq('id', id);
      if (error) throw error;
      setAllergies((prev) => prev.filter((a) => a.id !== id));
      toast.success('Allergy removed');
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to remove');
    }
  };

  const updateSeverity = async (id: string, severity: string) => {
    try {
      const { error } = await supabase.from('allergies').update({ severity }).eq('id', id);
      if (error) throw error;
      setAllergies((prev) => prev.map((a) => a.id === id ? { ...a, severity } : a));
      onSuccess?.();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to update');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Allergies</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2 md:grid-cols-3">
            <div className="grid gap-2 md:col-span-1">
              <Label htmlFor="allergen">Allergen</Label>
              <Input id="allergen" value={newAllergen} onChange={(e) => setNewAllergen(e.target.value)} placeholder="e.g., Penicillin" />
            </div>
            <div className="grid gap-2 md:col-span-1">
              <Label htmlFor="severity">Severity</Label>
              <select id="severity" className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={newSeverity ?? ''} onChange={(e) => setNewSeverity(e.target.value)}>
                <option value="mild">mild</option>
                <option value="moderate">moderate</option>
                <option value="severe">severe</option>
              </select>
            </div>
            <div className="grid gap-2 md:col-span-1">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} placeholder="Optional" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={addAllergy} disabled={loading}>Add</Button>
          </div>

          <div className="space-y-2">
            {allergies.length === 0 ? (
              <p className="text-sm text-muted-foreground">No allergies recorded.</p>
            ) : (
              allergies.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border rounded-md p-2">
                  <div className="flex-1">
                    <div className="font-medium">{a.allergen}</div>
                    {a.notes ? <div className="text-xs text-muted-foreground">{a.notes}</div> : null}
                  </div>
                  <select className="h-9 rounded-md border border-input bg-background px-2 text-sm" value={normalizeSeverity(a.severity)} onChange={(e) => updateSeverity(a.id, e.target.value)}>
                    <option value="mild">mild</option>
                    <option value="moderate">moderate</option>
                    <option value="severe">severe</option>
                  </select>
                  <Button variant="destructive" size="sm" onClick={() => deleteAllergy(a.id)}>Delete</Button>
                </div>
              ))
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
