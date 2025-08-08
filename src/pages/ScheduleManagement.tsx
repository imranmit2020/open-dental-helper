import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DentistAvailabilityManager } from "@/components/DentistAvailabilityManager";
import { StaffAvailabilityManager } from "@/components/StaffAvailabilityManager";

function setSEO() {
  document.title = "Schedule Management | DentalAI Pro";
  const desc = "Manage dentist and staff schedules across clinics";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + "/schedule-management");
}

export default function ScheduleManagement() {
  const [tab, setTab] = useState("dentists");

  useEffect(() => {
    setSEO();
  }, []);

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Schedule Management</h1>
          <p className="text-muted-foreground">Create and edit working hours by role and clinic.</p>
        </div>
      </header>
      <Separator />

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="dentists">Dentists</TabsTrigger>
          <TabsTrigger value="staff">Staff & Hygienists</TabsTrigger>
        </TabsList>

        <TabsContent value="dentists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dentist Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <DentistAvailabilityManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff & Hygienist Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <StaffAvailabilityManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
}
