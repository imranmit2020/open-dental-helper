import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Brain, Shield, AlertTriangle, Clock, Syringe, Heart, Pill } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { PrescribeMedicationDialog, ScheduleFollowUpDialog, SecondOpinionDialog, UpdateAllergiesDialog } from "@/components/chairside/ActionDialogs";

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
type Patient = { id: string; first_name: string; last_name: string; date_of_birth: string | null; gender: string | null };

type AllergyRow = { allergen: string; severity: string | null };
type MedicationRow = { medication_name: string; status: string | null; notes: string | null };
type ConditionRow = { condition_name: string; status: string | null };

const calcAge = (dob: string | null) => {
  if (!dob) return null;
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
};

function analyzePatientData(currentProcedure: string, allergies: AllergyRow[], meds: MedicationRow[], conds: ConditionRow[]): { alerts: PatientAlert[]; anesthesia: AnesthesiaRecommendation; risks: string[] } {
  const alerts: PatientAlert[] = [];
  const lowerAllergens = allergies.map(a => a.allergen.toLowerCase());
  const lowerMeds = meds.map(m => m.medication_name.toLowerCase());
  const lowerConds = conds.map(c => c.condition_name.toLowerCase());

  // Allergies
  if (lowerAllergens.some(a => a.includes('penicillin'))) {
    alerts.push({
      type: 'allergy',
      severity: 'high',
      message: 'Allergy: Penicillin',
      recommendation: 'Avoid penicillin-class antibiotics. Consider clindamycin if indicated.'
    });
  }
  if (lowerAllergens.some(a => a.includes('lidocaine'))) {
    alerts.push({
      type: 'allergy',
      severity: 'high',
      message: 'Allergy: Lidocaine',
      recommendation: 'Use alternative local anesthetic (e.g., mepivacaine or prilocaine if not contraindicated).' 
    });
  }

  // Medications
  if (lowerMeds.some(m => ['warfarin','apixaban','rivaroxaban','dabigatran'].some(k => m.includes(k)))) {
    alerts.push({
      type: 'medication',
      severity: 'medium',
      message: 'Anticoagulant therapy',
      recommendation: 'Expect increased bleeding; use local hemostatic measures and minimize tissue trauma.'
    });
  }
  if (lowerMeds.some(m => ['propranolol','metoprolol','atenolol','nadolol'].some(k => m.includes(k)))) {
    alerts.push({
      type: 'medication',
      severity: 'medium',
      message: 'Beta-blocker in use',
      recommendation: 'Limit epinephrine dose; monitor BP/HR closely.'
    });
  }

  // Conditions
  if (lowerConds.some(c => ['hypertension','cardiovascular','arrhythmia'].some(k => c.includes(k)))) {
    alerts.push({
      type: 'condition',
      severity: 'medium',
      message: 'Cardiovascular condition',
      recommendation: 'Monitor vitals; minimize epinephrine; stress reduction protocol.'
    });
  }
  if (lowerConds.some(c => c.includes('asthma'))) {
    alerts.push({
      type: 'condition',
      severity: 'low',
      message: 'Asthma history',
      recommendation: 'Have bronchodilator available; avoid sulfite-containing anesthetics if sulfite-sensitive.'
    });
  }
  if (lowerConds.some(c => c.includes('diabetes'))) {
    alerts.push({
      type: 'condition',
      severity: 'medium',
      message: 'Diabetes',
      recommendation: 'Confirm meal/insulin timing; watch for hypoglycemia; consider morning appointments.'
    });
  }

  // Anesthesia recommendation baseline
  let anesthesia: AnesthesiaRecommendation = {
    type: "Lidocaine 2% with epinephrine 1:100,000",
    dosage: "1–2 cartridges (1.8–3.6 mL) as needed; max 7 mg/kg (not to exceed 500 mg)",
    route: currentProcedure === 'extraction' ? "Inferior alveolar nerve block + buccal infiltration" : "Buccal + palatal/lingual infiltration",
    precautions: ["Aspirate prior to injection", "Inject slowly", "Monitor vitals and patient comfort"],
    contraindications: []
  };

  const epiSensitive = alerts.some(a => a.message.includes('Cardiovascular')) || alerts.some(a => a.message.includes('Beta-blocker'));
  if (epiSensitive) {
    anesthesia = {
      type: "Mepivacaine 3% (plain)",
      dosage: "1–2 cartridges as needed; max 6.6 mg/kg (not to exceed 400 mg)",
      route: anesthesia.route,
      precautions: ["Avoid vasoconstrictors due to sensitivity", "Monitor for toxicity", "Shorter duration—plan accordingly"],
      contraindications: ["Severe liver disease (relative)"]
    };
  }

  if (lowerAllergens.some(a => a.includes('lidocaine'))) {
    anesthesia = {
      type: "Prilocaine 4% (consider felypressin variant if available)",
      dosage: "Use conservative dosing; max 6 mg/kg",
      route: anesthesia.route,
      precautions: ["Assess for methemoglobinemia risk", "Avoid in significant anemia/G6PD deficiency"],
      contraindications: ["Congenital methemoglobinemia", "Severe anemia"]
    };
  }

  const risks: string[] = [];
  if (currentProcedure === 'root_canal') risks.push('Complex canal morphology possible—consider CBCT if indicated');
  if (currentProcedure === 'extraction') risks.push('Post-op bleeding risk—apply local hemostatics and sutures');
  if (currentProcedure === 'crown_prep') risks.push('Tissue management: use retraction and careful isolation');
  if (alerts.some(a => a.type === 'medication')) risks.push('Medication interactions—verify with physician if unsure');
  if (alerts.some(a => a.type === 'condition')) risks.push('Medical compromise—stress reduction and shorter visits helpful');

  return { alerts, anesthesia, risks };
}

export default function ChairsideAssistant() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [currentProcedure, setCurrentProcedure] = useState("root_canal");
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [anesthesiaRec, setAnesthesiaRec] = useState<AnesthesiaRecommendation | null>(null);
  const [riskFactors, setRiskFactors] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [openPrescribe, setOpenPrescribe] = useState(false);
  const [openFollowUp, setOpenFollowUp] = useState(false);
  const [openSecondOpinion, setOpenSecondOpinion] = useState(false);
  const [openUpdateAllergies, setOpenUpdateAllergies] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

useEffect(() => {
  document.title = "Chairside AI Assistant – Patient Safety & Dosage";
}, []);

const loadPatients = async () => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('id, first_name, last_name, date_of_birth, gender')
      .order('last_name', { ascending: true })
      .limit(50);
    if (error) throw error;
    const list = (data || []) as Patient[];
    setPatients(list);
    if (!selectedPatient && list.length > 0) {
      setSelectedPatient(list[0].id);
    }
    if (!list || list.length === 0) {
      toast("No patients found. You can seed demo data.");
    }
  } catch (err) {
    console.error('Error loading patients:', err);
    toast.error("Failed to load patients");
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  loadPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

useEffect(() => {
  const run = async () => {
    if (!selectedPatient) return;
    setLoading(true);
    try {
      const [allergiesRes, medsRes, condsRes] = await Promise.all([
        supabase.from('allergies').select('allergen, severity').eq('patient_id', selectedPatient),
        supabase.from('medications').select('medication_name, status, notes').eq('patient_id', selectedPatient),
        supabase.from('medical_conditions').select('condition_name, status').eq('patient_id', selectedPatient),
      ]);
      if (allergiesRes.error) throw allergiesRes.error;
      if (medsRes.error) throw medsRes.error;
      if (condsRes.error) throw condsRes.error;

      const { alerts, anesthesia, risks } = analyzePatientData(
        currentProcedure,
        (allergiesRes.data || []) as AllergyRow[],
        (medsRes.data || []) as MedicationRow[],
        (condsRes.data || []) as ConditionRow[]
      );

      setAlerts(alerts);
      setAnesthesiaRec(anesthesia);
      setRiskFactors(risks);
    } catch (err) {
      console.error('Error analyzing data:', err);
      toast.error("Failed to analyze patient data");
    } finally {
      setLoading(false);
    }
  };
  run();
}, [selectedPatient, currentProcedure, refreshKey]);

const seedDemo = async () => {
  try {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke('seed-chairside-data', { body: {} });
    if (error) throw error;
    await loadPatients();
    toast.success("Demo data seeded");
  } catch (err) {
    console.error('Seed error:', err);
    toast.error("Failed to seed demo data");
  } finally {
    setLoading(false);
  }
};

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
              disabled={loading || patients.length === 0}
            >
              <option value="" disabled>
                {loading ? 'Loading patients...' : patients.length === 0 ? 'No patients found' : 'Select a patient'}
              </option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.last_name}, {p.first_name}
                  {p.date_of_birth ? ` (Age: ${calcAge(p.date_of_birth)})` : ''}
                  {p.gender ? `, ${p.gender}` : ''}
                </option>
              ))}
            </select>
            <div className="mt-3 flex gap-2">
              <Button size="sm" variant="outline" onClick={seedDemo} disabled={loading}>
                Seed demo data
              </Button>
            </div>
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
            <Button variant="outline" className="h-16" onClick={() => setOpenPrescribe(true)}>
              <div className="text-center">
                <Pill className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Prescribe Medication</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16" onClick={() => setOpenFollowUp(true)}>
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Schedule Follow-up</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16" onClick={() => setOpenSecondOpinion(true)}>
              <div className="text-center">
                <Brain className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Get Second Opinion</span>
              </div>
            </Button>
            <Button variant="outline" className="h-16" onClick={() => setOpenUpdateAllergies(true)}>
              <div className="text-center">
                <Shield className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Update Allergies</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      <PrescribeMedicationDialog
        open={openPrescribe}
        onOpenChange={setOpenPrescribe}
        patientId={selectedPatient}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
      <ScheduleFollowUpDialog
        open={openFollowUp}
        onOpenChange={setOpenFollowUp}
        patientId={selectedPatient}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
      <SecondOpinionDialog
        open={openSecondOpinion}
        onOpenChange={setOpenSecondOpinion}
        patientId={selectedPatient}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
      <UpdateAllergiesDialog
        open={openUpdateAllergies}
        onOpenChange={setOpenUpdateAllergies}
        patientId={selectedPatient}
        onSuccess={() => setRefreshKey((k) => k + 1)}
      />
    </div>
  );
}
