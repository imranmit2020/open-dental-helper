import React, { useState } from 'react';
import { Shield, Lock, Wifi, Monitor, User, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useAdvancedSecurity } from '@/hooks/useAdvancedSecurity';

export function ZeroTrustDashboard() {
  const { zeroTrustScore } = useAdvancedSecurity();
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  
  const [policies, setPolicies] = useState([
    {
      id: 'device_trust',
      name: 'Device Trust Verification',
      description: 'All devices must be registered and verified',
      enabled: true,
      compliance: 94,
      violations: 2,
      category: 'device'
    },
    {
      id: 'user_verification',
      name: 'Continuous User Verification',
      description: 'Regular biometric verification during sessions',
      enabled: true,
      compliance: 87,
      violations: 8,
      category: 'identity'
    },
    {
      id: 'network_segmentation',
      name: 'Network Microsegmentation',
      description: 'Isolated network zones for different functions',
      enabled: true,
      compliance: 96,
      violations: 1,
      category: 'network'
    },
    {
      id: 'data_encryption',
      name: 'End-to-End Encryption',
      description: 'All data encrypted in transit and at rest',
      enabled: true,
      compliance: 99,
      violations: 0,
      category: 'data'
    },
    {
      id: 'privilege_management',
      name: 'Least Privilege Access',
      description: 'Minimal required permissions for all users',
      enabled: true,
      compliance: 82,
      violations: 12,
      category: 'access'
    },
    {
      id: 'session_monitoring',
      name: 'Real-time Session Monitoring',
      description: 'Continuous monitoring of all active sessions',
      enabled: true,
      compliance: 91,
      violations: 5,
      category: 'monitoring'
    }
  ]);

  const trustComponents = [
    {
      name: 'Identity Verification',
      score: 92,
      status: 'healthy',
      checks: ['Multi-factor Auth', 'Biometric Verification', 'Behavioral Analysis'],
      icon: <User className="h-5 w-5" />
    },
    {
      name: 'Device Security',
      score: 88,
      status: 'warning',
      checks: ['Device Registration', 'Endpoint Protection', 'Compliance Validation'],
      icon: <Monitor className="h-5 w-5" />
    },
    {
      name: 'Network Controls',
      score: 96,
      status: 'healthy',
      checks: ['Microsegmentation', 'Traffic Analysis', 'Firewall Rules'],
      icon: <Wifi className="h-5 w-5" />
    },
    {
      name: 'Data Protection',
      score: 94,
      status: 'healthy',
      checks: ['Encryption at Rest', 'Encryption in Transit', 'Key Management'],
      icon: <Database className="h-5 w-5" />
    },
    {
      name: 'Access Management',
      score: 85,
      status: 'warning',
      checks: ['Role-based Access', 'Privilege Escalation', 'Session Management'],
      icon: <Lock className="h-5 w-5" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'device':
        return <Monitor className="h-4 w-4" />;
      case 'identity':
        return <User className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'data':
        return <Database className="h-4 w-4" />;
      case 'access':
        return <Lock className="h-4 w-4" />;
      case 'monitoring':
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const togglePolicy = (policyId: string) => {
    setPolicies(prev => prev.map(policy => 
      policy.id === policyId 
        ? { ...policy, enabled: !policy.enabled }
        : policy
    ));
  };

  const averageCompliance = Math.round(
    policies.reduce((sum, policy) => sum + policy.compliance, 0) / policies.length
  );

  const totalViolations = policies.reduce((sum, policy) => sum + policy.violations, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-500" />
            Zero Trust Security Architecture
          </h2>
          <p className="text-muted-foreground">Never trust, always verify - comprehensive security posture</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className={`text-3xl font-bold ${
              zeroTrustScore >= 90 ? 'text-green-600' :
              zeroTrustScore >= 75 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {zeroTrustScore.toFixed(0)}%
            </div>
            <div className="text-sm text-muted-foreground">Trust Score</div>
          </div>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            Zero Trust
          </Badge>
        </div>
      </div>

      {/* Trust Score Overview */}
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Trust Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {trustComponents.map((component, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {component.icon}
                      <span className="font-medium">{component.name}</span>
                      {getStatusIcon(component.status)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{component.score}%</span>
                      <Badge className={getStatusColor(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={component.score} className="h-2" />
                  <div className="flex flex-wrap gap-1">
                    {component.checks.map((check, checkIndex) => (
                      <Badge key={checkIndex} variant="outline" className="text-xs">
                        {check}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-6 border-2 border-dashed border-blue-300 rounded-lg">
                <div className={`text-6xl font-bold mb-2 ${
                  zeroTrustScore >= 90 ? 'text-green-600' :
                  zeroTrustScore >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {zeroTrustScore.toFixed(0)}
                </div>
                <div className="text-sm text-muted-foreground">Overall Trust Score</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{averageCompliance}%</div>
                  <div className="text-xs text-muted-foreground">Avg Compliance</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{totalViolations}</div>
                  <div className="text-xs text-muted-foreground">Active Violations</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zero Trust Policies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-purple-500" />
            Zero Trust Policies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {policies.map((policy) => (
              <div 
                key={policy.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedPolicy === policy.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                } ${!policy.enabled ? 'opacity-60' : ''}`}
                onClick={() => setSelectedPolicy(selectedPolicy === policy.id ? null : policy.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(policy.category)}
                    <div>
                      <h3 className="font-semibold">{policy.name}</h3>
                      <p className="text-sm text-muted-foreground">{policy.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{policy.compliance}%</div>
                      <div className="text-xs text-muted-foreground">Compliance</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{policy.violations}</div>
                      <div className="text-xs text-muted-foreground">Violations</div>
                    </div>
                    
                    <Switch
                      checked={policy.enabled}
                      onCheckedChange={() => togglePolicy(policy.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                
                {selectedPolicy === policy.id && (
                  <div className="mt-4 pt-4 border-t space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Implementation Status</h4>
                        <Progress value={policy.compliance} className="h-2 mb-1" />
                        <p className="text-xs text-muted-foreground">
                          {policy.compliance}% of systems compliant
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recent Violations</h4>
                        <div className="space-y-1">
                          {policy.violations > 0 ? (
                            Array.from({ length: Math.min(policy.violations, 3) }, (_, i) => (
                              <div key={i} className="text-xs text-red-600 flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Violation detected {i + 1} hour(s) ago
                              </div>
                            ))
                          ) : (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle className="h-3 w-3" />
                              No recent violations
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Quick Actions</h4>
                        <div className="space-y-2">
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            View Details
                          </Button>
                          <Button size="sm" variant="outline" className="w-full text-xs">
                            Configure Policy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Posture Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-green-800 mb-1">Secure Baseline</h3>
            <p className="text-sm text-green-600">
              All critical policies active and enforced
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Shield className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-blue-800 mb-1">Continuous Monitoring</h3>
            <p className="text-sm text-blue-600">
              Real-time threat detection and response
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-6 text-center">
            <Lock className="h-12 w-12 text-purple-600 mx-auto mb-3" />
            <h3 className="font-semibold text-purple-800 mb-1">Adaptive Security</h3>
            <p className="text-sm text-purple-600">
              AI-powered policy adjustment and optimization
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}