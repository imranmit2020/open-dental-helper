import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Calendar, 
  Clock, 
  Users, 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  MessageSquare,
  Settings,
  HelpCircle,
  Zap,
  TrendingUp,
  Heart,
  Shield
} from 'lucide-react';

const RightNavigation = () => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="fixed right-0 top-0 h-full w-72 bg-gradient-card border-l border-border/50 shadow-elegant overflow-y-auto">
      <div className="p-6 space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="text-lg font-semibold text-foreground">{currentTime}</div>
          <div className="text-sm text-muted-foreground">{currentDate}</div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <Card className="professional-card border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Today's Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 rounded-lg bg-primary-light/30 border border-primary/20">
                <div className="text-xl font-bold text-primary">12</div>
                <div className="text-xs text-muted-foreground">Appointments</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-secondary-light/30 border border-secondary/20">
                <div className="text-xl font-bold text-secondary">8</div>
                <div className="text-xs text-muted-foreground">Patients</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Revenue Today</span>
              <span className="font-semibold text-success">$2,450</span>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="professional-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                Notifications
              </div>
              <Badge variant="secondary" className="text-xs">3</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-info-light/30 border border-info/20">
              <CheckCircle className="h-4 w-4 text-success mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Lab Results Ready</p>
                <p className="text-xs text-muted-foreground">Patient John Doe - X-ray analysis complete</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-warning-light/30 border border-warning/20">
              <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Appointment Reminder</p>
                <p className="text-xs text-muted-foreground">Next patient in 15 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-primary-light/30 border border-primary/20">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">New Message</p>
                <p className="text-xs text-muted-foreground">Dr. Smith sent a consultation note</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="professional-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/patient1.jpg" />
                <AvatarFallback className="text-xs bg-primary-light text-primary">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">John Doe</p>
                <p className="text-xs text-muted-foreground">Checked in - Room 3</p>
              </div>
              <div className="text-xs text-muted-foreground">2m ago</div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/patient2.jpg" />
                <AvatarFallback className="text-xs bg-secondary-light text-secondary">SM</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Sarah Miller</p>
                <p className="text-xs text-muted-foreground">Payment processed</p>
              </div>
              <div className="text-xs text-muted-foreground">5m ago</div>
            </div>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/patient3.jpg" />
                <AvatarFallback className="text-xs bg-info-light text-info">RJ</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Robert Johnson</p>
                <p className="text-xs text-muted-foreground">Appointment completed</p>
              </div>
              <div className="text-xs text-muted-foreground">12m ago</div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="professional-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="flex-col h-auto p-3 border-primary/20 hover:bg-primary-light/20">
                <Calendar className="h-4 w-4 text-primary mb-1" />
                <span className="text-xs">Schedule</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto p-3 border-secondary/20 hover:bg-secondary-light/20">
                <Users className="h-4 w-4 text-secondary mb-1" />
                <span className="text-xs">Patients</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto p-3 border-info/20 hover:bg-info-light/20">
                <MessageSquare className="h-4 w-4 text-info mb-1" />
                <span className="text-xs">Messages</span>
              </Button>
              <Button variant="outline" size="sm" className="flex-col h-auto p-3 border-success/20 hover:bg-success-light/20">
                <TrendingUp className="h-4 w-4 text-success mb-1" />
                <span className="text-xs">Reports</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="professional-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm text-foreground">Server Status</span>
              </div>
              <Badge variant="outline" className="text-xs text-success border-success/20">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success"></div>
                <span className="text-sm text-foreground">Database</span>
              </div>
              <Badge variant="outline" className="text-xs text-success border-success/20">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning"></div>
                <span className="text-sm text-foreground">Backup</span>
              </div>
              <Badge variant="outline" className="text-xs text-warning border-warning/20">Syncing</Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Last backup</span>
              <span>2 hours ago</span>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <HelpCircle className="h-4 w-4 mr-2" />
            Help
          </Button>
        </div>

      </div>
    </div>
  );
};

export default RightNavigation;