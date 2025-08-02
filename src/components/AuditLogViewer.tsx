import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  patient_id: string | null;
  details: any;
  ip_address: string | null;
  user_agent: string | null;
  session_id: string | null;
  created_at: string;
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
}

export function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    action: '',
    resource_type: '',
    user_id: '',
    date_from: '',
    date_to: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchAuditLogs();
  }, [filter]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('audit_logs')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filter.action) {
        query = query.eq('action', filter.action);
      }
      if (filter.resource_type) {
        query = query.eq('resource_type', filter.resource_type);
      }
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }
      if (filter.date_from) {
        query = query.gte('created_at', filter.date_from);
      }
      if (filter.date_to) {
        query = query.lte('created_at', filter.date_to);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs((data || []) as unknown as AuditLog[]);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'view_patient':
      case 'view_medical_record':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'update_patient':
      case 'create_appointment':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'delete':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const clearFilters = () => {
    setFilter({
      action: '',
      resource_type: '',
      user_id: '',
      date_from: '',
      date_to: '',
    });
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>HIPAA Audit Logs</CardTitle>
          </div>
          <Badge variant="outline" className="ml-auto">
            {logs.length} entries
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Select value={filter.action} onValueChange={(value) => setFilter(prev => ({ ...prev, action: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Actions</SelectItem>
                <SelectItem value="VIEW_PATIENT">View Patient</SelectItem>
                <SelectItem value="UPDATE_PATIENT">Update Patient</SelectItem>
                <SelectItem value="VIEW_MEDICAL_RECORD">View Medical Record</SelectItem>
                <SelectItem value="CREATE_APPOINTMENT">Create Appointment</SelectItem>
                <SelectItem value="VIEW_CONSENT_FORM">View Consent Form</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.resource_type} onValueChange={(value) => setFilter(prev => ({ ...prev, resource_type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Resources</SelectItem>
                <SelectItem value="patients">Patients</SelectItem>
                <SelectItem value="medical_records">Medical Records</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="consent_forms">Consent Forms</SelectItem>
                <SelectItem value="image_analyses">Image Analyses</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="From date"
              value={filter.date_from}
              onChange={(e) => setFilter(prev => ({ ...prev, date_from: e.target.value }))}
            />

            <Input
              type="date"
              placeholder="To date"
              value={filter.date_to}
              onChange={(e) => setFilter(prev => ({ ...prev, date_to: e.target.value }))}
            />

            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading audit logs...</div>
            ) : logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
            ) : (
              logs.map((log) => (
                <Card key={log.id} className="border-l-4 border-l-primary/20">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getActionColor(log.action)}>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                          <Badge variant="outline">{log.resource_type}</Badge>
                        </div>

                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>
                              {log.profiles?.first_name} {log.profiles?.last_name} ({log.profiles?.email})
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Session: {log.session_id?.slice(-8)}</span>
                          </div>
                        </div>

                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                            <strong>Details:</strong> {JSON.stringify(log.details, null, 2)}
                          </div>
                        )}

                        {log.patient_id && (
                          <div className="text-sm text-muted-foreground">
                            <strong>Patient ID:</strong> {log.patient_id}
                          </div>
                        )}

                        {log.user_agent && (
                          <div className="text-xs text-muted-foreground truncate max-w-md">
                            <strong>User Agent:</strong> {log.user_agent}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}