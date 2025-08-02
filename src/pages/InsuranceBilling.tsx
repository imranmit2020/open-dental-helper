import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, CheckCircle, Clock, DollarSign, FileText, RefreshCw, Zap } from 'lucide-react';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';
import { AIInsuranceService } from '@/services/AIInsuranceService';
import { toast } from 'sonner';

const InsuranceBilling = () => {
  const [loading, setLoading] = useState(false);
  const [claims, setClaims] = useState([]);
  const [verifications, setVerifications] = useState([]);

  const mockClaims = [
    {
      id: '1',
      patientName: 'John Doe',
      submitDate: '2024-01-15',
      amount: 450,
      status: 'pending',
      riskLevel: 'low',
      codes: ['D1110', 'D0150'],
      predictedApproval: 0.92
    },
    {
      id: '2',
      patientName: 'Jane Smith',
      submitDate: '2024-01-14',
      amount: 1200,
      status: 'flagged',
      riskLevel: 'high',
      codes: ['D2750', 'D7140'],
      predictedApproval: 0.65
    },
    {
      id: '3',
      patientName: 'Bob Johnson',
      submitDate: '2024-01-13',
      amount: 180,
      status: 'approved',
      riskLevel: 'low',
      codes: ['D1110'],
      predictedApproval: 0.98
    }
  ];

  const handleVerifyInsurance = async (patientId: string) => {
    setLoading(true);
    try {
      const verification = await AIInsuranceService.verifyInsurance(patientId, {
        provider: 'Blue Cross Blue Shield',
        policyNumber: 'BC123456789'
      });
      toast.success('Insurance verified successfully');
      console.log('Verification result:', verification);
    } catch (error) {
      toast.error('Failed to verify insurance');
    } finally {
      setLoading(false);
    }
  };

  const handlePredictClaim = async (patientId: string, codes: string[]) => {
    setLoading(true);
    try {
      const prediction = await AIInsuranceService.predictClaim(patientId, codes);
      toast.success(`Claim prediction: ${Math.round(prediction.predictedApproval * 100)}% approval probability`);
      console.log('Claim prediction:', prediction);
    } catch (error) {
      toast.error('Failed to predict claim');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'flagged': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Insurance & Billing</h1>
          <p className="text-muted-foreground">Automated verification, claim processing, and error detection</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* AI Insights Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Claims Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ 15%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Approval Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↗ 2.1%</span> improvement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue at Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={3420} variant="large" />
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">↗ <CurrencyDisplay amount={450} variant="small" /></span> flagged claims
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Processing Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">↓ 80%</span> vs manual
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="claims" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="claims">Claims Management</TabsTrigger>
          <TabsTrigger value="verification">Insurance Verification</TabsTrigger>
          <TabsTrigger value="analytics">AI Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Claims Processing</CardTitle>
              <CardDescription>
                Automated claim review with intelligent error detection and approval prediction
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{claim.patientName}</h4>
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                        <span className={`text-sm font-medium ${getRiskColor(claim.riskLevel)}`}>
                          {claim.riskLevel} risk
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {claim.submitDate} • Amount: ${claim.amount} • Codes: {claim.codes.join(', ')}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">AI Approval Prediction:</span>
                        <Progress value={claim.predictedApproval * 100} className="w-24" />
                        <span className="text-sm font-medium">{Math.round(claim.predictedApproval * 100)}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePredictClaim(claim.id, claim.codes)}
                        disabled={loading}
                      >
                        Re-analyze
                      </Button>
                      {claim.status === 'flagged' && (
                        <Button size="sm" variant="outline" className="text-orange-600">
                          Fix Issues
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="verification" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Insurance Verification</CardTitle>
              <CardDescription>
                AI-powered eligibility checks and benefits verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Sarah Johnson</CardTitle>
                      <CardDescription>Blue Cross Blue Shield • Policy: BC789456123</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Annual Maximum:</span>
                          <span className="font-medium">$2,000</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Used:</span>
                          <span className="font-medium text-orange-600">$1,450</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-medium text-green-600">$550</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductible Met:</span>
                          <span className="font-medium">$150 / $500</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => handleVerifyInsurance('patient-1')}
                        disabled={loading}
                      >
                        Re-verify Coverage
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Michael Chen</CardTitle>
                      <CardDescription>Aetna • Policy: AET456789012</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Annual Maximum:</span>
                          <span className="font-medium">$1,500</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Used:</span>
                          <span className="font-medium text-green-600">$320</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-medium text-green-600">$1,180</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Deductible Met:</span>
                          <span className="font-medium">$300 / $300</span>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4" 
                        variant="outline"
                        onClick={() => handleVerifyInsurance('patient-2')}
                        disabled={loading}
                      >
                        Re-verify Coverage
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Leak Detection</CardTitle>
                <CardDescription>AI identifies potential revenue losses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="font-medium">Undercharged Procedures</p>
                      <p className="text-sm text-muted-foreground">$1,240 potential recovery</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Missing Documentation</p>
                      <p className="text-sm text-muted-foreground">5 claims need attachments</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Upgrade Opportunities</p>
                      <p className="text-sm text-muted-foreground">$890 in premium treatments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Processing Efficiency</CardTitle>
                <CardDescription>AI vs Manual comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">AI Processing</span>
                      <span className="text-sm font-medium">2.3 seconds</span>
                    </div>
                    <Progress value={15} className="bg-green-100" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Manual Processing</span>
                      <span className="text-sm font-medium">12.5 minutes</span>
                    </div>
                    <Progress value={100} className="bg-red-100" />
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium text-green-600">
                      98.1% faster with AI automation
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InsuranceBilling;