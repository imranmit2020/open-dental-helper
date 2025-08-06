import React, { useEffect } from "react";
import { ConsentFormsManager } from "@/components/ConsentFormsManager";
import { useAuth } from "@/hooks/useAuth";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useErrorLogger } from "@/hooks/useErrorLogger";
import { useToast } from "@/hooks/use-toast";

const ConsentForms = () => {
  const { user } = useAuth();
  const { logAction } = useAuditLog();
  const { logUIError } = useErrorLogger();
  const { toast } = useToast();

  // Audit logging on page access
  useEffect(() => {
    if (user) {
      logAction({
        action: 'VIEW_CONSENT_FORMS',
        resource_type: 'consent_forms',
        details: { timestamp: new Date().toISOString() }
      }).catch(error => {
        logUIError(error, 'ConsentForms', 'page_access');
        toast({
          title: "Logging Error",
          description: "Failed to record audit log",
          variant: "destructive"
        });
      });
    }
  }, [user, logAction, logUIError]);

  return (
    <div className="container mx-auto py-8">
      <ConsentFormsManager />
    </div>
  );
};

export default ConsentForms;