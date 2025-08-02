import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  Users, 
  TrendingDown, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Package,
  Building2,
  UserCheck,
  MapPin
} from "lucide-react";

interface CancellationPrediction {
  patientName: string;
  appointmentTime: string;
  probability: number;
  riskFactors: string[];
  suggestedActions: string[];
}

interface ChairUtilization {
  chairId: string;
  utilization: number;
  peakHours: string[];
  suggestedOptimizations: string[];
}

export default function SmartOperations() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState("cancellations");

  const mockCancellations: CancellationPrediction[] = [
    {
      patientName: "Sarah Johnson",
      appointmentTime: "2:00 PM",
      probability: 78,
      riskFactors: ["History of cancellations", "Rainy weather forecast", "Friday afternoon slot"],
      suggestedActions: ["Send confirmation SMS", "Offer earlier time slot", "Add to priority callback list"]
    },
    {
      patientName: "Mike Davis",
      appointmentTime: "4:30 PM",
      probability: 65,
      riskFactors: ["New patient", "Evening appointment", "No phone confirmation"],
      suggestedActions: ["Call for confirmation", "Send appointment details", "Offer flexible scheduling"]
    }
  ];

  const mockChairUtilization: ChairUtilization[] = [
    {
      chairId: "Chair 1",
      utilization: 85,
      peakHours: ["9:00 AM - 11:00 AM", "2:00 PM - 4:00 PM"],
      suggestedOptimizations: ["Schedule cleanings during low-peak hours", "Block emergency time"]
    },
    {
      chairId: "Chair 2", 
      utilization: 72,
      peakHours: ["10:00 AM - 12:00 PM", "3:00 PM - 5:00 PM"],
      suggestedOptimizations: ["Add hygienist hours", "Optimize appointment lengths"]
    },
    {
      chairId: "Chair 3",
      utilization: 68,
      peakHours: ["11:00 AM - 1:00 PM"],
      suggestedOptimizations: ["Consider specialist procedures", "Increase marketing efforts"]
    }
  ];

  const mockInventory = [
    { item: "Dental Composite", current: 15, recommended: 25, status: "low", autoOrder: true },
    { item: "Anesthetic Cartridges", current: 8, recommended: 20, status: "critical", autoOrder: true },
    { item: "Gloves (Size M)", current: 45, recommended: 30, status: "optimal", autoOrder: false },
    { item: "Impression Material", current: 3, recommended: 10, status: "critical", autoOrder: true }
  ];

  const mockTransferCandidates = [
    {
      patientName: "John Wilson",
      currentLocation: "Downtown Clinic",
      suggestedLocation: "Westside Branch",
      reason: "Closer to patient home",
      distance: "5 miles closer",
      savings: "$25 travel cost"
    },
    {
      patientName: "Lisa Chen",
      currentLocation: "Downtown Clinic", 
      suggestedLocation: "Eastside Branch",
      reason: "Specialist available",
      distance: "3 miles",
      savings: "No referral needed"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'optimal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Smart Operations Center</h1>
        <p className="text-lg text-muted-foreground">
          AI-powered practice optimization with predictive insights and automation
        </p>
      </div>

      {/* Date Selection */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">Analysis Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-3 py-1"
            />
            <Button variant="outline" size="sm">
              Refresh Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="cancellations">Cancellation Prediction</TabsTrigger>
          <TabsTrigger value="chairs">Chair Optimization</TabsTrigger>
          <TabsTrigger value="inventory">Smart Inventory</TabsTrigger>
          <TabsTrigger value="transfers">Patient Transfers</TabsTrigger>
          <TabsTrigger value="staff">Staff Optimization</TabsTrigger>
        </TabsList>

        {/* Cancellation Prediction */}
        <TabsContent value="cancellations" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">23%</p>
                <p className="text-sm text-muted-foreground">Predicted Cancellation Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">At-Risk Appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">8</p>
                <p className="text-sm text-muted-foreground">Auto-Filled Slots</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>High-Risk Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockCancellations.map((prediction, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{prediction.patientName}</p>
                        <p className="text-sm text-muted-foreground">{prediction.appointmentTime}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={prediction.probability > 70 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                          {prediction.probability}% risk
                        </Badge>
                        <Progress value={prediction.probability} className="w-20 mt-1" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-medium mb-2">Risk Factors</h5>
                        <ul className="space-y-1">
                          {prediction.riskFactors.map((factor, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm">
                              <AlertTriangle className="w-3 h-3 text-yellow-500" />
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Suggested Actions</h5>
                        <div className="space-y-2">
                          {prediction.suggestedActions.map((action, i) => (
                            <Button key={i} variant="outline" size="sm" className="w-full justify-start">
                              {action}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chair Optimization */}
        <TabsContent value="chairs" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockChairUtilization.map((chair, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    {chair.chairId}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold">{chair.utilization}%</p>
                    <p className="text-sm text-muted-foreground">Utilization Rate</p>
                    <Progress value={chair.utilization} className="mt-2" />
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Peak Hours</h5>
                    {chair.peakHours.map((hour, i) => (
                      <Badge key={i} variant="outline" className="mr-1 mb-1">
                        {hour}
                      </Badge>
                    ))}
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Optimizations</h5>
                    <ul className="space-y-1">
                      {chair.suggestedOptimizations.map((opt, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                          {opt}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Smart Inventory */}
        <TabsContent value="inventory" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Package className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">4</p>
                <p className="text-sm text-muted-foreground">Items Need Reorder</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                <p className="text-2xl font-bold">2</p>
                <p className="text-sm text-muted-foreground">Critical Stock Levels</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">$1,250</p>
                <p className="text-sm text-muted-foreground">Monthly Savings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Auto-Orders Today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockInventory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Package className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{item.item}</p>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.current} | Recommended: {item.recommended}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status}
                      </Badge>
                      {item.autoOrder && (
                        <Button size="sm" variant="outline">
                          Auto-Order
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Patient Transfers */}
        <TabsContent value="transfers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Branch Transfer Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransferCandidates.map((transfer, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{transfer.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {transfer.currentLocation} → {transfer.suggestedLocation}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">Transfer</Button>
                        <Button size="sm" variant="outline">Notify Patient</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-500" />
                        <span>{transfer.distance}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{transfer.savings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-purple-500" />
                        <span>{transfer.reason}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Optimization */}
        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Staff Task Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Automated Task Assignments</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                      <span className="text-sm">Sterilization - Room 3</span>
                      <Badge variant="outline">Assigned to Maria</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                      <span className="text-sm">Room Prep - Chair 2</span>
                      <Badge variant="outline">Assigned to John</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded">
                      <span className="text-sm">Follow-up Calls</span>
                      <Badge variant="outline">Assigned to Sarah</Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Shift Optimization</h4>
                  <div className="space-y-3">
                    <div className="p-3 border rounded">
                      <p className="font-medium">Morning Shift (8 AM - 12 PM)</p>
                      <p className="text-sm text-muted-foreground">
                        High patient load predicted - Add 1 extra hygienist
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <p className="font-medium">Afternoon Shift (1 PM - 5 PM)</p>
                      <p className="text-sm text-muted-foreground">
                        Optimal staffing - No changes needed
                      </p>
                    </div>
                    <div className="p-3 border rounded">
                      <p className="font-medium">Evening Shift (5 PM - 8 PM)</p>
                      <p className="text-sm text-muted-foreground">
                        Low patient load - Reduce by 1 assistant
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}