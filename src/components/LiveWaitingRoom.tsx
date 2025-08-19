import React, { useState, useEffect } from 'react';
import { Users, Clock, CheckCircle, AlertCircle, Phone, MessageSquare, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface WaitingPatient {
  id: string;
  name: string;
  appointment_time: Date;
  check_in_time?: Date;
  estimated_wait: number;
  status: 'waiting' | 'called' | 'in_progress' | 'completed';
  priority: 'normal' | 'urgent' | 'emergency';
  chair_assignment?: string;
  dentist: string;
  procedure: string;
  contact: {
    phone: string;
    email: string;
  };
}

export function LiveWaitingRoom() {
  const [waitingPatients, setWaitingPatients] = useState<WaitingPatient[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Initialize mock data and real-time updates
  useEffect(() => {
    const mockPatients: WaitingPatient[] = [
      {
        id: '1',
        name: 'Sarah Johnson',
        appointment_time: new Date(Date.now() - 10 * 60000), // 10 minutes ago
        check_in_time: new Date(Date.now() - 8 * 60000),
        estimated_wait: 15,
        status: 'waiting',
        priority: 'normal',
        dentist: 'Dr. Smith',
        procedure: 'Cleaning',
        contact: {
          phone: '(555) 123-4567',
          email: 'sarah.j@email.com'
        }
      },
      {
        id: '2',
        name: 'Michael Chen',
        appointment_time: new Date(Date.now() + 5 * 60000), // 5 minutes from now
        estimated_wait: 20,
        status: 'waiting',
        priority: 'urgent',
        chair_assignment: 'Chair 2',
        dentist: 'Dr. Wilson',
        procedure: 'Root Canal',
        contact: {
          phone: '(555) 234-5678',
          email: 'michael.c@email.com'
        }
      },
      {
        id: '3',
        name: 'Emma Davis',
        appointment_time: new Date(Date.now() + 15 * 60000), // 15 minutes from now
        estimated_wait: 5,
        status: 'called',
        priority: 'normal',
        chair_assignment: 'Chair 1',
        dentist: 'Dr. Johnson',
        procedure: 'Checkup',
        contact: {
          phone: '(555) 345-6789',
          email: 'emma.d@email.com'
        }
      }
    ];

    setWaitingPatients(mockPatients);

    // Update current time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    // Simulate real-time updates
    const updateInterval = setInterval(() => {
      setWaitingPatients(prev => prev.map(patient => ({
        ...patient,
        estimated_wait: Math.max(0, patient.estimated_wait - 1)
      })));
    }, 60000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(updateInterval);
    };
  }, []);

  const getStatusColor = (status: WaitingPatient['status']) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'called':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: WaitingPatient['priority']) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-500 text-white';
      case 'urgent':
        return 'bg-orange-500 text-white';
      case 'normal':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getWaitTimeColor = (waitTime: number) => {
    if (waitTime > 30) return 'text-red-600';
    if (waitTime > 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const calculateActualWait = (checkInTime?: Date, appointmentTime?: Date) => {
    if (!checkInTime) return 0;
    const waitStart = appointmentTime && appointmentTime > checkInTime ? appointmentTime : checkInTime;
    return Math.floor((currentTime.getTime() - waitStart.getTime()) / 60000);
  };

  const updatePatientStatus = (patientId: string, status: WaitingPatient['status'], chairId?: string) => {
    setWaitingPatients(prev => prev.map(patient => 
      patient.id === patientId 
        ? { ...patient, status, chair_assignment: chairId || patient.chair_assignment }
        : patient
    ));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const currentlyWaiting = waitingPatients.filter(p => p.status === 'waiting').length;
  const averageWait = waitingPatients.length > 0 
    ? Math.round(waitingPatients.reduce((sum, p) => sum + p.estimated_wait, 0) / waitingPatients.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Users className="h-7 w-7 text-blue-500" />
            Live Waiting Room
          </h2>
          <p className="text-muted-foreground">Real-time patient check-in and queue management</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{currentlyWaiting}</div>
            <div className="text-xs text-muted-foreground">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{averageWait}m</div>
            <div className="text-xs text-muted-foreground">Avg Wait</div>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Live Updates
          </Badge>
        </div>
      </div>

      {/* Waiting Queue */}
      <div className="grid gap-4">
        {waitingPatients.map((patient) => {
          const actualWait = calculateActualWait(patient.check_in_time, patient.appointment_time);
          const isOverdue = actualWait > patient.estimated_wait + 10;
          
          return (
            <Card 
              key={patient.id} 
              className={`transition-all hover:shadow-lg ${
                isOverdue ? 'border-red-300 bg-red-50' : ''
              } ${patient.priority === 'emergency' ? 'border-red-500 animate-pulse' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{patient.name}</h3>
                        <Badge className={getPriorityColor(patient.priority)}>
                          {patient.priority}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(patient.status)}>
                          {patient.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatTime(patient.appointment_time)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {patient.check_in_time ? formatTime(patient.check_in_time) : 'Not checked in'}
                        </div>
                        <span>Dr. {patient.dentist}</span>
                        <span>{patient.procedure}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Wait Time Display */}
                    <div className="text-center">
                      <div className={`text-lg font-bold ${getWaitTimeColor(actualWait)}`}>
                        {actualWait}m
                      </div>
                      <div className="text-xs text-muted-foreground">actual</div>
                      <div className="text-xs text-muted-foreground">
                        est: {patient.estimated_wait}m
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-24">
                      <Progress 
                        value={Math.min(100, (actualWait / (patient.estimated_wait || 1)) * 100)} 
                        className="h-2"
                      />
                    </div>
                    
                    {/* Chair Assignment */}
                    {patient.chair_assignment && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">
                        {patient.chair_assignment}
                      </Badge>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2">
                      {patient.status === 'waiting' && (
                        <Button
                          size="sm"
                          onClick={() => updatePatientStatus(patient.id, 'called', 'Chair 1')}
                        >
                          Call Patient
                        </Button>
                      )}
                      
                      {patient.status === 'called' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updatePatientStatus(patient.id, 'in_progress')}
                        >
                          Start Treatment
                        </Button>
                      )}
                      
                      <Button size="sm" variant="ghost">
                        <Phone className="h-4 w-4" />
                      </Button>
                      
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Warning for overdue patients */}
                {isOverdue && (
                  <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">
                      Patient has been waiting {actualWait - patient.estimated_wait} minutes longer than estimated
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {waitingPatients.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No patients waiting</h3>
              <p className="text-muted-foreground">
                All patients are currently being seen or no appointments scheduled
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}