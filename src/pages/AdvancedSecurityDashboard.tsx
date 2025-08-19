import React, { useState } from 'react';
import { Shield, Fingerprint, Eye, Lock, Brain, Camera, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BiometricCheckIn } from '@/components/BiometricCheckIn';
import { FraudDetectionMonitor } from '@/components/FraudDetectionMonitor';
import { ZeroTrustDashboard } from '@/components/ZeroTrustDashboard';
import { AdvancedAuditTrail } from '@/components/AdvancedAuditTrail';
import { useAdvancedSecurity } from '@/hooks/useAdvancedSecurity';

export default function AdvancedSecurityDashboard() {
  const { 
    biometricSessions, 
    securityThreats, 
    auditTrail, 
    zeroTrustScore, 
    isMonitoring 
  } = useAdvancedSecurity();
  
  const [activeTab, setActiveTab] = useState('overview');

  const recentBiometricVerifications = biometricSessions.filter(s => s.status === 'verified').length;
  const activeThreatCount = securityThreats.filter(t => t.status === 'active').length;
  const highRiskAuditEntries = auditTrail.filter(e => e.risk_score >= 7).length;
  const biometricSuccessRate = biometricSessions.length > 0 
    ? (biometricSessions.filter(s => s.status === 'verified').length / biometricSessions.length) * 100
    : 0;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            Advanced Security & Biometrics
          </h1>
          <p className="text-muted-foreground">
            Next-generation security with biometric authentication and AI threat detection
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${isMonitoring ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-sm font-medium">
              {isMonitoring ? 'Monitoring Active' : 'Monitoring Offline'}
            </span>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Enterprise Security
          </Badge>
        </div>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Fingerprint className="h-5 w-5" />
              Biometric Success
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{biometricSuccessRate.toFixed(1)}%</div>
            <p className="text-sm text-green-600">{recentBiometricVerifications} verified today</p>
            <Progress value={biometricSuccessRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <Shield className="h-5 w-5" />
              Zero Trust Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{zeroTrustScore.toFixed(0)}%</div>
            <p className="text-sm text-blue-600">Security posture</p>
            <Progress value={zeroTrustScore} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{activeThreatCount}</div>
            <p className="text-sm text-red-600">Requiring attention</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Eye className="h-5 w-5" />
              High-Risk Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{highRiskAuditEntries}</div>
            <p className="text-sm text-purple-600">Risk score ≥ 7.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="biometric" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            Biometric
          </TabsTrigger>
          <TabsTrigger value="fraud" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Fraud Detection
          </TabsTrigger>
          <TabsTrigger value="zerotrust" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Zero Trust
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Security Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Security System Status</CardTitle>
                <CardDescription>Real-time security component monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Biometric Systems</span>
                  </div>
                  <Badge className="bg-green-500 text-white">Online</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">AI Fraud Detection</span>
                  </div>
                  <Badge className="bg-blue-500 text-white">Active</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    <span className="font-medium">Zero Trust Architecture</span>
                  </div>
                  <Badge className="bg-purple-500 text-white">Enforced</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Audit Recording</span>
                  </div>
                  <Badge className="bg-orange-500 text-white">Recording</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Recent Security Events */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security activities and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biometricSessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-2 border rounded">
                      <Fingerprint className="h-4 w-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {session.biometric_type} verification
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {session.confidence_score.toFixed(1)}% confidence • {session.device_info.location}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          session.status === 'verified' ? 'border-green-300 text-green-700' :
                          session.status === 'failed' ? 'border-red-300 text-red-700' :
                          'border-yellow-300 text-yellow-700'
                        }
                      >
                        {session.status}
                      </Badge>
                    </div>
                  ))}
                  
                  {auditTrail.slice(0, 2).map((entry) => (
                    <div key={entry.id} className="flex items-center gap-3 p-2 border rounded">
                      <Eye className="h-4 w-4 text-purple-500" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">
                          {entry.action.replace(/_/g, ' ')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Risk: {entry.risk_score.toFixed(1)} • {entry.resource}
                        </div>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          entry.risk_score >= 7 ? 'border-red-300 text-red-700' :
                          entry.risk_score >= 4 ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }
                      >
                        {entry.risk_score >= 7 ? 'High' : entry.risk_score >= 4 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Architecture Overview */}
          <Card>
            <CardContent className="pt-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  🔒 Enterprise-Grade Security Architecture
                </h3>
                <p className="text-blue-800 text-sm mb-4">
                  Your practice is protected by military-grade security featuring biometric authentication, 
                  AI-powered threat detection, zero-trust architecture, and comprehensive audit trails 
                  with multimedia evidence capture.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <Fingerprint className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-blue-800">Biometric Auth</h4>
                    <p className="text-xs text-blue-600">Facial, fingerprint & iris</p>
                  </div>
                  <div className="text-center">
                    <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-purple-800">AI Detection</h4>
                    <p className="text-xs text-purple-600">Machine learning fraud prevention</p>
                  </div>
                  <div className="text-center">
                    <Shield className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-800">Zero Trust</h4>
                    <p className="text-xs text-green-600">Never trust, always verify</p>
                  </div>
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <h4 className="font-semibold text-orange-800">Video Evidence</h4>
                    <p className="text-xs text-orange-600">Complete activity recording</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biometric">
          <BiometricCheckIn 
            onVerificationComplete={(session) => {
              console.log('Verification completed:', session);
            }}
          />
        </TabsContent>

        <TabsContent value="fraud">
          <FraudDetectionMonitor />
        </TabsContent>

        <TabsContent value="zerotrust">
          <ZeroTrustDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <AdvancedAuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
}