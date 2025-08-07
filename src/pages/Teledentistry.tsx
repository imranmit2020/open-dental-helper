import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video,
  Calendar,
  Clock,
  User,
  Plus,
  Activity,
  FileText,
  Brain,
  Users,
  Phone
} from 'lucide-react';
import { useTeledentistry } from '@/hooks/useTeledentistry';
import { useSubscription } from '@/hooks/useSubscription';
import TeledentistrySessionManager from '@/components/TeledentistrySessionManager';
import NewTeledentistrySessionForm from '@/components/NewTeledentistrySessionForm';
import { useToast } from '@/hooks/use-toast';

export default function Teledentistry() {
  const { toast } = useToast();
  const { hasFeature } = useSubscription();
  const { todaySessions, isLoading } = useTeledentistry();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [showNewSessionForm, setShowNewSessionForm] = useState(false);

  // Check subscription access
  if (!hasFeature('teledentistry')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
            <Video className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Teledentistry</h1>
            <p className="text-muted-foreground mt-2">
              Upgrade to access virtual consultations with AI-powered documentation
            </p>
          </div>
          <Card className="max-w-md mx-auto">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Premium Features Include:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• HD Video Consultations</li>
                  <li>• AI-Powered Transcription</li>
                  <li>• Automatic SOAP Notes</li>
                  <li>• Session Recording</li>
                  <li>• Patient Screen Sharing</li>
                </ul>
              </div>
              <Button className="w-full">Upgrade to Premium</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If a session is selected, show the session manager
  if (selectedSession) {
    return (
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setSelectedSession(null)}
            className="mb-4"
          >
            ← Back to Sessions
          </Button>
        </div>
        <TeledentistrySessionManager 
          session={selectedSession}
          onSessionEnd={() => setSelectedSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Video className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">Teledentistry</h1>
            <p className="text-muted-foreground">AI-enhanced virtual dental consultations</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="hidden sm:flex">
            <Activity className="w-3 h-3 mr-1" />
            AI Enabled
          </Badge>
          <Button onClick={() => setShowNewSessionForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Session
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todaySessions.length}</p>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {todaySessions.filter(s => s.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {todaySessions.filter(s => s.status === 'scheduled').length}
                </p>
                <p className="text-sm text-muted-foreground">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {todaySessions.filter(s => s.ai_soap_notes).length}
                </p>
                <p className="text-sm text-muted-foreground">AI Documented</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Teledentistry Sessions
          </CardTitle>
          <CardDescription>
            Manage your virtual consultation appointments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading sessions...</p>
            </div>
          ) : todaySessions.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No sessions scheduled</h3>
              <p className="text-muted-foreground mb-4">
                Start by scheduling a teledentistry consultation
              </p>
              <Button onClick={() => setShowNewSessionForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Schedule Session
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{session.patient_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {session.session_type} • {new Date(session.scheduled_at).toLocaleTimeString()}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant={
                              session.status === 'completed' ? 'default' :
                              session.status === 'in_progress' ? 'secondary' :
                              'outline'
                            }
                            className="text-xs"
                          >
                            {session.status.replace('_', ' ')}
                          </Badge>
                          {session.ai_soap_notes && (
                            <Badge variant="outline" className="text-xs">
                              <Brain className="w-3 h-3 mr-1" />
                              AI Documented
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.status === 'scheduled' && (
                        <Button 
                          onClick={() => setSelectedSession(session)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Start Session
                        </Button>
                      )}
                      {session.status === 'in_progress' && (
                        <Button 
                          onClick={() => setSelectedSession(session)}
                          variant="outline"
                        >
                          <Video className="w-4 h-4 mr-2" />
                          Rejoin Session
                        </Button>
                      )}
                      {session.status === 'completed' && session.ai_soap_notes && (
                        <Button 
                          onClick={() => setSelectedSession(session)}
                          variant="outline"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          View Notes
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started with Teledentistry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">1. Schedule Session</h3>
              <p className="text-sm text-muted-foreground">
                Create a new teledentistry appointment with your patient
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Video className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">2. Start Consultation</h3>
              <p className="text-sm text-muted-foreground">
                Begin secure video call with HD quality and screen sharing
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Brain className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">3. AI Documentation</h3>
              <p className="text-sm text-muted-foreground">
                Let AI automatically generate SOAP notes and transcriptions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* New Session Form Modal */}
      {showNewSessionForm && (
        <NewTeledentistrySessionForm
          onClose={() => setShowNewSessionForm(false)}
          onSuccess={() => setShowNewSessionForm(false)}
        />
      )}
    </div>
  );
}