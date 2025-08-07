import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, User, Building, Phone, Mail } from "lucide-react";

interface ApprovalRequest {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  requested_role: string;
  organization_type: string;
  organization_id: string | null;
  organization_name: string;
  phone: string | null;
  status: string;
  requested_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function AdminApprovalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchApprovalRequests();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('user-approval-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_approval_requests'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          // Refresh the data when changes occur
          fetchApprovalRequests();
          
          // Show toast notification for new requests
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New User Request",
              description: `${payload.new.first_name} ${payload.new.last_name} has requested access`,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchApprovalRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_approval_requests')
        .select('*')
        .order('requested_at', { ascending: false });

      if (error) {
        console.error('Error fetching approval requests:', error);
        toast({
          title: "Error",
          description: "Failed to fetch approval requests",
          variant: "destructive",
        });
        return;
      }

      setRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch approval requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_approval_requests')
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
          admin_notes: adminNotes[requestId] || null,
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error updating approval request:', error);
        toast({
          title: "Error",
          description: `Failed to ${status} user`,
          variant: "destructive",
        });
        return;
      }

      // If approved, create profile
      if (status === 'approved') {
        const request = requests.find(r => r.id === requestId);
        if (request) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: request.user_id,
              first_name: request.first_name,
              last_name: request.last_name,
              email: request.email,
              role: request.requested_role,
            });

          if (profileError) {
            console.error('Error creating profile:', profileError);
            toast({
              title: "Warning",
              description: "User approved but profile creation failed",
              variant: "destructive",
            });
          }
        }
      }

      toast({
        title: "Success",
        description: `User ${status} successfully`,
      });

      fetchApprovalRequests();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: `Failed to ${status} user`,
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const simulateNewRequest = async () => {
    const names = [
      { first: 'Alex', last: 'Johnson', email: 'alex.johnson@newclinic.com' },
      { first: 'Emma', last: 'Davis', email: 'emma.davis@moderndentalcare.com' },
      { first: 'James', last: 'Wilson', email: 'james.wilson@healthsmile.com' },
      { first: 'Sophia', last: 'Miller', email: 'sophia.miller@dentalexcellence.com' }
    ];
    
    const randomName = names[Math.floor(Math.random() * names.length)];
    const roles = ['dentist', 'staff', 'admin'];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    
    try {
      const { error } = await supabase
        .from('user_approval_requests')
        .insert({
          user_id: crypto.randomUUID(),
          email: randomName.email,
          first_name: randomName.first,
          last_name: randomName.last,
          requested_role: randomRole,
          organization_type: 'clinic',
          organization_name: 'New Dental Practice',
          phone: '+1-555-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
          status: 'pending',
          requested_at: new Date().toISOString()
        });
        
      if (error) {
        console.error('Error creating test request:', error);
        toast({
          title: "Error",
          description: "Failed to create test request",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Test Request Created",
          description: "A new approval request has been simulated",
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Approval Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Review and approve new user registrations ({pendingCount} pending)
            </p>
          </div>
          <Button onClick={simulateNewRequest} variant="outline">
            Simulate New Request
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No approval requests found</p>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="w-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-lg">
                        {request.first_name} {request.last_name}
                      </CardTitle>
                      <CardDescription>
                        Requested: {new Date(request.requested_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(request.status)}
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{request.email}</span>
                    </div>
                    {request.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{request.phone}</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {request.organization_name} ({request.organization_type})
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Requested Role: <span className="font-medium">{request.requested_role}</span>
                    </div>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <label className="text-sm font-medium text-foreground">
                        Admin Notes (Optional)
                      </label>
                      <Textarea
                        placeholder="Add notes about this approval decision..."
                        value={adminNotes[request.id] || ''}
                        onChange={(e) =>
                          setAdminNotes({
                            ...adminNotes,
                            [request.id]: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={() => handleApproval(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleApproval(request.id, 'rejected')}
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}

                {request.admin_notes && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-foreground">Admin Notes:</p>
                    <p className="text-sm text-muted-foreground mt-1">{request.admin_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}