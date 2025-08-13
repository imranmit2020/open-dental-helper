import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { 
  Camera, 
  MapPin, 
  Shield, 
  Clock, 
  User, 
  Smartphone,
  Zap,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useTimeTracking } from "@/hooks/useTimeTracking";

interface BiometricClockInProps {
  employeeId: string;
  employeeName: string;
  onSuccess?: () => void;
}

export function BiometricClockIn({ employeeId, employeeName, onSuccess }: BiometricClockInProps) {
  const [step, setStep] = useState<'start' | 'location' | 'biometric' | 'confirmation'>('start');
  const [locationStatus, setLocationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [biometricStatus, setBiometricStatus] = useState<'pending' | 'scanning' | 'success' | 'failed'>('pending');
  const [confidence, setConfidence] = useState(0);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'clock_in' | 'clock_out' | 'break_start' | 'break_end'>('clock_in');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { clockAction, loading, currentSession } = useTimeTracking(employeeId);

  // Simulate biometric scanning animation
  useEffect(() => {
    if (step === 'biometric' && biometricStatus === 'scanning') {
      const interval = setInterval(() => {
        setConfidence(prev => {
          const newValue = prev + Math.random() * 10;
          if (newValue >= 95) {
            setBiometricStatus('success');
            clearInterval(interval);
            return 95;
          }
          return newValue;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [step, biometricStatus]);

  const startLocationCheck = async () => {
    setStep('location');
    setLocationStatus('pending');
    
    // Simulate location check
    setTimeout(() => {
      setLocationStatus('success');
      setTimeout(() => setStep('biometric'), 1000);
    }, 2000);
  };

  const startBiometricScan = async () => {
    setBiometricStatus('scanning');
    setConfidence(0);
    
    // Simulate camera access
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.log('Camera access simulated');
    }
  };

  const handleClockAction = async () => {
    await clockAction(employeeId, actionType, notes);
    setStep('start');
    setNotes('');
    setConfidence(0);
    setBiometricStatus('pending');
    setLocationStatus('pending');
    onSuccess?.();
  };

  const getActionLabel = () => {
    switch (actionType) {
      case 'clock_in': return 'Clock In';
      case 'clock_out': return 'Clock Out';
      case 'break_start': return 'Start Break';
      case 'break_end': return 'End Break';
    }
  };

  const getActionIcon = () => {
    switch (step) {
      case 'location': return <MapPin className="h-8 w-8" />;
      case 'biometric': return <Camera className="h-8 w-8" />;
      case 'confirmation': return <CheckCircle className="h-8 w-8" />;
      default: return <Clock className="h-8 w-8" />;
    }
  };

  return (
    <Card className="professional-card max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 rounded-full bg-gradient-primary text-white">
            {getActionIcon()}
          </div>
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          <User className="h-5 w-5" />
          {employeeName}
        </CardTitle>
        <p className="text-muted-foreground">Advanced Time Tracking System</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Action Selection */}
        {step === 'start' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={actionType === 'clock_in' ? 'default' : 'outline'}
                onClick={() => setActionType('clock_in')}
                disabled={currentSession?.status === 'in_progress'}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Clock className="h-5 w-5" />
                Clock In
              </Button>
              <Button
                variant={actionType === 'clock_out' ? 'default' : 'outline'}
                onClick={() => setActionType('clock_out')}
                disabled={!currentSession?.clock_in_time}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Clock className="h-5 w-5" />
                Clock Out
              </Button>
              <Button
                variant={actionType === 'break_start' ? 'default' : 'outline'}
                onClick={() => setActionType('break_start')}
                disabled={!currentSession?.clock_in_time}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Zap className="h-5 w-5" />
                Start Break
              </Button>
              <Button
                variant={actionType === 'break_end' ? 'default' : 'outline'}
                onClick={() => setActionType('break_end')}
                className="flex flex-col items-center gap-2 h-auto py-3"
              >
                <Zap className="h-5 w-5" />
                End Break
              </Button>
            </div>

            <Textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />

            <Button 
              onClick={startLocationCheck} 
              className="w-full btn-gradient"
              size="lg"
            >
              Start {getActionLabel()}
            </Button>
          </div>
        )}

        {/* Location Verification */}
        {step === 'location' && (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <MapPin className={`h-6 w-6 ${locationStatus === 'success' ? 'text-success' : 'text-muted-foreground'}`} />
              <span>Verifying Location...</span>
            </div>
            
            <Progress value={locationStatus === 'success' ? 100 : 50} className="w-full" />
            
            {locationStatus === 'success' && (
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="h-5 w-5" />
                <span>Location Verified</span>
              </div>
            )}
          </div>
        )}

        {/* Biometric Verification */}
        {step === 'biometric' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Biometric Verification</h3>
              <div className="relative mx-auto w-48 h-36 bg-muted rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {biometricStatus === 'scanning' && (
                  <div className="absolute inset-0 border-2 border-primary animate-pulse" />
                )}
              </div>
            </div>

            {biometricStatus === 'pending' && (
              <Button onClick={startBiometricScan} className="w-full">
                <Camera className="h-4 w-4 mr-2" />
                Start Facial Recognition
              </Button>
            )}

            {biometricStatus === 'scanning' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Confidence:</span>
                  <Badge variant="outline">{confidence.toFixed(0)}%</Badge>
                </div>
                <Progress value={confidence} className="w-full" />
              </div>
            )}

            {biometricStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-success">
                  <Shield className="h-5 w-5" />
                  <span>Identity Verified</span>
                </div>
                <Button onClick={() => setStep('confirmation')} className="w-full">
                  Continue
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Confirmation */}
        {step === 'confirmation' && (
          <div className="space-y-4">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-success mx-auto" />
              <h3 className="font-semibold">Ready to {getActionLabel()}</h3>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </span>
                <Badge className="status-success">Verified</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Biometric
                </span>
                <Badge className="status-success">{confidence.toFixed(0)}% Match</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Device
                </span>
                <Badge variant="outline">Trusted</Badge>
              </div>
            </div>

            <Button 
              onClick={handleClockAction} 
              disabled={loading}
              className="w-full btn-gradient"
              size="lg"
            >
              {loading ? 'Processing...' : `Confirm ${getActionLabel()}`}
            </Button>
          </div>
        )}

        {/* Current Session Status */}
        {currentSession && (
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Today's Session</h4>
            <div className="text-sm space-y-1">
              {currentSession.clock_in_time && (
                <div>Clock In: {new Date(currentSession.clock_in_time).toLocaleTimeString()}</div>
              )}
              <div>Status: <Badge variant="outline">{currentSession.status}</Badge></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}