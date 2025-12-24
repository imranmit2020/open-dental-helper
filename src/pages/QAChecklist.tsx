import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Download, ClipboardCheck, RefreshCcw } from "lucide-react";

interface SectionItem {
  id: string;
  label: string;
}

interface Section {
  id: string;
  title: string;
  items: SectionItem[];
}

const sections: Section[] = [
  {
    id: "auth",
    title: "Authentication & Profiles",
    items: [
      { id: "auth-signup-approval", label: "Sign up triggers approval request and profile creation" },
      { id: "auth-approve-role", label: "Admin approves user and role applied in profiles" },
      { id: "auth-reset", label: "Reset password flow sends email and updates credentials" },
      { id: "auth-session", label: "Session persists across reload and sign out clears it" },
    ],
  },
  {
    id: "tenant-roles",
    title: "Tenant & Role Access",
    items: [
      { id: "tenant-switch", label: "Switching Clinic updates data across all modules" },
      { id: "tenant-rls", label: "Cross-tenant data is not visible (RLS enforced)" },
      { id: "roles-ui", label: "UI hides modules for insufficient roles" },
    ],
  },
  {
    id: "patients",
    title: "Patients & Profile",
    items: [
      { id: "patients-create", label: "Create patient works and duplicate detection respected" },
      { id: "patients-search", label: "Search/autocomplete returns expected patients" },
      { id: "patients-profile", label: "Patient Profile shows demographics, risk, next appt" },
      { id: "patients-treatments", label: "Treatments tab paginates 10/pg and sorts by date desc" },
      { id: "patients-billed", label: "Billed totals match invoices for same visit date" },
    ],
  },
  {
    id: "appointments",
    title: "Appointments",
    items: [
      { id: "appt-create", label: "Create appointment with defaults and conflict handling" },
      { id: "appt-complete-lastvisit", label: "Mark completed updates patient.last_visit" },
      { id: "appt-realtime", label: "Real-time updates reflect across tabs" },
      { id: "appt-delete", label: "Delete reconciles UI via optimistic updates" },
    ],
  },
  {
    id: "clinical",
    title: "Medical Records & Clinical Data",
    items: [
      { id: "clinical-records", label: "Add medical_records shows in lists with status badges" },
      { id: "clinical-meds", label: "Medications CRUD and statuses render correctly" },
      { id: "clinical-allergies", label: "Allergies CRUD and severities render" },
      { id: "clinical-conditions", label: "Conditions CRUD and statuses render" },
    ],
  },
  {
    id: "consent",
    title: "Consent Forms",
    items: [
      { id: "consent-send", label: "Send consent creates pending record" },
      { id: "consent-sign", label: "Signing sets submitted_at and updates status" },
      { id: "consent-visibility", label: "Visibility limited to tenant staff or owning patient" },
    ],
  },
  {
    id: "billing",
    title: "Billing & Invoices",
    items: [
      { id: "billing-generate", label: "Generate invoice creates invoices + items with correct totals" },
      { id: "billing-currency", label: "Currency selector updates display via CurrencyDisplay" },
      { id: "billing-status", label: "Status transitions (draft/sent/paid) reflect in UI" },
    ],
  },
  {
    id: "chairside",
    title: "Chairside Assistant",
    items: [
      { id: "chairside-alerts", label: "Alerts/anesthesia recommendations reflect allergies/meds/conditions" },
      { id: "chairside-actions", label: "Quick actions create records (prescriptions, follow-ups)" },
      { id: "chairside-seed", label: "Seed demo function populates expected data" },
    ],
  },
  {
    id: "teledentistry",
    title: "Teledentistry",
    items: [
      { id: "tele-create", label: "Create session and follow status lifecycle" },
      { id: "tele-access", label: "Only assigned staff can enter; patient sees own sessions" },
      { id: "tele-transcription", label: "Recording/transcription outputs attach correctly" },
    ],
  },
  {
    id: "imaging",
    title: "Image Analysis / X-Ray",
    items: [
      { id: "img-upload", label: "Upload attaches image_analyses with pending status" },
      { id: "img-complete", label: "Edge function completes with findings and overlays render" },
      { id: "img-rls", label: "Only tenant staff and owning patient can view" },
    ],
  },
  {
    id: "analytics",
    title: "Analytics",
    items: [
      { id: "analytics-tenant", label: "Tenant charts load and filter by date without errors" },
      { id: "analytics-corp", label: "Corporate admin can view aggregate revenue, staff cannot" },
      { id: "analytics-empty", label: "Empty states render nicely; tooltips/legends work" },
    ],
  },
  {
    id: "security",
    title: "Access Control & RLS",
    items: [
      { id: "rls-cross", label: "Cross-tenant attempts return 401/403" },
      { id: "rls-crud", label: "Policies cover INSERT/SELECT/UPDATE/DELETE across tables used" },
      { id: "public-no-leak", label: "Public/portal pages don’t expose private data" },
    ],
  },
];

const STORAGE_KEY = "qa-checklist-progress";

export default function QAChecklist() {
  const { toast } = useToast();
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    document.title = "QA Checklist | DentalAI";
    const desc = "Run end-to-end QA checks across modules: auth, patients, appointments, billing, and more.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);

    // canonical tag
    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'canonical');
      document.head.appendChild(link);
    }
    link.setAttribute('href', window.location.href);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  }, [checked]);

  const totals = useMemo(() => {
    const allIds = sections.flatMap(s => s.items.map(i => i.id));
    const completed = allIds.filter(id => checked[id]).length;
    return { completed, total: allIds.length };
  }, [checked]);

  const toggle = (id: string, value: boolean) =>
    setChecked(prev => ({ ...prev, [id]: value }));

  const setSection = (section: Section, value: boolean) => {
    const updates: Record<string, boolean> = {};
    section.items.forEach(i => { updates[i.id] = value; });
    setChecked(prev => ({ ...prev, ...updates }));
  };

  const resetAll = () => {
    setChecked({});
  };

  const copyMarkdown = async () => {
    const lines: string[] = [];
    lines.push(`# QA Checklist Summary`);
    lines.push("");
    lines.push(`Overall: ${totals.completed}/${totals.total} completed`);
    lines.push("");
    sections.forEach(sec => {
      const secCompleted = sec.items.filter(i => checked[i.id]).length;
      lines.push(`## ${sec.title} (${secCompleted}/${sec.items.length})`);
      sec.items.forEach(i => {
        lines.push(`- [${checked[i.id] ? 'x' : ' '}] ${i.label}`);
      });
      lines.push("");
    });
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast({ title: "Copied", description: "QA progress copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Couldn’t access clipboard", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6">
      <header className="max-w-6xl mx-auto mb-6">
        <h1 className="text-3xl font-bold tracking-tight">QA Checklist</h1>
        <p className="text-muted-foreground mt-1">Track end-to-end tests across all modules.</p>
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <Progress value={(totals.completed / totals.total) * 100} />
          </div>
          <Badge variant="outline" className="px-3 py-1">
            {totals.completed} / {totals.total}
          </Badge>
          <Button variant="outline" onClick={copyMarkdown} className="hover:bg-primary/5">
            <ClipboardCheck className="w-4 h-4 mr-2" /> Copy report
          </Button>
          <Button variant="outline" onClick={resetAll} className="hover:bg-destructive/5">
            <RefreshCcw className="w-4 h-4 mr-2" /> Reset all
          </Button>
        </div>
      </header>
      <aside className="max-w-6xl mx-auto mb-6">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-medium">Test fixtures</h2>
              <p className="text-xs text-muted-foreground">Download realistic synthetic data JSON & CSV files.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/patients.json" target="_blank" rel="noreferrer">patients.json</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/patients.csv" target="_blank" rel="noreferrer">patients.csv</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/appointments.json" target="_blank" rel="noreferrer">appointments.json</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/appointments.csv" target="_blank" rel="noreferrer">appointments.csv</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/invoices.json" target="_blank" rel="noreferrer">invoices.json</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/invoices.csv" target="_blank" rel="noreferrer">invoices.csv</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/consent_forms.json" target="_blank" rel="noreferrer">consent_forms.json</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/consent_forms.csv" target="_blank" rel="noreferrer">consent_forms.csv</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/image_analyses.json" target="_blank" rel="noreferrer">image_analyses.json</a>
              <a className="text-xs underline underline-offset-2 hover:text-primary" href="/seed/image_analyses.csv" target="_blank" rel="noreferrer">image_analyses.csv</a>
            </div>
          </div>
        </div>
      </aside>

      <main className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sections.map((section) => {
          const completed = section.items.filter(i => checked[i.id]).length;
          const pct = (completed / section.items.length) * 100;
          return (
            <Card key={section.id} className="bg-card/60 backdrop-blur-sm border-border/50 shadow-xl">
              <CardHeader className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{section.title}</CardTitle>
                  <Badge variant="secondary">{completed}/{section.items.length}</Badge>
                </div>
                <Progress value={pct} className="h-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.items.map(item => (
                    <label key={item.id} className={cn("flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer")}> 
                      <Checkbox
                        checked={!!checked[item.id]}
                        onCheckedChange={(v) => toggle(item.id, Boolean(v))}
                      />
                      <span className="leading-snug">{item.label}</span>
                    </label>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center gap-3">
                  <Button size="sm" variant="outline" onClick={() => setSection(section, true)}>
                    Mark section done
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setSection(section, false)}>
                    Clear section
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </main>
    </div>
  );
}
