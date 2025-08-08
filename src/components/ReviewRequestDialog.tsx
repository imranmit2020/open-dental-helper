import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useOptimizedPatients } from "@/hooks/useOptimizedPatients";
import type { Patient } from "@/hooks/usePatients";
import { debounce } from "@/utils/debounce";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Phone, Copy, Star } from "lucide-react";

interface ReviewRequestDialogProps {
  trigger?: React.ReactNode;
}

type Platform = "google" | "facebook" | "instagram";

const DEFAULT_LINKS: Record<Platform, string> = {
  google: "https://g.page/r/your-google-review-link",
  facebook: "https://www.facebook.com/yourpage/reviews/",
  instagram: "https://www.instagram.com/yourprofile/",
};

export default function ReviewRequestDialog({ trigger }: ReviewRequestDialogProps) {
  const { toast } = useToast();
  const { searchPatients } = useOptimizedPatients();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [platforms, setPlatforms] = useState<Record<Platform, boolean>>({
    google: true,
    facebook: true,
    instagram: true,
  });

  const runSearch = useMemo(
    () =>
      debounce(async (q: string) => {
        const t = q.trim();
        if (t.length < 3) {
          setResults([]);
          setLoading(false);
          return;
        }
        try {
          const r = await searchPatients(t);
          setResults(r);
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      }, 300),
    [searchPatients]
  );

  const linksForSelected = (): { platform: Platform; url: string }[] => {
    const enabled = (Object.keys(platforms) as Platform[]).filter((p) => platforms[p]);
    return enabled.map((p) => ({ platform: p, url: DEFAULT_LINKS[p] }));
  };

  const handleCopy = async () => {
    const links = linksForSelected()
      .map((l) => `${l.platform.toUpperCase()}: ${l.url}`)
      .join("\n");
    try {
      await navigator.clipboard.writeText(
        `Hi ${selected?.first_name || "there"},\nWe'd appreciate your review!\n\n${links}`
      );
      toast({ title: "Copied", description: "Review links copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy to clipboard", variant: "destructive" });
    }
  };

  const handleEmail = () => {
    if (!selected?.email) {
      toast({ title: "No email", description: "This patient has no email on file" });
      return;
    }
    const subject = encodeURIComponent("We value your feedback");
    const body = encodeURIComponent(
      `Hi ${selected.first_name},\n\nThanks for visiting us! Would you mind sharing a quick review?\n\n${linksForSelected()
        .map((l) => `${l.platform.toUpperCase()}: ${l.url}`)
        .join("\n")}\n\nThank you!`
    );
    window.location.href = `mailto:${selected.email}?subject=${subject}&body=${body}`;
  };

  const handleSms = () => {
    if (!selected?.phone) {
      toast({ title: "No phone", description: "This patient has no phone on file" });
      return;
    }
    const body = encodeURIComponent(
      `Hi ${selected.first_name}, please leave us a quick review: ${linksForSelected()
        .map((l) => `${l.platform}: ${l.url}`)
        .join(" | ")}`
    );
    // sms: works on mobile devices
    window.location.href = `sms:${selected.phone}?&body=${body}`;
  };

  const logRequests = async () => {
    if (!selected) return;
    const rows = linksForSelected().map((l) => ({
      patient_id: selected.id,
      platform: l.platform,
      status: "pending" as const,
      request_sent_at: new Date().toISOString(),
      response_required: false,
    }));
    const { error } = await supabase.from("review_requests").insert(rows);
    if (error) throw error;
  };

  const onSend = async (mode: "email" | "sms" | "copy") => {
    try {
      if (!selected) {
        toast({ title: "Select a patient", description: "Please choose a patient first" });
        return;
      }
      await logRequests();
      if (mode === "email") handleEmail();
      if (mode === "sms") handleSms();
      if (mode === "copy") await handleCopy();
      toast({ title: "Review request prepared", description: "Links are ready to share" });
      setOpen(false);
    } catch (e) {
      console.error("Error sending review request:", e);
      toast({ title: "Error", description: "Failed to prepare review request", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full justify-start">
            <Star className="w-4 h-4 mr-2" />
            Request Feedback
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Patient Review</DialogTitle>
          <DialogDescription>Select a patient and share review links</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search">Find Patient</Label>
            <div className="relative">
              <Input
                id="search"
                placeholder="Search by name or email"
                value={query}
                onChange={(e) => {
                  const v = e.target.value;
                  setQuery(v);
                  setSelected(null);
                  if (v.length > 2) {
                    setLoading(true);
                    runSearch(v);
                  } else {
                    setResults([]);
                  }
                }}
              />
              {(loading || (query.length > 2 && results.length > 0)) && !selected && (
                <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow max-h-60 overflow-auto">
                  {loading ? (
                    <div className="p-3 text-sm text-muted-foreground">Searching…</div>
                  ) : (
                    results.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground"
                        onClick={() => {
                          setSelected(p);
                          setResults([]);
                          setQuery(`${p.first_name} ${p.last_name}`);
                        }}
                      >
                        <div className="font-medium">{p.first_name} {p.last_name}</div>
                        <div className="text-xs text-muted-foreground">{p.email || p.phone || "No contact info"}</div>
                      </button>
                    ))
                  )}
                  {!loading && results.length === 0 && query.length > 2 && (
                    <div className="p-3 text-sm text-muted-foreground">No patients found</div>
                  )}
                </div>
              )}
            </div>
            {selected && (
              <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                <Badge variant="secondary">{selected.first_name} {selected.last_name}</Badge>
                {selected.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{selected.email}</span>}
                {selected.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{selected.phone}</span>}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Platforms</Label>
            <div className="grid grid-cols-3 gap-3">
              {(["google", "facebook", "instagram"] as Platform[]).map((p) => (
                <label key={p} className="flex items-center gap-2 border rounded-md p-2">
                  <Checkbox checked={platforms[p]} onCheckedChange={(v) => setPlatforms((s) => ({ ...s, [p]: Boolean(v) }))} />
                  <span className="capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button variant="outline" onClick={() => onSend("email")} disabled={!selected}>
              <Mail className="w-4 h-4 mr-2" /> Email
            </Button>
            <Button variant="outline" onClick={() => onSend("sms")} disabled={!selected}>
              <Phone className="w-4 h-4 mr-2" /> SMS
            </Button>
            <Button variant="outline" onClick={() => onSend("copy")} disabled={!selected}>
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: Configure your actual review URLs in DEFAULT_LINKS inside ReviewRequestDialog.tsx
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
