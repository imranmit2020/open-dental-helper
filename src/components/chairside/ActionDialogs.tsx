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
      const { error } = await supabase.from("medications").insert({
        patient_id: patientId,
        prescribed_by: user?.id || null,
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
        dentist_id: user?.id || null,
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
