import React, { useState } from 'react';
import { Shield, AlertTriangle, Brain, TrendingUp, Eye, Activity, Users, Database } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvancedSecurity } from '@/hooks/useAdvancedSecurity';

export function FraudDetectionMonitor() {
  const { securityThreats, reportSecurityIncident, resolveSecurityThreat, zeroTrustScore } = useAdvancedSecurity();
  const [selectedThreat, setSelectedThreat] = useState<string | null>(null);

  const mlMetrics = {
    modelAccuracy: 94.8,
    falsePositiveRate: 2.1,
    threatsDetected24h: 23,
    averageResponseTime: 1.2,
    riskCategories: [
      { name: 'Data Access Anomalies', risk: 78, incidents: 12 },
      { name: 'Authentication Fraud', risk: 45, incidents: 5 },
      { name: 'Privilege Escalation', risk: 23, incidents: 2 },
      { name: 'Data Exfiltration', risk: 12, incidents: 1 }
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-red-500 text-white';
      case 'investigating':
        return 'bg-yellow-500 text-white';
      case 'resolved':
        return 'bg-green-500 text-white';
      case 'false_positive':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-100 border-red-300';
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-300';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 border-yellow-300';
      case 'low':
        return 'text-blue-600 bg-blue-100 border-blue-300';
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const activeThreatsByType = securityThreats.reduce((acc, threat) => {
    if (threat.status === 'active') {
      acc[threat.threat_type] = (acc[threat.threat_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold gradient-text flex items-center gap-2">
            <Brain className="h-7 w-7 text-purple-500" />
            AI Fraud Detection Center
          </h2>
          <p className="text-muted-foreground">Advanced machine learning threat detection and response</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{zeroTrustScore.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground">Trust Score</div>
          </div>
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            AI Monitoring
          </Badge>
        </div>
      </div>

      {/* ML Model Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
              <Brain className="h-5 w-5" />
              Model Accuracy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{mlMetrics.modelAccuracy}%</div>
            <p className="text-sm text-purple-600">AI Detection Rate</p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
              <TrendingUp className="h-5 w-5" />
              False Positives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{mlMetrics.falsePositiveRate}%</div>
            <p className="text-sm text-blue-600">Error Rate</p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
              <AlertTriangle className="h-5 w-5" />
              Threats (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{mlMetrics.threatsDetected24h}</div>
            <p className="text-sm text-orange-600">Detected</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-green-700">
              <Activity className="h-5 w-5" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{mlMetrics.averageResponseTime}s</div>
            <p className="text-sm text-green-600">Avg Response</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            ML Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mlMetrics.riskCategories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{category.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {category.incidents} incidents
                    </Badge>
                    <span className="text-sm font-semibold">{category.risk}%</span>
                  </div>
                </div>
                <Progress 
                  value={category.risk} 
                  className={`h-2 ${
                    category.risk > 70 ? 'text-red-500' : 
                    category.risk > 40 ? 'text-yellow-500' : 'text-green-500'
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Threats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Active Security Threats
          </CardTitle>
        </CardHeader>
        <CardContent>
          {securityThreats.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No active threats detected</p>
              <p className="text-sm">AI monitoring system is operational</p>
            </div>
          ) : (
            <div className="space-y-4">
              {securityThreats.map((threat) => (
                <div 
                  key={threat.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedThreat === threat.id ? 'ring-2 ring-blue-500' : ''
                  } ${getSeverityColor(threat.severity)}`}
                  onClick={() => setSelectedThreat(selectedThreat === threat.id ? null : threat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {threat.threat_type.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ML Confidence: {threat.ml_confidence.toFixed(1)}%
                        </span>
                      </div>
                      
                      <h3 className="font-semibold mb-1">{threat.description}</h3>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatTimestamp(threat.detection_timestamp)}</span>
                        <span>Severity: {threat.severity}</span>
                        <span>{threat.affected_resources.length} resources affected</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveSecurityThreat(threat.id, 'investigating');
                        }}
                        disabled={threat.status !== 'active'}
                      >
                        Investigate
                      </Button>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveSecurityThreat(threat.id, 'resolved');
                        }}
                        disabled={threat.status === 'resolved'}
                      >
                        Resolve
                      </Button>
                    </div>
                  </div>
                  
                  {selectedThreat === threat.id && (
                    <div className="mt-4 pt-4 border-t border-white/20 space-y-3">
                      <div>
                        <h4 className="font-medium mb-2">Affected Resources:</h4>
                        <div className="flex flex-wrap gap-2">
                          {threat.affected_resources.map((resource, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Recommended Actions:</h4>
                        <ul className="text-sm space-y-1">
                          {threat.recommended_actions.map((action, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-current rounded-full" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Evidence:</h4>
                        <div className="flex gap-2">
                          {threat.evidence.map((evidence, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {evidence.type} ({formatTimestamp(evidence.timestamp)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Threat Summary by Type */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(activeThreatsByType).map(([type, count]) => (
              <div key={type} className="text-center p-3 border rounded-lg">
                <div className="text-2xl font-bold text-red-600">{count}</div>
                <div className="text-sm text-muted-foreground capitalize">
                  {type.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}