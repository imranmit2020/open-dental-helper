import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Clock, CheckCircle, AlertCircle, Download, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ConsentForm {
  id: string;
  treatment_type: string;
  status: string;
  form_data: any;
  signature?: string;
  submitted_at?: string;
  expires_at?: string;
  created_at: string;
}

const MyConsentForms = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consentForms, setConsentForms] = useState<ConsentForm[]>([]);

  useEffect(() => {
    fetchConsentForms();
  }, [user]);

  const fetchConsentForms = async () => {
    if (!user) return;

    try {
      // First get patient record
      const { data: patient, error: patientError } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (patientError) throw patientError;

      // Then get consent forms
      const { data, error } = await supabase
        .from('consent_forms')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setConsentForms(data || []);
    } catch (error) {
      console.error('Error fetching consent forms:', error);
      toast({
        title: "Error",
        description: "Failed to load consent forms",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'signed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'signed':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'expired':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const needsAttention = consentForms.filter(form => 
    form.status === 'pending' || isExpired(form.expires_at)
  );

  const completedForms = consentForms.filter(form => 
    form.status === 'completed' || form.status === 'signed'
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              My Consent Forms
            </h1>
            <p className="text-muted-foreground mt-2">
              View and manage your treatment consent forms and agreements
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Forms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">{consentForms.length}</p>
                <FileText className="w-6 h-6 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Needs Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-orange-600">{needsAttention.length}</p>
                <AlertCircle className="w-6 h-6 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-600">{completedForms.length}</p>
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Forms */}
        {needsAttention.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="w-5 h-5" />
                Forms Requiring Attention
              </CardTitle>
              <CardDescription>
                These forms need to be reviewed and signed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {needsAttention.map((form) => {
                  const StatusIcon = getStatusIcon(form.status);
                  const expired = isExpired(form.expires_at);
                  
                  return (
                    <div
                      key={form.id}
                      className={`p-4 rounded-lg border ${
                        expired ? 'border-destructive bg-destructive/5' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" />
                            <h4 className="font-medium">{form.treatment_type}</h4>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Created: {format(new Date(form.created_at), 'MMM dd, yyyy')}</p>
                            {form.expires_at && (
                              <p className={expired ? 'text-destructive font-medium' : ''}>
                                {expired ? 'Expired' : 'Expires'}: {format(new Date(form.expires_at), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={expired ? 'destructive' : getStatusColor(form.status)}>
                            {expired ? 'Expired' : form.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {!expired && form.status === 'pending' && (
                              <Button size="sm">
                                Sign Now
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Consent Forms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              All Consent Forms
            </CardTitle>
            <CardDescription>
              Complete history of your consent forms and agreements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {consentForms.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No consent forms found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consentForms.map((form) => {
                  const StatusIcon = getStatusIcon(form.status);
                  const expired = isExpired(form.expires_at);
                  
                  return (
                    <div
                      key={form.id}
                      className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StatusIcon className="w-4 h-4" />
                            <h4 className="font-medium">{form.treatment_type}</h4>
                          </div>
                          <div className="text-sm text-muted-foreground grid grid-cols-1 md:grid-cols-2 gap-2">
                            <p>Created: {format(new Date(form.created_at), 'MMM dd, yyyy')}</p>
                            {form.submitted_at && (
                              <p>Signed: {format(new Date(form.submitted_at), 'MMM dd, yyyy')}</p>
                            )}
                            {form.expires_at && (
                              <p>
                                {expired ? 'Expired' : 'Expires'}: {format(new Date(form.expires_at), 'MMM dd, yyyy')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={expired ? 'destructive' : getStatusColor(form.status)}>
                            {expired ? 'Expired' : form.status}
                          </Badge>
                          <div className="flex gap-1">
                            <Button variant="outline" size="sm">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            {(form.status === 'completed' || form.status === 'signed') && (
                              <Button variant="outline" size="sm">
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyConsentForms;