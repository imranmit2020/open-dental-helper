export interface ToothData {
  id: number;
  number: string;
  name: string;
  quadrant: number;
  conditions: string[];
  treatments: string[];
  status: "healthy" | "diagnosed" | "in_progress" | "treated" | "missing";
  severity?: "mild" | "moderate" | "severe";
  notes?: string;
  lastUpdated: Date;
}

export interface ChartingEntry {
  id: string;
  toothNumber: number;
  condition: string;
  treatment: string;
  severity: "mild" | "moderate" | "severe";
  notes: string;
  date: Date;
  dentistId: string;
  dentistName: string;
}

export interface TreatmentPlan {
  id: string;
  toothNumber: number;
  procedure: string;
  priority: "urgent" | "high" | "medium" | "low";
  estimatedCost: number;
  estimatedDuration: number;
  notes: string;
  scheduledDate?: Date;
  status: "planned" | "scheduled" | "in_progress" | "completed";
  prerequisites?: string[];
}

export interface DentalCondition {
  id: string;
  name: string;
  category: "caries" | "periodontal" | "endodontic" | "prosthetic" | "orthodontic" | "oral_surgery";
  severity: "mild" | "moderate" | "severe";
  description: string;
  treatmentOptions: string[];
}

export interface DentalTreatment {
  id: string;
  name: string;
  category: "restorative" | "endodontic" | "periodontal" | "prosthetic" | "orthodontic" | "surgical";
  duration: number; // in minutes
  cost: number;
  description: string;
  prerequisites?: string[];
}