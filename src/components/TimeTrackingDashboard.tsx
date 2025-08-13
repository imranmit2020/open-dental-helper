import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  MapPin,
  Shield,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity
} from "lucide-react";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { format } from "date-fns";

interface TimeTrackingDashboardProps {
  employeeId?: string;
}

export function TimeTrackingDashboard({ employeeId }: TimeTrackingDashboardProps) {
  const { timeRecords, workSessions, generateAIInsights } = useTimeTracking(employeeId);
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (workSessions.length > 0) {
      const aiInsights = generateAIInsights(workSessions);
      setInsights(aiInsights);
    }
  }, [workSessions, generateAIInsights]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'status-success';
      case 'flagged': return 'status-warning';
      case 'manual_review': return 'status-warning';
      default: return 'variant="outline"';
    }
  };

  const getVerificationIcon = (method: string) => {
    switch (method) {
      case 'facial_recognition': return <Shield className="h-4 w-4" />;
      case 'manual_verification': return <AlertTriangle className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const todaysRecords = timeRecords.filter(record => 
    new Date(record.timestamp).toDateString() === new Date().toDateString()
  );

  const activeEmployees = new Set(todaysRecords.map(r => r.employee_id)).size;
  const avgProductivity = insights?.productivity_trend || 'medium';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="medical-card">
          <CardContent className="medical-card-header">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-primary text-white">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <div className="medical-stat-value">{todaysRecords.length}</div>
                <div className="medical-stat-label">Today's Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="medical-card-header">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-secondary text-white">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="medical-stat-value">{activeEmployees}</div>
                <div className="medical-stat-label">Active Today</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardContent className="medical-card-header">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary text-primary-foreground">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <div className="medical-stat-value capitalize">{avgProductivity}</div>
                <div className="medical-stat-label">Productivity</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="sessions">Work Sessions</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Recent Activity */}
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Time Tracking Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeRecords.slice(0, 10).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-full bg-muted">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium capitalize">
                          {record.action_type.replace('_', ' ')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(record.timestamp), 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {record.location_data && (
                        <div className="flex items-center gap-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span className="text-muted-foreground">Located</span>
                        </div>
                      )}
                      
                      {record.biometric_data && (
                        <div className="flex items-center gap-1 text-sm">
                          {getVerificationIcon(record.biometric_data.verification_method)}
                          <span className="text-muted-foreground">
                            {(record.biometric_data.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      
                      <Badge className={getStatusColor(record.verification_status)}>
                        {record.verification_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Work Sessions */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Daily Work Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workSessions.slice(0, 7).map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="font-medium">
                        {format(new Date(session.date), 'EEEE, MMM dd')}
                      </div>
                      <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Clock In</div>
                        <div className="font-medium">
                          {session.clock_in_time ? format(new Date(session.clock_in_time), 'HH:mm') : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Clock Out</div>
                        <div className="font-medium">
                          {session.clock_out_time ? format(new Date(session.clock_out_time), 'HH:mm') : '-'}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Total Hours</div>
                        <div className="font-medium">{session.total_hours?.toFixed(1) || '-'}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Break Time</div>
                        <div className="font-medium">{session.break_duration.toFixed(1)}h</div>
                      </div>
                    </div>

                    {session.total_hours && (
                      <div className="mt-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Work Progress</span>
                          <span>{session.total_hours.toFixed(1)}/8.0 hours</span>
                        </div>
                        <Progress value={(session.total_hours / 8) * 100} className="h-2" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights */}
        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {insights ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Performance Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Average Hours/Day:</span>
                          <span className="font-medium">{insights.avg_hours_per_day.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Punctuality Score:</span>
                          <span className="font-medium">{(insights.punctuality_score * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Productivity Trend:</span>
                          <Badge variant={insights.productivity_trend === 'high' ? 'default' : 'secondary'}>
                            {insights.productivity_trend}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold">Recommendations</h4>
                      <div className="space-y-2">
                        {insights.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2 text-sm">
                            <TrendingUp className="h-4 w-4 mt-0.5 text-primary" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-3">Pattern Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">{workSessions.length}</div>
                        <div className="text-sm text-muted-foreground">Days Tracked</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold text-secondary">{insights.punctuality_score > 0.8 ? '🟢' : '🟡'}</div>
                        <div className="text-sm text-muted-foreground">Attendance Health</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg text-center">
                        <div className="text-2xl font-bold text-success">{insights.avg_hours_per_day > 7 ? '⭐' : '👍'}</div>
                        <div className="text-sm text-muted-foreground">Performance</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Not enough data for AI insights</p>
                  <p className="text-sm">Minimum 5 days of data required</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {timeRecords.filter(r => r.verification_status !== 'verified').slice(0, 5).map((record) => (
                  <div key={record.id} className="p-4 border rounded-lg border-warning/20 bg-warning/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium">Security Alert</span>
                      </div>
                      <Badge className="status-warning">{record.verification_status}</Badge>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      <div>Action: {record.action_type.replace('_', ' ')}</div>
                      <div>Time: {format(new Date(record.timestamp), 'MMM dd, HH:mm')}</div>
                      {record.biometric_data && (
                        <div>Confidence: {(record.biometric_data.confidence_score * 100).toFixed(0)}%</div>
                      )}
                    </div>
                  </div>
                ))}

                {timeRecords.filter(r => r.verification_status !== 'verified').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4 text-success" />
                    <p>All recent verifications successful</p>
                    <p className="text-sm">No security issues detected</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}