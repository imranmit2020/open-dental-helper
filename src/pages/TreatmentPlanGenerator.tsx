import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, DollarSign, Clock, TrendingUp, Star, Shield, Users } from "lucide-react";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";

interface TreatmentOption {
  id: string;
  name: string;
  type: 'basic' | 'advanced' | 'premium';
  procedures: string[];
  cost: number;
  duration: string;
  successRate: number;
  acceptanceProbability: number;
  insuranceCoverage: number;
  financing: boolean;
  urgency: 'low' | 'medium' | 'high';
  complications: string[];
}

export default function TreatmentPlanGenerator() {
  const [selectedPatient, setSelectedPatient] = useState<string>("patient_001");
  const [isGenerating, setIsGenerating] = useState(false);
  const [treatmentOptions, setTreatmentOptions] = useState<TreatmentOption[]>([]);

  const mockTreatmentOptions: TreatmentOption[] = [
    {
      id: "option_1",
      name: "Conservative Treatment Plan",
      type: "basic",
      procedures: ["Deep Cleaning", "Fluoride Treatment", "Oral Hygiene Education"],
      cost: 450,
      duration: "2-3 visits",
      successRate: 85,
      acceptanceProbability: 92,
      insuranceCoverage: 80,
      financing: false,
      urgency: "medium",
      complications: ["Temporary sensitivity"]
    },
    {
      id: "option_2", 
      name: "Comprehensive Restoration",
      type: "advanced",
      procedures: ["Root Canal", "Crown Placement", "Periodontal Therapy"],
      cost: 2850,
      duration: "4-6 visits",
      successRate: 94,
      acceptanceProbability: 68,
      insuranceCoverage: 60,
      financing: true,
      urgency: "high",
      complications: ["Post-operative discomfort", "Temporary crown issues"]
    },
    {
      id: "option_3",
      name: "Premium Aesthetic Solution",
      type: "premium", 
      procedures: ["Ceramic Implant", "Bone Graft", "Custom Crown", "Whitening"],
      cost: 4500,
      duration: "3-4 months",
      successRate: 96,
      acceptanceProbability: 45,
      insuranceCoverage: 30,
      financing: true,
      urgency: "low",
      complications: ["Healing time", "Multiple appointments"]
    }
  ];

  const generateTreatmentPlans = async () => {
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setTreatmentOptions(mockTreatmentOptions);
      setIsGenerating(false);
    }, 2000);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'basic': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI Treatment Plan Generator</h1>
        <p className="text-lg text-muted-foreground">
          Generate personalized treatment options with cost estimates and acceptance predictions
        </p>
      </div>

      {/* Patient Selection & Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Generate Treatment Plans
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Select Patient</label>
              <select 
                value={selectedPatient}
                onChange={(e) => setSelectedPatient(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="patient_001">John Smith - Upper Molar Issue</option>
                <option value="patient_002">Sarah Johnson - Periodontal Concerns</option>
                <option value="patient_003">Mike Davis - Aesthetic Treatment</option>
              </select>
            </div>
            <Button 
              onClick={generateTreatmentPlans}
              disabled={isGenerating}
              className="mt-6"
            >
              {isGenerating ? (
                <>
                  <Brain className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Plans
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Options */}
      {treatmentOptions.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Treatment Options</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {treatmentOptions.map((option) => (
              <Card key={option.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{option.name}</CardTitle>
                    <Badge className={getTypeColor(option.type)}>
                      {option.type}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <CurrencyDisplay amount={option.cost} className="text-2xl font-bold" />
                    <Badge className={getUrgencyColor(option.urgency)}>
                      {option.urgency} urgency
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-muted-foreground">Success Rate</span>
                      </div>
                      <p className="text-lg font-bold">{option.successRate}%</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-muted-foreground">Acceptance</span>
                      </div>
                      <p className="text-lg font-bold">{option.acceptanceProbability}%</p>
                    </div>
                  </div>

                  {/* Procedures */}
                  <div>
                    <h4 className="font-medium mb-2">Procedures</h4>
                    <ul className="space-y-1">
                      {option.procedures.map((procedure, index) => (
                        <li key={index} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {procedure}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Duration & Insurance */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Duration</span>
                      </div>
                      <p className="font-medium">{option.duration}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Shield className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Insurance</span>
                      </div>
                      <p className="font-medium">{option.insuranceCoverage}% covered</p>
                    </div>
                  </div>

                  {/* Financing */}
                  {option.financing && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">Financing Available</span>
                      </div>
                      <p className="text-xs text-blue-600 mt-1">
                        0% APR for 12 months • <CurrencyDisplay amount={option.cost / 12} />/month
                      </p>
                    </div>
                  )}

                  {/* Acceptance Probability */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Patient Acceptance Likelihood</span>
                      <span className="text-sm font-medium">{option.acceptanceProbability}%</span>
                    </div>
                    <Progress value={option.acceptanceProbability} className="h-2" />
                  </div>

                  <Button className="w-full">Select This Plan</Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="clinical">Clinical</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Plan</th>
                          <th className="text-center p-3">Cost</th>
                          <th className="text-center p-3">Duration</th>
                          <th className="text-center p-3">Success Rate</th>
                          <th className="text-center p-3">Acceptance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {treatmentOptions.map((option) => (
                          <tr key={option.id} className="border-b">
                            <td className="p-3 font-medium">{option.name}</td>
                            <td className="p-3 text-center">
                              <CurrencyDisplay amount={option.cost} />
                            </td>
                            <td className="p-3 text-center">{option.duration}</td>
                            <td className="p-3 text-center">{option.successRate}%</td>
                            <td className="p-3 text-center">{option.acceptanceProbability}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </TabsContent>
                
                <TabsContent value="financial" className="mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {treatmentOptions.map((option) => (
                      <div key={option.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{option.name}</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Total Cost:</span>
                            <CurrencyDisplay amount={option.cost} />
                          </div>
                          <div className="flex justify-between">
                            <span>Insurance Coverage:</span>
                            <span>{option.insuranceCoverage}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Patient Portion:</span>
                            <CurrencyDisplay amount={option.cost * (1 - option.insuranceCoverage / 100)} />
                          </div>
                          {option.financing && (
                            <div className="flex justify-between text-blue-600">
                              <span>Monthly Payment:</span>
                              <CurrencyDisplay amount={option.cost / 12} />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="clinical" className="mt-4">
                  <div className="space-y-4">
                    {treatmentOptions.map((option) => (
                      <div key={option.id} className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">{option.name}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Procedures</h5>
                            <ul className="text-sm space-y-1">
                              {option.procedures.map((proc, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-primary rounded-full" />
                                  {proc}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium mb-2">Potential Complications</h5>
                            <ul className="text-sm space-y-1">
                              {option.complications.map((comp, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1 h-1 bg-yellow-500 rounded-full" />
                                  {comp}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}