import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  FileText,
  Phone,
  Target
} from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface InsuranceVerification {
  patientName: string;
  insuranceProvider: string;
  policyNumber: string;
  status: 'verified' | 'pending' | 'expired' | 'invalid';
  coverage: number;
  deductible: number;
  annualMax: number;
  remainingBenefits: number;
}

interface ClaimStatus {
  claimId: string;
  patientName: string;
  procedure: string;
  amount: number;
  status: 'submitted' | 'processing' | 'approved' | 'denied' | 'resubmit';
  submittedDate: string;
  estimatedPayment: number;
}

interface RevenueOpportunity {
  type: 'missed_appointment' | 'overdue_treatment' | 'insurance_max' | 'preventive_care';
  description: string;
  potentialRevenue: number;
  effort: 'low' | 'medium' | 'high';
  patients: string[];
  action: string;
}

export default function RevenueManagement() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('this_month');

  const mockInsuranceVerifications: InsuranceVerification[] = [
    {
      patientName: "John Smith",
      insuranceProvider: "Delta Dental",
      policyNumber: "DD123456789",
      status: 'verified',
      coverage: 80,
      deductible: 50,
      annualMax: 1500,
      remainingBenefits: 1200
    },
    {
      patientName: "Sarah Johnson",
      insuranceProvider: "Aetna",
      policyNumber: "AET987654321", 
      status: 'expired',
      coverage: 70,
      deductible: 75,
      annualMax: 1000,
      remainingBenefits: 0
    }
  ];

  const mockClaims: ClaimStatus[] = [
    {
      claimId: "CLM001",
      patientName: "Mike Davis",
      procedure: "Root Canal Therapy",
      amount: 1200,
      status: 'approved',
      submittedDate: "2024-01-15",
      estimatedPayment: 960
    },
    {
      claimId: "CLM002", 
      patientName: "Lisa Wilson",
      procedure: "Crown Placement",
      amount: 1500,
      status: 'denied',
      submittedDate: "2024-01-10",
      estimatedPayment: 0
    },
    {
      claimId: "CLM003",
      patientName: "Tom Brown",
      procedure: "Dental Cleaning",
      amount: 150,
      status: 'processing',
      submittedDate: "2024-01-20",
      estimatedPayment: 120
    }
  ];

  const mockRevenueOpportunities: RevenueOpportunity[] = [
    {
      type: 'missed_appointment',
      description: 'Patients with missed high-value appointments',
      potentialRevenue: 3200,
      effort: 'low',
      patients: ['John Smith', 'Sarah Johnson', 'Mike Davis'],
      action: 'Call to reschedule'
    },
    {
      type: 'overdue_treatment',
      description: 'Treatment plans pending approval',
      potentialRevenue: 8500,
      effort: 'medium',
      patients: ['Lisa Wilson', 'Tom Brown', 'Jane Doe', 'Bob Smith'],
      action: 'Send treatment reminders'
    },
    {
      type: 'insurance_max',
      description: 'Patients approaching insurance maximum',
      potentialRevenue: 4100,
      effort: 'high',
      patients: ['Alex Johnson', 'Emma Davis'],
      action: 'Schedule before year-end'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'expired':
      case 'denied': return 'bg-red-100 text-red-800 border-red-200';
      case 'resubmit': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEffortColor = (effort: string) => {
    switch (effort) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Revenue Management Center</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered revenue optimization with predictive insights and automated claim management
        </p>
      </div>

      {/* Revenue Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold"><CurrencyDisplay amount={48500} /></p>
            <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">+12%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold"><CurrencyDisplay amount={15700} /></p>
            <p className="text-sm text-muted-foreground">Revenue Opportunities</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <AlertTriangle className="w-3 h-3 text-orange-500" />
              <span className="text-xs text-orange-600">Action needed</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">94%</p>
            <p className="text-sm text-muted-foreground">Collection Rate</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">Above target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">18 days</p>
            <p className="text-sm text-muted-foreground">Avg Collection Time</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-green-500" />
              <span className="text-xs text-green-600">-3 days</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insurance" className="w-full">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="insurance">Insurance Verification</TabsTrigger>
          <TabsTrigger value="claims">Claim Tracking</TabsTrigger>
          <TabsTrigger value="opportunities">Revenue Opportunities</TabsTrigger>
          <TabsTrigger value="forecasting">Revenue Forecasting</TabsTrigger>
        </TabsList>

        {/* Insurance Verification */}
        <TabsContent value="insurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Real-Time Insurance Verification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockInsuranceVerifications.map((verification, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{verification.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {verification.insuranceProvider} • {verification.policyNumber}
                        </p>
                      </div>
                      <Badge className={getStatusColor(verification.status)}>
                        {verification.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Coverage</p>
                        <p className="font-medium">{verification.coverage}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductible</p>
                        <p className="font-medium"><CurrencyDisplay amount={verification.deductible} /></p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Annual Max</p>
                        <p className="font-medium"><CurrencyDisplay amount={verification.annualMax} /></p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Remaining</p>
                        <p className="font-medium"><CurrencyDisplay amount={verification.remainingBenefits} /></p>
                      </div>
                    </div>

                    {verification.status === 'verified' && (
                      <div className="mt-3">
                        <Progress 
                          value={(verification.remainingBenefits / verification.annualMax) * 100} 
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Benefits utilization: {Math.round(((verification.annualMax - verification.remainingBenefits) / verification.annualMax) * 100)}%
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Claim Tracking */}
        <TabsContent value="claims" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Automated Claim Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockClaims.map((claim, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{claim.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {claim.procedure} • Claim ID: {claim.claimId}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(claim.status)}>
                          {claim.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Submitted: {claim.submittedDate}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Claim Amount</p>
                        <p className="font-medium"><CurrencyDisplay amount={claim.amount} /></p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Payment</p>
                        <p className="font-medium"><CurrencyDisplay amount={claim.estimatedPayment} /></p>
                      </div>
                      <div className="flex gap-2">
                        {claim.status === 'denied' && (
                          <Button size="sm" variant="outline">
                            Resubmit
                          </Button>
                        )}
                        {claim.status === 'processing' && (
                          <Button size="sm" variant="outline">
                            Follow Up
                          </Button>
                        )}
                      </div>
                    </div>

                    {claim.status === 'denied' && (
                      <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
                        <p className="text-sm text-red-800">
                          <strong>Denial Reason:</strong> Missing pre-authorization
                        </p>
                        <p className="text-sm text-red-700 mt-1">
                          AI Suggestion: Request pre-auth and resubmit with code D3330
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Opportunities */}
        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                AI-Identified Revenue Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRevenueOpportunities.map((opportunity, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{opportunity.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {opportunity.patients.length} patients affected
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600">
                          <CurrencyDisplay amount={opportunity.potentialRevenue} />
                        </p>
                        <Badge className={getEffortColor(opportunity.effort)}>
                          {opportunity.effort} effort
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {opportunity.patients.slice(0, 3).map((patient, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {patient}
                          </Badge>
                        ))}
                        {opportunity.patients.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{opportunity.patients.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <Button size="sm">
                        <Phone className="w-3 h-3 mr-1" />
                        {opportunity.action}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Weekly Action Plan</h4>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Call 5 patients with missed high-value appointments
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Send treatment plan reminders to 8 patients
                    </li>
                    <li className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Schedule year-end consultations for insurance max patients
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Forecasting */}
        <TabsContent value="forecasting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Forecast</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>Current Month Projection</span>
                    <span className="font-bold"><CurrencyDisplay amount={52000} /></span>
                  </div>
                  <Progress value={75} className="h-3" />
                  <p className="text-sm text-muted-foreground">75% of month complete</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Scheduled Revenue</p>
                    <p className="font-medium"><CurrencyDisplay amount={38000} /></p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Potential Revenue</p>
                    <p className="font-medium"><CurrencyDisplay amount={14000} /></p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Leaks Identified</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                    <span className="text-sm">Missed Follow-ups</span>
                    <span className="font-medium text-red-600">-<CurrencyDisplay amount={2400} /></span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                    <span className="text-sm">Idle Chair Hours</span>
                    <span className="font-medium text-yellow-600">-<CurrencyDisplay amount={1800} /></span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-orange-50 rounded">
                    <span className="text-sm">Claim Delays</span>
                    <span className="font-medium text-orange-600">-<CurrencyDisplay amount={950} /></span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Recovery Potential</span>
                    <span className="font-bold text-green-600"><CurrencyDisplay amount={5150} /></span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">This week</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}