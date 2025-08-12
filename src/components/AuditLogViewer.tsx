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
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchAuditLogs();
  }, [filter, page]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [filter.action, filter.resource_type, filter.user_id, filter.date_from, filter.date_to]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      let query = supabase
        .from('audit_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);

      if (filter.action && filter.action !== 'all') {
        query = query.eq('action', filter.action);
      }
      if (filter.resource_type && filter.resource_type !== 'all') {
        query = query.eq('resource_type', filter.resource_type);
      }
      if (filter.user_id) {
        query = query.eq('user_id', filter.user_id);
      }
      if (filter.date_from) {
        const startIso = new Date(`${filter.date_from}T00:00:00.000Z`).toISOString();
        query = query.gte('created_at', startIso);
      }
      if (filter.date_to) {
        const endIso = new Date(`${filter.date_to}T23:59:59.999Z`).toISOString();
        query = query.lte('created_at', endIso);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      setTotal(count || 0);

      const rawLogs = (data || []) as unknown as AuditLog[];
      // Fetch related profile info without relying on FK-based embedding
      const userIds = Array.from(new Set(rawLogs.map(l => l.user_id).filter(Boolean)));
      let profilesMap: Record<string, { first_name: string | null; last_name: string | null; email: string | null }> = {};
      if (userIds.length > 0) {
        const { data: profiles, error: pErr } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, email')
          .in('user_id', userIds);
        if (!pErr && profiles) {
          profilesMap = profiles.reduce((acc: any, p: any) => {
            acc[p.user_id] = { first_name: p.first_name, last_name: p.last_name, email: p.email };
            return acc;
          }, {} as Record<string, { first_name: string | null; last_name: string | null; email: string | null }>);
        }
      }

      const enriched = rawLogs.map(l => ({ ...l, profiles: profilesMap[l.user_id] || null }));
      setLogs(enriched);
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
    setPage(1);
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
            {total} entries
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Select value={filter.action || 'all'} onValueChange={(value) => setFilter(prev => ({ ...prev, action: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="VIEW_PATIENT">View Patient</SelectItem>
                <SelectItem value="UPDATE_PATIENT">Update Patient</SelectItem>
                <SelectItem value="VIEW_MEDICAL_RECORD">View Medical Record</SelectItem>
                <SelectItem value="CREATE_APPOINTMENT">Create Appointment</SelectItem>
                <SelectItem value="VIEW_CONSENT_FORM">View Consent Form</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filter.resource_type || 'all'} onValueChange={(value) => setFilter(prev => ({ ...prev, resource_type: value === 'all' ? '' : value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
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
                              {log.profiles
                                ? `${log.profiles.first_name ?? ''} ${log.profiles.last_name ?? ''} (${log.profiles.email ?? 'no email'})`
                                : `User ${log.user_id?.slice(0,8)}`}
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
          <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">Page {page} of {Math.max(1, Math.ceil(total / pageSize))}</span>
            <div className="space-x-2">
              <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <Button onClick={() => setPage(p => (p * pageSize >= total ? p : p + 1))} disabled={page * pageSize >= total}>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}