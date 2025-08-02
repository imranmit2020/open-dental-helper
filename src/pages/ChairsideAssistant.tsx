import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Shield, AlertTriangle, Clock, Syringe, Heart, Pill } from "lucide-react";
import { toast } from "sonner";

interface PatientAlert {
  type: 'allergy' | 'medication' | 'condition' | 'anesthesia' | 'risk';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendation: string;
}

interface AnesthesiaRecommendation {
  type: string;
  dosage: string;
  route: string;
  precautions: string[];
  contraindications: string[];
}

export default function ChairsideAssistant() {
  const [selectedPatient, setSelectedPatient] = useState("patient_001");
  const [currentProcedure, setCurrentProcedure] = useState("root_canal");
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [anesthesiaRec, setAnesthesiaRec] = useState<AnesthesiaRecommendation | null>(null);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);

  const mockAlerts: PatientAlert[] = [
    {
      type: 'allergy',
      severity: 'high',
      message: 'Patient allergic to Penicillin',
      recommendation: 'Use Amoxicillin alternative (Clindamycin 300mg)'
    },
    {
      type: 'condition',
      severity: 'medium', 
      message: 'History of hypertension',
      recommendation: 'Monitor blood pressure during procedure'
    },
    {
      type: 'medication',
      severity: 'medium',
      message: 'Taking Warfarin (blood thinner)',
      recommendation: 'Consider hemostatic agents, minimal trauma technique'
    }
  ];

  const mockAnesthesia: AnesthesiaRecommendation = {
    type: "Lidocaine 2% with Epinephrine 1:100,000",
    dosage: "1.8ml (1 cartridge) for infiltration",
    route: "Buccal and palatal infiltration",
    precautions: [
      "Aspirate before injection",
      "Inject slowly to minimize discomfort",
      "Monitor for allergic reactions"
    ],
    contraindications: [
      "Known lidocaine allergy",
      "Severe cardiovascular disease"
    ]
  };

  const mockRiskFactors = [
    "Patient anxiety level: High",
    "Complex root canal anatomy",
    "Previous failed endodontic treatment",
    "Limited mouth opening"
  ];

  useEffect(() => {
    // Simulate AI analysis based on patient and procedure
    const timer = setTimeout(() => {
      setAlerts(mockAlerts);
      setAnesthesiaRec(mockAnesthesia);
      setRiskFactors(mockRiskFactors);
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedPatient, currentProcedure]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'allergy': return <Shield className="w-5 h-5 text-red-500" />;
      case 'medication': return <Pill className="w-5 h-5 text-blue-500" />;
      case 'condition': return <Heart className="w-5 h-5 text-orange-500" />;
      case 'anesthesia': return <Syringe className="w-5 h-5 text-purple-500" />;
      case 'risk': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Chairside AI Assistant</h1>
        <p className="text-lg text-muted-foreground">
          Real-time clinical assistance with dosage recommendations and safety alerts
        </p>
      </div>

      {/* Patient & Procedure Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="patient_001">John Smith (Age: 45, Male)</option>
              <option value="patient_002">Sarah Johnson (Age: 32, Female)</option>
              <option value="patient_003">Mike Davis (Age: 58, Male)</option>
            </select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Procedure</CardTitle>
          </CardHeader>
          <CardContent>
            <select 
              value={currentProcedure}
              onChange={(e) => setCurrentProcedure(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="root_canal">Root Canal Therapy</option>
              <option value="extraction">Tooth Extraction</option>
              <option value="filling">Composite Filling</option>
              <option value="crown_prep">Crown Preparation</option>
            </select>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alerts */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Critical Patient Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, index) => (
            <Alert key={index} className={getSeverityColor(alert.severity)}>
              <div className="flex items-start gap-3">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{alert.message}</span>
                    <Badge variant={alert.severity === 'high' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <AlertDescription>
                    <strong>Recommendation:</strong> {alert.recommendation}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          ))}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Anesthesia Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Syringe className="w-5 h-5" />
              Anesthesia Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {anesthesiaRec ? (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Recommended Anesthetic</h4>
                  <p className="text-blue-700 font-medium">{anesthesiaRec.type}</p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600 font-medium">Dosage:</span>
                      <p className="text-blue-800">{anesthesiaRec.dosage}</p>
                    </div>
                    <div>
                      <span className="text-blue-600 font-medium">Route:</span>
                      <p className="text-blue-800">{anesthesiaRec.route}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Precautions</h4>
                  <ul className="space-y-1">
                    {anesthesiaRec.precautions.map((precaution, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />
                        {precaution}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Contraindications</h4>
                  <ul className="space-y-1">
                    {anesthesiaRec.contraindications.map((contraindication, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2" />
                        {contraindication}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>AI is analyzing patient data...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Risk Factors & Complications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-3">Identified Risk Factors</h4>
              <div className="space-y-2">
                {riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm">{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                6-Month Risk Forecast
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Complication Risk:</span>
                  <Badge variant="outline" className="text-green-700">Low (12%)</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Re-treatment Probability:</span>
                  <Badge variant="outline" className="text-yellow-700">Medium (25%)</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Follow-up Compliance:</span>
                  <Badge variant="outline" className="text-green-700">High (85%)</Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">AI Recommendations</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  Use rubber dam isolation for moisture control
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  Consider sedation for patient anxiety
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  Schedule longer appointment time
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                  Plan for potential referral to endodontist
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Pill className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Prescribe Medication</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Schedule Follow-up</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Get Second Opinion</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16">
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Update Allergies</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}