import React, { useState, useRef, useEffect } from 'react';
import { Camera, Fingerprint, Eye, Check, X, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvancedSecurity, BiometricSession } from '@/hooks/useAdvancedSecurity';

interface BiometricCheckInProps {
  patientId?: string;
  onVerificationComplete?: (session: BiometricSession) => void;
}

export function BiometricCheckIn({ patientId, onVerificationComplete }: BiometricCheckInProps) {
  const { performBiometricVerification } = useAdvancedSecurity();
  const [activeMethod, setActiveMethod] = useState<BiometricSession['biometric_type'] | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<BiometricSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Facial recognition simulation
  const initializeFacialRecognition = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera access denied:', error);
    }
  };

  // Simulate biometric scanning
  const startBiometricScan = async (method: BiometricSession['biometric_type']) => {
    setActiveMethod(method);
    setIsScanning(true);
    setScanProgress(0);
    setVerificationResult(null);

    if (method === 'facial') {
      await initializeFacialRecognition();
    }

    // Simulate scanning progress
    const progressInterval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);

    // Perform verification
    const session = await performBiometricVerification(method, patientId);
    
    setTimeout(() => {
      setIsScanning(false);
      setVerificationResult(session);
      onVerificationComplete?.(session);
      
      // Stop camera stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }, 3000);
  };

  const getMethodIcon = (method: BiometricSession['biometric_type']) => {
    switch (method) {
      case 'facial':
        return <Camera className="h-8 w-8" />;
      case 'fingerprint':
        return <Fingerprint className="h-8 w-8" />;
      case 'iris':
        return <Eye className="h-8 w-8" />;
      default:
        return <Shield className="h-8 w-8" />;
    }
  };

  const getStatusColor = (status: BiometricSession['status']) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'challenged':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-blue-600 bg-blue-100';
    }
  };

  const biometricMethods = [
    {
      type: 'facial' as const,
      name: 'Facial Recognition',
      description: 'AI-powered facial biometric verification',
      icon: <Camera className="h-6 w-6" />,
      color: 'from-blue-500 to-purple-500'
    },
    {
      type: 'fingerprint' as const,
      name: 'Fingerprint Scan',
      description: 'Touch-based biometric authentication',
      icon: <Fingerprint className="h-6 w-6" />,
      color: 'from-green-500 to-teal-500'
    },
    {
      type: 'iris' as const,
      name: 'Iris Recognition',
      description: 'Advanced eye-based identification',
      icon: <Eye className="h-6 w-6" />,
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold gradient-text mb-2">Biometric Check-In</h2>
        <p className="text-muted-foreground">
          Select your preferred biometric authentication method
        </p>
      </div>

      {/* Biometric Method Selection */}
      {!activeMethod && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {biometricMethods.map((method) => (
            <Card 
              key={method.type}
              className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 border-2"
              onClick={() => startBiometricScan(method.type)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${method.color} rounded-full flex items-center justify-center text-white`}>
                  {method.icon}
                </div>
                <h3 className="font-semibold mb-2">{method.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{method.description}</p>
                <Button variant="outline" className="w-full">
                  Start Scan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Scanning Interface */}
      {activeMethod && (
        <Card className="border-2 border-blue-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getMethodIcon(activeMethod)}
              {activeMethod === 'facial' && 'Facial Recognition'}
              {activeMethod === 'fingerprint' && 'Fingerprint Scan'}
              {activeMethod === 'iris' && 'Iris Recognition'}
              {isScanning && <Loader2 className="h-4 w-4 animate-spin" />}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Camera Feed for Facial Recognition */}
            {activeMethod === 'facial' && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full h-64 object-cover"
                />
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                />
                {isScanning && (
                  <div className="absolute inset-0 border-4 border-blue-500 animate-pulse">
                    <div className="absolute top-4 left-4 right-4 bottom-4 border-2 border-white/50 rounded-lg">
                      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-blue-400"></div>
                      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-blue-400"></div>
                      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-blue-400"></div>
                      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-blue-400"></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Fingerprint Scanner Simulation */}
            {activeMethod === 'fingerprint' && (
              <div className="text-center space-y-4">
                <div className={`w-32 h-32 mx-auto rounded-full border-4 ${
                  isScanning ? 'border-blue-500 animate-pulse' : 'border-gray-300'
                } flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200`}>
                  <Fingerprint className={`h-16 w-16 ${
                    isScanning ? 'text-blue-500 animate-pulse' : 'text-gray-500'
                  }`} />
                </div>
                <p className="text-muted-foreground">
                  {isScanning ? 'Scanning fingerprint...' : 'Place finger on scanner'}
                </p>
              </div>
            )}

            {/* Iris Scanner Simulation */}
            {activeMethod === 'iris' && (
              <div className="text-center space-y-4">
                <div className={`w-32 h-32 mx-auto rounded-full border-4 ${
                  isScanning ? 'border-orange-500 animate-pulse' : 'border-gray-300'
                } flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100`}>
                  <Eye className={`h-16 w-16 ${
                    isScanning ? 'text-orange-500 animate-pulse' : 'text-gray-500'
                  }`} />
                </div>
                <p className="text-muted-foreground">
                  {isScanning ? 'Scanning iris pattern...' : 'Look into the scanner'}
                </p>
              </div>
            )}

            {/* Scanning Progress */}
            {isScanning && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Scanning Progress</span>
                  <span className="text-sm text-muted-foreground">{Math.round(scanProgress)}%</span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </div>
            )}

            {/* Verification Result */}
            {verificationResult && (
              <Alert className={`${getStatusColor(verificationResult.status)}`}>
                <div className="flex items-center gap-2">
                  {verificationResult.status === 'verified' ? (
                    <Check className="h-4 w-4" />
                  ) : verificationResult.status === 'failed' ? (
                    <X className="h-4 w-4" />
                  ) : (
                    <AlertTriangle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {verificationResult.status === 'verified' && 'Verification Successful'}
                        {verificationResult.status === 'failed' && 'Verification Failed'}
                        {verificationResult.status === 'challenged' && 'Additional Verification Required'}
                      </div>
                      <div className="text-sm">
                        Confidence Score: {verificationResult.confidence_score.toFixed(1)}%
                      </div>
                      {verificationResult.fraud_indicators.length > 0 && (
                        <div className="text-sm">
                          Alerts: {verificationResult.fraud_indicators.join(', ')}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setActiveMethod(null);
                  setIsScanning(false);
                  setVerificationResult(null);
                  
                  // Stop camera stream
                  if (videoRef.current?.srcObject) {
                    const stream = videoRef.current.srcObject as MediaStream;
                    stream.getTracks().forEach(track => track.stop());
                  }
                }}
                disabled={isScanning}
              >
                Cancel
              </Button>
              
              {verificationResult?.status === 'failed' && (
                <Button
                  onClick={() => startBiometricScan(activeMethod)}
                  disabled={isScanning}
                >
                  Try Again
                </Button>
              )}
              
              {verificationResult?.status === 'challenged' && (
                <Button
                  variant="outline"
                  onClick={() => startBiometricScan('fingerprint')}
                  disabled={isScanning}
                >
                  Secondary Verification
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}