import React, { useEffect } from "react";
import { AuditLogViewer } from "@/components/AuditLogViewer";
import { useAuditLog } from "@/hooks/useAuditLog";

export default function AdminAuditLog() {
  const { logAction } = useAuditLog();
  useEffect(() => {
    // SEO meta tags
    document.title = "Audit Log | Administration";

    const metaDescId = "meta-description-admin-audit";
    let meta = document.querySelector<HTMLMetaElement>(`meta[name='description']#${metaDescId}`);
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      meta.id = metaDescId;
      document.head.appendChild(meta);
    }
    meta.content = "Admin audit log: view and filter system activity across resources.";

    // Canonical tag
    const canonicalHref = window.location.origin + "/admin/audit-log";
    let canonical = document.querySelector<HTMLLinkElement>("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalHref;
  }, []);

  useEffect(() => {
    logAction({ action: 'VIEW_AUDIT_LOG', resource_type: 'audit_logs', details: { timestamp: new Date().toISOString() } });
  }, [logAction]);

  return (
    <main className="container mx-auto py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="text-muted-foreground">Monitor user actions and access events across resources.</p>
      </header>
      <section aria-label="Audit log entries">
        <AuditLogViewer />
      </section>
    </main>
  );
}
