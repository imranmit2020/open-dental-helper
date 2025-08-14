import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Camera, 
  MapPin, 
  Shield, 
  Clock, 
  User, 
  Smartphone,
  Zap,
  CheckCircle,
  AlertTriangle,
  Key
} from "lucide-react";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface BiometricClockInProps {
  employeeId: string;
  employeeName: string;
  onSuccess?: () => void;
}

export function BiometricClockIn({ employeeId, employeeName, onSuccess }: BiometricClockInProps) {
  const [step, setStep] = useState<'start' | 'location' | 'auth' | 'confirmation'>('start');
  const [locationStatus, setLocationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [authStatus, setAuthStatus] = useState<'pending' | 'scanning' | 'success' | 'failed' | 'otp'>('pending');
  const [confidence, setConfidence] = useState(0);
  const [notes, setNotes] = useState('');
  const [actionType, setActionType] = useState<'clock_in' | 'clock_out' | 'break_start' | 'break_end'>('clock_in');
  const [useOTP, setUseOTP] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [generatedOTP, setGeneratedOTP] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [isTrustedDevice, setIsTrustedDevice] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const { clockAction, loading, currentSession } = useTimeTracking(employeeId);
  const { settings, generateOTP, checkTrustedDevice, trustDevice } = useSecuritySettings();
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if device is trusted on mount
  useEffect(() => {
    if (user && settings.device_remembering_enabled) {
      checkTrustedDevice(user.id).then(setIsTrustedDevice);
    }
  }, [user, settings.device_remembering_enabled]);

  // Simulate biometric scanning animation
  useEffect(() => {
    if (step === 'auth' && authStatus === 'scanning') {
      const interval = setInterval(() => {
        setConfidence(prev => {
          const newValue = prev + Math.random() * 10;
          if (newValue >= 95) {
            setAuthStatus('success');
            clearInterval(interval);
            return 95;
          }
          return newValue;
        });
      }, 200);

      return () => clearInterval(interval);
    }
  }, [step, authStatus]);

  const startLocationCheck = async () => {
    setStep('location');
    setLocationStatus('pending');
    
    // Simulate location check
    setTimeout(() => {
      setLocationStatus('success');
      setTimeout(() => {
        // Skip auth if device is trusted and device remembering is enabled
        if (isTrustedDevice && settings.device_remembering_enabled) {
          setStep('confirmation');
        } else {
          setStep('auth');
        }
      }, 1000);
    }, 2000);
  };

  const startBiometricScan = async () => {
    setAuthStatus('scanning');
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

  const startOTPAuth = () => {
    const otp = generateOTP();
    setGeneratedOTP(otp);
    setAuthStatus('otp');
    
    // Simulate sending OTP (in real app, this would send via SMS/email)
    toast({
      title: "OTP Generated",
      description: `Your verification code is: ${otp}`,
    });
  };

  const verifyOTP = () => {
    if (otpCode === generatedOTP) {
      setAuthStatus('success');
      toast({
        title: "Success",
        description: "OTP verified successfully",
      });
    } else {
      toast({
        title: "Error",
        description: "Invalid OTP code",
        variant: "destructive",
      });
    }
  };

  const handleClockAction = async () => {
    // Remember device if requested
    if (rememberDevice && user && settings.device_remembering_enabled) {
      await trustDevice(user.id, `${employeeName}'s Device`);
    }
    
    await clockAction(employeeId, actionType, notes);
    setStep('start');
    setNotes('');
    setConfidence(0);
    setAuthStatus('pending');
    setLocationStatus('pending');
    setOtpCode('');
    setGeneratedOTP('');
    setUseOTP(false);
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
      case 'auth': return useOTP ? <Key className="h-8 w-8" /> : <Camera className="h-8 w-8" />;
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

        {/* Authentication Verification */}
        {step === 'auth' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-semibold mb-2">Identity Verification</h3>
              
              {/* Authentication Method Selection */}
              {authStatus === 'pending' && (
                <div className="space-y-4">
                  {settings.face_verification_enabled && (
                    <Button 
                      onClick={startBiometricScan} 
                      variant={!useOTP ? 'default' : 'outline'}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Use Facial Recognition
                    </Button>
                  )}
                  
                  {settings.otp_enabled && (
                    <Button 
                      onClick={startOTPAuth} 
                      variant={useOTP ? 'default' : 'outline'}
                      className="w-full"
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Use OTP Code
                    </Button>
                  )}
                </div>
              )}

              {/* Biometric Scanning */}
              {authStatus === 'scanning' && (
                <div className="space-y-4">
                  <div className="relative mx-auto w-48 h-36 bg-muted rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-primary animate-pulse" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Confidence:</span>
                      <Badge variant="outline">{confidence.toFixed(0)}%</Badge>
                    </div>
                    <Progress value={confidence} className="w-full" />
                  </div>
                </div>
              )}

              {/* OTP Input */}
              {authStatus === 'otp' && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Enter the 6-digit code that was generated for you
                  </p>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <Button 
                    onClick={verifyOTP} 
                    disabled={otpCode.length !== 6}
                    className="w-full"
                  >
                    Verify OTP
                  </Button>
                </div>
              )}
            </div>

            {authStatus === 'success' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2 text-success">
                  <Shield className="h-5 w-5" />
                  <span>Identity Verified</span>
                </div>
                
                {settings.device_remembering_enabled && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remember-device"
                      checked={rememberDevice}
                      onCheckedChange={setRememberDevice}
                    />
                    <Label htmlFor="remember-device" className="text-sm">
                      Remember this device for 30 days
                    </Label>
                  </div>
                )}
                
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
                  Authentication
                </span>
                <Badge className="status-success">
                  {useOTP ? 'OTP Verified' : `${confidence.toFixed(0)}% Match`}
                </Badge>
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