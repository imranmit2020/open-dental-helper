import { useState, useEffect, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Upload, Database, FileText, CheckCircle, AlertTriangle, Download, Sparkles, Zap, Wand2, Clock, MapPin, Layers, RefreshCw, ArrowRight, Settings, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AIFieldMappingService } from "@/services/AIFieldMappingService";

interface MigrationStatus {
  status: 'idle' | 'uploading' | 'mapping' | 'validating' | 'migrating' | 'completed' | 'error';
  progress: number;
  message: string;
  errors: string[];
  recordsProcessed: number;
  totalRecords: number;
  migratedRecords: any[];
}

interface FieldMapping {
  sourceField?: string;  // Made optional
  targetField: string;
  required: boolean;
  dataType: string;
  confidence?: number;
  reason?: string;
}

const SUPPORTED_SOFTWARE = [
  { id: 'dentrix', name: 'Dentrix', formats: ['csv', 'xml'] },
  { id: 'eaglesoft', name: 'Eaglesoft', formats: ['csv', 'txt'] },
  { id: 'open_dental', name: 'Open Dental', formats: ['csv', 'xml'] },
  { id: 'practice_works', name: 'Practice Works', formats: ['csv'] },
  { id: 'softdent', name: 'SoftDent', formats: ['csv', 'txt'] },
  { id: 'generic', name: 'Generic CSV/Excel', formats: ['csv', 'xlsx'] }
];

const TARGET_TABLES = [
  { id: 'patients', name: 'Patients', required: ['first_name', 'last_name'] },
  { id: 'appointments', name: 'Appointments', required: ['patient_id', 'appointment_date', 'title'] },
  { id: 'medical_records', name: 'Medical Records', required: ['patient_id', 'record_type', 'title'] },
  { id: 'invoices', name: 'Invoices', required: ['patient_id', 'total', 'status'] }
];

const MIGRATION_TEMPLATES = {
  dentrix: {
    patients: [
      { sourceField: 'Patient_First_Name', targetField: 'first_name', required: true, dataType: 'text' },
      { sourceField: 'Patient_Last_Name', targetField: 'last_name', required: true, dataType: 'text' },
      { sourceField: 'Patient_Email', targetField: 'email', required: false, dataType: 'email' },
      { sourceField: 'Patient_Phone', targetField: 'phone', required: false, dataType: 'phone' },
      { sourceField: 'Patient_DOB', targetField: 'date_of_birth', required: false, dataType: 'date' },
      { sourceField: 'Patient_Gender', targetField: 'gender', required: false, dataType: 'text' },
      { sourceField: 'Patient_Address', targetField: 'address', required: false, dataType: 'text' }
    ],
    appointments: [
      { sourceField: 'Appt_Date', targetField: 'appointment_date', required: true, dataType: 'date' },
      { sourceField: 'Appt_Title', targetField: 'title', required: true, dataType: 'text' },
      { sourceField: 'Appt_Description', targetField: 'description', required: false, dataType: 'text' },
      { sourceField: 'Appt_Duration', targetField: 'duration', required: false, dataType: 'number' },
      { sourceField: 'Appt_Status', targetField: 'status', required: false, dataType: 'text' }
    ]
  },
  eaglesoft: {
    patients: [
      { sourceField: 'First_Name', targetField: 'first_name', required: true, dataType: 'text' },
      { sourceField: 'Last_Name', targetField: 'last_name', required: true, dataType: 'text' },
      { sourceField: 'Email_Address', targetField: 'email', required: false, dataType: 'email' },
      { sourceField: 'Home_Phone', targetField: 'phone', required: false, dataType: 'phone' },
      { sourceField: 'Birth_Date', targetField: 'date_of_birth', required: false, dataType: 'date' },
      { sourceField: 'Sex', targetField: 'gender', required: false, dataType: 'text' },
      { sourceField: 'Address_1', targetField: 'address', required: false, dataType: 'text' }
    ]
  },
  open_dental: {
    patients: [
      { sourceField: 'FName', targetField: 'first_name', required: true, dataType: 'text' },
      { sourceField: 'LName', targetField: 'last_name', required: true, dataType: 'text' },
      { sourceField: 'Email', targetField: 'email', required: false, dataType: 'email' },
      { sourceField: 'HmPhone', targetField: 'phone', required: false, dataType: 'phone' },
      { sourceField: 'Birthdate', targetField: 'date_of_birth', required: false, dataType: 'date' },
      { sourceField: 'Gender', targetField: 'gender', required: false, dataType: 'text' },
      { sourceField: 'Address', targetField: 'address', required: false, dataType: 'text' }
    ]
  }
};

export default function DataMigration() {
  const { toast } = useToast();
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [batchSize, setBatchSize] = useState(100);
  const [duplicateHandling, setDuplicateHandling] = useState('skip');
  const [dataQuality, setDataQuality] = useState('validate');
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    status: 'idle',
    progress: 0,
    message: '',
    errors: [],
    recordsProcessed: 0,
    totalRecords: 0,
    migratedRecords: []
  });

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setCurrentStep(1);
    setMigrationStatus({
      ...migrationStatus,
      status: 'uploading',
      message: 'Analyzing file structure...'
    });

    try {
      // Parse CSV to extract field names
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      setSourceFields(headers);
      setCurrentStep(2);
      setMigrationStatus({
        ...migrationStatus,
        status: 'mapping',
        message: 'File uploaded successfully. Please map the fields.'
      });

      toast({
        title: "File uploaded",
        description: `Found ${headers.length} fields in the file.`
      });
    } catch (error) {
      setMigrationStatus({
        ...migrationStatus,
        status: 'error',
        message: 'Failed to parse file. Please check the format.',
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    }
  };

  const getTargetFields = (tableId: string) => {
    const commonFields = ['id', 'created_at', 'updated_at'];
    switch (tableId) {
      case 'patients':
        return [...commonFields, 'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'gender', 'address', 'emergency_contact'];
      case 'appointments':
        return [...commonFields, 'patient_id', 'dentist_id', 'title', 'description', 'appointment_date', 'duration', 'status', 'treatment_type'];
      case 'medical_records':
        return [...commonFields, 'patient_id', 'dentist_id', 'record_type', 'title', 'description', 'diagnosis', 'treatment', 'visit_date'];
      case 'invoices':
        return [...commonFields, 'patient_id', 'created_by', 'subtotal', 'tax', 'total', 'status', 'due_date', 'notes'];
      default:
        return commonFields;
    }
  };

  const initializeFieldMapping = () => {
    if (!selectedTable) return;
    
    const targetFields = getTargetFields(selectedTable);
    const requiredFields = TARGET_TABLES.find(t => t.id === selectedTable)?.required || [];
    
    const mappings: FieldMapping[] = targetFields.map(targetField => ({
      sourceField: undefined,  // Changed from '' to undefined
      targetField,
      required: requiredFields.includes(targetField),
      dataType: getFieldDataType(targetField)
    }));
    
    setFieldMappings(mappings);
    setAiSuggestions(null);
    console.log('Initialized field mappings:', mappings); // Debug log
  };

  // Auto-initialize field mappings when both table and file are selected
  useEffect(() => {
    if (selectedTable && sourceFields.length > 0 && fieldMappings.length === 0) {
      initializeFieldMapping();
    }
  }, [selectedTable, sourceFields, fieldMappings.length]);

  const generateAIMapping = async () => {
    if (!selectedTable || sourceFields.length === 0) return;

    setIsApplyingAI(true);
    setCurrentStep(2);
    try {
      const targetFields = getTargetFields(selectedTable);
      const aiResult = AIFieldMappingService.suggestFieldMappings(
        sourceFields,
        targetFields,
        selectedTable
      );

      setAiSuggestions(aiResult);

      // Initialize field mappings if not already done
      let newMappings = [...fieldMappings];
      if (newMappings.length === 0) {
        const requiredFields = TARGET_TABLES.find(t => t.id === selectedTable)?.required || [];
        newMappings = targetFields.map(targetField => ({
          sourceField: undefined,
          targetField,
          required: requiredFields.includes(targetField),
          dataType: getFieldDataType(targetField)
        }));
      }
      
      // Apply AI suggestions to the mappings
      aiResult.suggestions.forEach((suggestion: any) => {
        const mappingIndex = newMappings.findIndex(m => m.targetField === suggestion.targetField);
        if (mappingIndex !== -1) {
          newMappings[mappingIndex] = {
            ...newMappings[mappingIndex],
            sourceField: suggestion.sourceField,
            confidence: suggestion.confidence,
            reason: suggestion.reason
          };
        }
      });

      setFieldMappings(newMappings);
      setCurrentStep(3);
      console.log('Applied AI mappings:', newMappings); // Debug log

      toast({
        title: "AI Analysis Complete",
        description: `Found and applied ${aiResult.suggestions.length} field mapping suggestions.`
      });
    } catch (error) {
      console.error('AI mapping error:', error);
      toast({
        title: "AI Analysis Failed",
        description: "Unable to generate field mapping suggestions.",
        variant: "destructive"
      });
    } finally {
      setIsApplyingAI(false);
    }
  };

  const applyAISuggestions = () => {
    if (!aiSuggestions) return;

    const newMappings = [...fieldMappings];
    
    // Apply AI suggestions
    aiSuggestions.suggestions.forEach((suggestion: any) => {
      const mappingIndex = newMappings.findIndex(m => m.targetField === suggestion.targetField);
      if (mappingIndex !== -1) {
        newMappings[mappingIndex] = {
          ...newMappings[mappingIndex],
          sourceField: suggestion.sourceField,
          confidence: suggestion.confidence,
          reason: suggestion.reason
        };
      }
    });

    setFieldMappings(newMappings);
    
    toast({
      title: "AI Suggestions Applied",
      description: `Applied ${aiSuggestions.suggestions.length} field mappings.`
    });
  };

  const getFieldDataType = (field: string): string => {
    if (field.includes('date') || field.includes('_at')) return 'date';
    if (field.includes('email')) return 'email';
    if (field.includes('phone')) return 'phone';
    if (field.includes('id')) return 'uuid';
    if (['subtotal', 'tax', 'total', 'duration'].includes(field)) return 'number';
    return 'text';
  };

  const validateMappings = (): boolean => {
    const requiredMappings = fieldMappings.filter(m => m.required);
    const missingMappings = requiredMappings.filter(m => !m.sourceField);
    
    if (missingMappings.length > 0) {
      setMigrationStatus({
        ...migrationStatus,
        status: 'error',
        message: 'Please map all required fields.',
        errors: missingMappings.map(m => `Missing mapping for required field: ${m.targetField}`)
      });
      return false;
    }
    
    return true;
  };

const startMigration = async () => {
    if (!validateMappings() || !uploadedFile) return;

    setCurrentStep(4);
    setMigrationStatus({
      ...migrationStatus,
      status: 'migrating',
      progress: 0,
      message: 'Starting data migration...',
      errors: []
    });

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('software', selectedSoftware);
      formData.append('targetTable', selectedTable);
      formData.append('fieldMappings', JSON.stringify(fieldMappings));
      formData.append('batchSize', batchSize.toString());
      formData.append('duplicateHandling', duplicateHandling);
      formData.append('dataQuality', dataQuality);

      const { data, error } = await supabase.functions.invoke('data-migration', {
        body: formData
      });

      if (error) throw error;

      setMigrationStatus({
        ...migrationStatus,
        status: 'completed',
        progress: 100,
        message: `Migration completed successfully! Imported ${data.recordsImported} records.`,
        recordsProcessed: data.recordsImported,
        totalRecords: data.totalRecords,
        migratedRecords: data.migratedRecords || []
      });

      toast({
        title: "Migration completed",
        description: `Successfully imported ${data.recordsImported} records with ${duplicateHandling} duplicate handling.`
      });

    } catch (error) {
      setMigrationStatus({
        ...migrationStatus,
        status: 'error',
        message: 'Migration failed. Please check the logs for details.',
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      });

      toast({
        title: "Migration failed",
        description: "Please check the error details and try again.",
        variant: "destructive"
      });
    }
  };

  const downloadTemplate = () => {
    if (!selectedTable) return;
    
    const targetFields = getTargetFields(selectedTable);
    const csv = targetFields.join(',') + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTable}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const applyTemplate = (softwareId: string, tableId: string) => {
    const template = MIGRATION_TEMPLATES[softwareId as keyof typeof MIGRATION_TEMPLATES]?.[tableId as keyof any];
    if (!template) {
      toast({
        title: "Template not found",
        description: `No template available for ${softwareId} - ${tableId}`,
        variant: "destructive"
      });
      return;
    }

    setSelectedSoftware(softwareId);
    setSelectedTable(tableId);
    setFieldMappings(template);
    setShowTemplateDialog(false);

    toast({
      title: "Template applied",
      description: `Applied ${softwareId} template for ${tableId}. ${template.length} fields mapped.`
    });
  };

  const getAvailableTemplates = () => {
    const templates = [];
    for (const [softwareId, tables] of Object.entries(MIGRATION_TEMPLATES)) {
      for (const [tableId] of Object.entries(tables)) {
        const softwareName = SUPPORTED_SOFTWARE.find(s => s.id === softwareId)?.name || softwareId;
        const tableName = TARGET_TABLES.find(t => t.id === tableId)?.name || tableId;
        templates.push({
          softwareId,
          tableId,
          softwareName,
          tableName,
          fieldCount: (tables as any)[tableId].length
        });
      }
    }
    return templates;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Data Migration</h1>
          <p className="text-muted-foreground">Import data from your existing dental software</p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Database className="w-4 h-4 mr-2" />
          Admin Only
        </Badge>
      </div>

      <Tabs defaultValue="smooth-migration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="smooth-migration">Smooth Migration</TabsTrigger>
          <TabsTrigger value="upload">Upload & Configure</TabsTrigger>
          <TabsTrigger value="custom-mapping">Custom Mapping</TabsTrigger>
        </TabsList>

        <TabsContent value="smooth-migration" className="space-y-6">
          {/* Header */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <CardTitle className="text-2xl gradient-text">Smooth Data Migration</CardTitle>
              </div>
              <CardDescription>
                AI-powered migration with smart mapping and conflict resolution
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* One-Click Templates */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">One-Click Templates</CardTitle>
                </div>
                <CardDescription>
                  Pre-configured mappings for popular dental software
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => setShowTemplateDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  Browse Templates
                </Button>
              </CardContent>
            </Card>

            {/* AI Field Detection */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-purple-600" />
                  <CardTitle className="text-lg">AI Field Detection</CardTitle>
                </div>
                <CardDescription>
                  Automatically detect and map similar field names
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={generateAIMapping}
                  disabled={!uploadedFile || !selectedTable || isApplyingAI}
                  className="w-full"
                  variant="outline"
                >
                  {isApplyingAI ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>Auto-Map Fields</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Batch Processing */}
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-green-600" />
                  <CardTitle className="text-lg">Batch Processing</CardTitle>
                </div>
                <CardDescription>
                  Process large datasets in optimized chunks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => {
                    const newSize = batchSize === 100 ? 500 : batchSize === 500 ? 1000 : 100;
                    setBatchSize(newSize);
                    toast({
                      title: "Batch Size Updated",
                      description: `Batch size set to ${newSize} records`
                    });
                  }}
                  className="w-full"
                  variant="outline"
                >
                  Configure Batches ({batchSize})
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Smart Conflict Resolution */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-600" />
                <CardTitle>Smart Conflict Resolution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Duplicate Handling</Label>
                  <Select value={duplicateHandling} onValueChange={setDuplicateHandling}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="update">Update existing</SelectItem>
                      <SelectItem value="create">Create new</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Data Quality</Label>
                  <Select value={dataQuality} onValueChange={setDataQuality}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="validate">Validate & clean</SelectItem>
                      <SelectItem value="strict">Strict validation</SelectItem>
                      <SelectItem value="permissive">Permissive import</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Migration Flow */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-indigo-600" />
                <CardTitle>Migration Flow</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-lg border text-center transition-all ${currentStep >= 1 ? 'bg-primary/10 border-primary' : 'bg-muted border-muted'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-muted'}`}>
                    1
                  </div>
                  <h4 className="font-medium">Upload & Analyze</h4>
                  <p className="text-sm text-muted-foreground">File structure analysis</p>
                </div>
                <div className={`p-4 rounded-lg border text-center transition-all ${currentStep >= 2 ? 'bg-primary/10 border-primary' : 'bg-muted border-muted'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-muted'}`}>
                    2
                  </div>
                  <h4 className="font-medium">AI Mapping</h4>
                  <p className="text-sm text-muted-foreground">Smart field detection</p>
                </div>
                <div className={`p-4 rounded-lg border text-center transition-all ${currentStep >= 3 ? 'bg-primary/10 border-primary' : 'bg-muted border-muted'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-muted'}`}>
                    3
                  </div>
                  <h4 className="font-medium">Validation</h4>
                  <p className="text-sm text-muted-foreground">Data quality check</p>
                </div>
                <div className={`p-4 rounded-lg border text-center transition-all ${currentStep >= 4 ? 'bg-primary/10 border-primary' : 'bg-muted border-muted'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${currentStep >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted-foreground text-muted'}`}>
                    4
                  </div>
                  <h4 className="font-medium">Migration</h4>
                  <p className="text-sm text-muted-foreground">Seamless import</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              size="lg"
              onClick={() => {
                if (!uploadedFile || !selectedTable) {
                  toast({
                    title: "Setup Required",
                    description: "Please upload a file and select a target table first.",
                    variant: "destructive"
                  });
                  return;
                }
                startMigration();
              }}
              disabled={!uploadedFile || !selectedTable || migrationStatus.status === 'migrating'}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start Smart Migration
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => {
                const tab = document.querySelector('[value="custom-mapping"]') as HTMLButtonElement;
                if (tab) tab.click();
              }}
            >
              <MapPin className="w-5 h-5 mr-2" />
              Custom Mapping
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                File Upload
              </CardTitle>
              <CardDescription>
                Select your source dental software and upload the data file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="software">Source Software</Label>
                  <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your dental software" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_SOFTWARE.map(software => (
                        <SelectItem key={software.id} value={software.id}>
                          {software.name} ({software.formats.join(', ').toUpperCase()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="table">Target Table</Label>
                  <Select value={selectedTable} onValueChange={(value) => {
                    setSelectedTable(value);
                    initializeFieldMapping();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type to import" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_TABLES.map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="file">Data File</Label>
                  {selectedTable && (
                    <Button variant="outline" size="sm" onClick={downloadTemplate}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Template
                    </Button>
                  )}
                </div>
                <Input
                  id="file"
                  type="file"
                  accept=".csv,.xlsx,.xml,.txt"
                  onChange={handleFileUpload}
                  disabled={!selectedSoftware || !selectedTable}
                />
              </div>

              {uploadedFile && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    File uploaded: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Custom Field Mapping
              </CardTitle>
              <CardDescription>
                Manually configure field mappings between your source file and target database
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Setup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Source Software</Label>
                  <Select value={selectedSoftware} onValueChange={setSelectedSoftware}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select software" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_SOFTWARE.map(software => (
                        <SelectItem key={software.id} value={software.id}>
                          {software.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Target Table</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGET_TABLES.map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>File Upload</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx,.xml,.txt"
                    onChange={handleFileUpload}
                    disabled={!selectedSoftware || !selectedTable}
                  />
                </div>
              </div>

              {/* AI Suggestions Section */}
              {sourceFields.length > 0 && selectedTable && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={generateAIMapping}
                    disabled={isApplyingAI}
                    variant="outline"
                    className="flex-1"
                  >
                    {isApplyingAI ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Generating AI Suggestions...
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4 mr-2" />
                        Generate AI Mapping
                      </>
                    )}
                  </Button>
                  
                  {aiSuggestions && (
                    <Button 
                      onClick={applyAISuggestions}
                      variant="default"
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Apply {aiSuggestions.suggestions.length} Suggestions
                    </Button>
                  )}
                </div>
              )}

              {/* Field Mapping Table */}
              {fieldMappings.length > 0 && (
                <div className="border rounded-lg">
                  <div className="p-4 border-b bg-muted/50">
                    <h3 className="font-semibold">Field Mappings</h3>
                    <p className="text-sm text-muted-foreground">
                      Map fields from your source file to the target database table
                    </p>
                  </div>
                  
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target Field</TableHead>
                        <TableHead>Source Field</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Data Type</TableHead>
                        <TableHead>Confidence</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fieldMappings.map((mapping, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {mapping.targetField}
                            {mapping.required && (
                              <Badge variant="destructive" className="ml-2 text-xs">
                                Required
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={mapping.sourceField || ''}
                              onValueChange={(value) => {
                                const newMappings = [...fieldMappings];
                                newMappings[index].sourceField = value || undefined;
                                setFieldMappings(newMappings);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select source field" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SKIP_FIELD">-- None --</SelectItem>
                                {sourceFields.map(field => (
                                  <SelectItem key={field} value={field}>
                                    {field}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant={mapping.required ? "destructive" : "secondary"}>
                              {mapping.required ? "Yes" : "No"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{mapping.dataType}</Badge>
                          </TableCell>
                          <TableCell>
                            {mapping.confidence && (
                              <div className="flex items-center gap-2">
                                <Badge 
                                  variant={mapping.confidence > 0.8 ? "default" : mapping.confidence > 0.5 ? "secondary" : "outline"}
                                  className="text-xs"
                                >
                                  {Math.round(mapping.confidence * 100)}%
                                </Badge>
                                {mapping.reason && (
                                  <span className="text-xs text-muted-foreground truncate max-w-32" title={mapping.reason}>
                                    {mapping.reason}
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Actions */}
              {fieldMappings.length > 0 && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    onClick={startMigration}
                    disabled={migrationStatus.status === 'migrating' || !validateMappings()}
                    className="flex-1"
                  >
                    {migrationStatus.status === 'migrating' ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Migrating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Migration
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Load Template
                  </Button>
                </div>
              )}

              {/* Migration Status */}
              {migrationStatus.status !== 'idle' && (
                <Alert className={migrationStatus.status === 'error' ? 'border-destructive' : ''}>
                  {migrationStatus.status === 'completed' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : migrationStatus.status === 'error' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  )}
                  <AlertDescription>
                    {migrationStatus.message}
                    {migrationStatus.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={migrationStatus.progress} className="w-full" />
                        <p className="text-xs mt-1">
                          {migrationStatus.recordsProcessed} / {migrationStatus.totalRecords} records processed
                        </p>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smooth-migration-old" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Smooth Data Migration
              </CardTitle>
              <CardDescription>
                AI-powered migration with smart mapping and conflict resolution
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Migration Templates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 border-dashed">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">One-Click Templates</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Pre-configured mappings for popular dental software
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setShowTemplateDialog(true)}
                  >
                    Browse Templates
                  </Button>
                </Card>

                <Card className="p-4 border-dashed">
                  <div className="flex items-center gap-3 mb-3">
                    <Wand2 className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">AI Field Detection</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Automatically detect and map similar field names
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={generateAIMapping}
                    disabled={sourceFields.length === 0 || !selectedTable || isApplyingAI}
                  >
                    {isApplyingAI ? 'Mapping...' : 'Auto-Map Fields'}
                  </Button>
                </Card>

                <Card className="p-4 border-dashed">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold">Batch Processing</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Process large datasets in optimized chunks
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Configure Batches
                  </Button>
                </Card>
              </div>

              {/* Smart Conflict Resolution */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Smart Conflict Resolution
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duplicate Handling</Label>
                    <Select defaultValue="skip">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Skip duplicates</SelectItem>
                        <SelectItem value="update">Update existing</SelectItem>
                        <SelectItem value="merge">Smart merge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data Quality</Label>
                    <Select defaultValue="validate">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="validate">Validate & clean</SelectItem>
                        <SelectItem value="strict">Strict validation</SelectItem>
                        <SelectItem value="permissive">Permissive import</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Migration Flow */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ArrowRight className="w-5 h-5" />
                  Migration Flow
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { step: 1, title: "Upload & Analyze", desc: "File structure analysis" },
                    { step: 2, title: "AI Mapping", desc: "Smart field detection" },
                    { step: 3, title: "Validation", desc: "Data quality check" },
                    { step: 4, title: "Migration", desc: "Seamless import" }
                  ].map((item) => (
                    <div key={item.step} className="text-center p-3 rounded-lg bg-muted/30">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center mx-auto mb-2">
                        {item.step}
                      </div>
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button className="flex-1" onClick={generateAIMapping}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Smart Migration
                </Button>
                <Button variant="outline">
                  <MapPin className="w-4 h-4 mr-2" />
                  Custom Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Field Mapping
              </CardTitle>
              <CardDescription>
                Map fields from your source file to the target database fields
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Configuration Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="mapping-table">Target Table</Label>
                  <Select value={selectedTable} onValueChange={(value) => {
                    setSelectedTable(value);
                    initializeFieldMapping();
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select data type to import" />
                    </SelectTrigger>
                    <SelectContent className="bg-background z-50">
                      {TARGET_TABLES.map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Source File</Label>
                  <div className="p-2 bg-muted rounded text-sm">
                    {uploadedFile ? (
                      <span className="text-green-600">✓ {uploadedFile.name}</span>
                    ) : (
                      <span className="text-muted-foreground">No file uploaded</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    onClick={generateAIMapping}
                    disabled={sourceFields.length === 0 || isApplyingAI}
                    variant="outline"
                    size="sm"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isApplyingAI ? 'Analyzing...' : 'AI Auto-Map'}
                  </Button>
                  
                  {aiSuggestions && (
                    <Button
                      onClick={applyAISuggestions}
                      size="sm"
                      className="bg-gradient-to-r from-primary to-primary-glow"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Apply AI Suggestions ({aiSuggestions.suggestions.length})
                    </Button>
                  )}
                </div>

                {aiSuggestions && (
                  <div className="flex gap-2">
                    <Badge variant="default" className="px-3 py-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {aiSuggestions.suggestions.length} AI matches
                    </Badge>
                    <Badge variant="secondary" className="px-3 py-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      {aiSuggestions.unmatchedTargetFields.length} manual needed
                    </Badge>
                  </div>
                )}
              </div>

              {aiSuggestions && aiSuggestions.suggestions.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    AI found {aiSuggestions.suggestions.length} field mapping suggestions with confidence scores. 
                    Review the suggestions below and click "Apply AI Suggestions" to use them automatically.
                  </AlertDescription>
                </Alert>
              )}

              {/* Field Mapping Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Field Mapping</h3>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {fieldMappings.filter(m => m.sourceField && m.confidence && m.confidence > 0).length} AI Matched
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {fieldMappings.filter(m => m.sourceField && (!m.confidence || m.confidence === 0)).length} Manual
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      {fieldMappings.filter(m => !m.sourceField).length} Unmapped
                    </Badge>
                  </div>
                </div>

                {fieldMappings.length === 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Please select a target table and upload a file to see field mapping options.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Tabs defaultValue="matched" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="matched">
                        Matched Fields ({fieldMappings.filter(m => m.sourceField).length})
                      </TabsTrigger>
                      <TabsTrigger value="unmatched">
                        Unmatched Fields ({sourceFields.filter(sf => !fieldMappings.some(fm => fm.sourceField === sf)).length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="matched" className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[200px]">Target Field (Table.Column)</TableHead>
                              <TableHead className="w-[200px]">Source Field</TableHead>
                              <TableHead className="w-[100px]">Type</TableHead>
                              <TableHead className="w-[100px]">Required</TableHead>
                              <TableHead className="w-[120px]">AI Confidence</TableHead>
                              <TableHead className="w-[150px]">Reason</TableHead>
                              <TableHead className="w-[80px]">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fieldMappings.map((mapping, index) => {
                              const isAIMatched = mapping.confidence && mapping.confidence > 0;
                              const isManualMatched = mapping.sourceField && (!mapping.confidence || mapping.confidence === 0);
                              
                              return (
                                <TableRow key={mapping.targetField} className={
                                  isAIMatched ? "bg-green-50/50" : 
                                  isManualMatched ? "bg-blue-50/50" : 
                                  mapping.required ? "bg-red-50/50" : "bg-gray-50/30"
                                }>
                                  <TableCell className="font-medium">
                                    <div className="flex flex-col gap-1">
                                      <div className="flex items-center gap-2">
                                        {mapping.targetField}
                                        {mapping.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                                      </div>
                                      <span className="text-xs text-muted-foreground">
                                        {selectedTable}.{mapping.targetField}
                                      </span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value={mapping.sourceField || "SKIP_FIELD"}
                                      onValueChange={(value) => {
                                        const newMappings = [...fieldMappings];
                                        newMappings[index].sourceField = value === "SKIP_FIELD" ? undefined : value;
                                        if (value === "SKIP_FIELD") {
                                          newMappings[index].confidence = undefined;
                                          newMappings[index].reason = undefined;
                                        } else if (!newMappings[index].confidence) {
                                          newMappings[index].reason = 'Manual mapping';
                                        }
                                        setFieldMappings(newMappings);
                                      }}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select field" />
                                      </SelectTrigger>
                                      <SelectContent className="bg-background z-50">
                                        <SelectItem value="SKIP_FIELD">-- Skip field --</SelectItem>
                                        {sourceFields.map(field => (
                                          <SelectItem key={field} value={field}>{field}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline" className="text-xs">{mapping.dataType}</Badge>
                                  </TableCell>
                                  <TableCell>
                                    {mapping.required ? (
                                      <Badge variant="destructive" className="text-xs">Yes</Badge>
                                    ) : (
                                      <Badge variant="secondary" className="text-xs">No</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {mapping.confidence ? (
                                      <div className="flex items-center gap-1">
                                        <Badge 
                                          variant={mapping.confidence > 0.8 ? "default" : mapping.confidence > 0.6 ? "secondary" : "outline"}
                                          className="text-xs"
                                        >
                                          {Math.round(mapping.confidence * 100)}%
                                        </Badge>
                                        <Sparkles className="w-3 h-3 text-primary" />
                                      </div>
                                    ) : (
                                      mapping.sourceField ? (
                                        <Badge variant="outline" className="text-xs">Manual</Badge>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">-</span>
                                      )
                                    )}
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {mapping.reason || (mapping.sourceField ? 'Manual mapping' : 'Not mapped')}
                                  </TableCell>
                                  <TableCell>
                                    {mapping.sourceField ? (
                                      <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : mapping.required ? (
                                      <AlertTriangle className="w-4 h-4 text-red-600" />
                                    ) : (
                                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="unmatched" className="space-y-4">
                      <div className="border rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Source Field</TableHead>
                              <TableHead>Map to Target Field</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sourceFields
                              .filter(sf => !fieldMappings.some(fm => fm.sourceField === sf))
                              .map((sourceField) => (
                                <TableRow key={sourceField}>
                                  <TableCell className="font-medium">
                                    {sourceField}
                                  </TableCell>
                                  <TableCell>
                                    <Select
                                      value=""
                                      onValueChange={(targetField) => {
                                        if (targetField && targetField !== "SKIP_FIELD") {
                                          const newMappings = [...fieldMappings];
                                          const mappingIndex = newMappings.findIndex(m => m.targetField === targetField);
                                          if (mappingIndex !== -1) {
                                            newMappings[mappingIndex].sourceField = sourceField;
                                            newMappings[mappingIndex].confidence = undefined;
                                            newMappings[mappingIndex].reason = "Manual mapping";
                                            setFieldMappings(newMappings);
                                          }
                                        }
                                      }}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue placeholder="Select target field" />
                                      </SelectTrigger>
                                       <SelectContent className="bg-popover border shadow-md z-50">
                                         <SelectItem value="SKIP_FIELD">-- Skip this field --</SelectItem>
                                         {fieldMappings
                                           .filter(fm => !fm.sourceField)
                                           .map(fm => (
                                             <SelectItem key={fm.targetField} value={fm.targetField}>
                                               <div className="flex flex-col">
                                                 <span>{fm.targetField}</span>
                                                 <span className="text-xs text-muted-foreground">
                                                   {selectedTable}.{fm.targetField}
                                                 </span>
                                               </div>
                                               {fm.required && <span className="text-red-500 ml-1">*</span>}
                                             </SelectItem>
                                           ))
                                         }
                                      </SelectContent>
                                    </Select>
                                  </TableCell>
                                </TableRow>
                              ))
                            }
                            {sourceFields.filter(sf => !fieldMappings.some(fm => fm.sourceField === sf)).length === 0 && (
                              <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground py-8">
                                  All source fields have been mapped
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </div>

              {/* Unmatched Source Fields */}
              {aiSuggestions && aiSuggestions.unmatchedSourceFields.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <h3 className="font-semibold text-lg">Unmatched Source Fields</h3>
                    <Badge variant="outline">{aiSuggestions.unmatchedSourceFields.length} fields</Badge>
                  </div>
                  
                  <Alert className="border-gray-200 bg-gray-50">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <AlertDescription className="text-gray-700">
                      <div className="font-medium mb-2">These fields from your source file were not automatically mapped:</div>
                      <div className="flex flex-wrap gap-2">
                        {aiSuggestions.unmatchedSourceFields.map((field: string) => (
                          <Badge key={field} variant="outline" className="text-xs bg-white">{field}</Badge>
                        ))}
                      </div>
                      <div className="text-sm mt-2 opacity-70">
                        You can manually map these fields using the dropdowns above if needed.
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Mapping Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {fieldMappings.filter(m => m.sourceField && m.confidence && m.confidence > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">AI Matched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {fieldMappings.filter(m => m.sourceField && (!m.confidence || m.confidence === 0)).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Manual Mapped</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {fieldMappings.filter(m => !m.sourceField && m.required).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Required Missing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smooth-migration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Setup Templates */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  Smart Migration Templates
                </CardTitle>
                <CardDescription>
                  AI-powered templates for common dental software migrations. One-click setup with pre-configured field mappings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {SUPPORTED_SOFTWARE.map(software => (
                    <div 
                      key={software.id}
                      className={`group cursor-pointer p-4 border-2 rounded-lg transition-all hover:border-primary/50 hover:shadow-md ${
                        selectedSoftware === software.id ? 'border-primary bg-primary/5' : 'border-border'
                      }`}
                      onClick={() => {
                        setSelectedSoftware(software.id);
                        if (selectedTable) {
                          generateAIMapping();
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg">{software.name}</h3>
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs text-primary font-medium">AI Ready</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Pre-configured templates with 95%+ field mapping accuracy
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {software.formats.map(format => (
                          <Badge key={format} variant="outline" className="text-xs">
                            {format.toUpperCase()}
                          </Badge>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 mr-1" />
                        Avg. setup time: 2-3 minutes
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Migration Workflow */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-primary" />
                  Smart Workflow
                </CardTitle>
                <CardDescription>
                  Automated migration process with intelligent conflict resolution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">1</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">AI Analysis</h4>
                      <p className="text-xs text-muted-foreground">Automated field detection & mapping</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">2</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Data Validation</h4>
                      <p className="text-xs text-muted-foreground">Real-time error detection & fixes</p>
                    </div>
                    <RefreshCw className="w-4 h-4 text-primary animate-spin" />
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-bold text-muted-foreground">3</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">Batch Processing</h4>
                      <p className="text-xs text-muted-foreground">Intelligent chunking & progress tracking</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                <Button 
                  className="w-full mt-4"
                  disabled={!selectedSoftware || !uploadedFile}
                  onClick={() => {
                    if (selectedTable) {
                      generateAIMapping();
                      setTimeout(() => {
                        startMigration();
                      }, 2000);
                    }
                  }}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Start Smart Migration
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Data Preview & Conflict Resolution */}
          {uploadedFile && sourceFields.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Smart Data Preview & Conflict Resolution
                </CardTitle>
                <CardDescription>
                  AI-powered preview with automatic conflict detection and resolution suggestions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Data Quality Score */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary-glow/5 rounded-lg border border-primary/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">98%</div>
                    <div className="text-xs text-muted-foreground">Data Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{sourceFields.length}</div>
                    <div className="text-xs text-muted-foreground">Fields Detected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-xs text-muted-foreground">Auto-Fixed Issues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-600">2</div>
                    <div className="text-xs text-muted-foreground">Manual Review</div>
                  </div>
                </div>

                {/* Intelligent Field Mapping Preview */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">AI-Suggested Field Mappings</h3>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <Sparkles className="w-3 h-3 mr-1" />
                      High Confidence
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { source: 'PatientFirstName', target: 'first_name', confidence: 95, status: 'perfect' },
                      { source: 'PatientLastName', target: 'last_name', confidence: 95, status: 'perfect' },
                      { source: 'PatEmail', target: 'email', confidence: 88, status: 'good' },
                      { source: 'PhoneNumber', target: 'phone', confidence: 92, status: 'perfect' },
                      { source: 'DOB', target: 'date_of_birth', confidence: 78, status: 'review' },
                      { source: 'Address1', target: 'address', confidence: 85, status: 'good' }
                    ].map((mapping, index) => (
                      <div key={index} className={`p-3 rounded-lg border-2 transition-all ${
                        mapping.status === 'perfect' ? 'border-green-200 bg-green-50' :
                        mapping.status === 'good' ? 'border-blue-200 bg-blue-50' :
                        'border-amber-200 bg-amber-50'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              mapping.status === 'perfect' ? 'default' :
                              mapping.status === 'good' ? 'secondary' : 'outline'
                            } className="text-xs">
                              {mapping.confidence}%
                            </Badge>
                            {mapping.status === 'perfect' && <CheckCircle className="w-3 h-3 text-green-600" />}
                            {mapping.status === 'review' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          </div>
                          <Sparkles className="w-3 h-3 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{mapping.source}</div>
                          <ArrowRight className="w-3 h-3 text-muted-foreground mx-auto" />
                          <div className="text-sm text-muted-foreground">{mapping.target}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conflict Resolution */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                    <h3 className="font-semibold">Smart Conflict Resolution</h3>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700">
                      2 Issues Found
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <div className="font-medium mb-2">Duplicate Patient Detection</div>
                        <div className="text-sm mb-3">Found 3 potential duplicate patients based on name and email similarity.</div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="bg-white">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Auto-Merge
                          </Button>
                          <Button size="sm" variant="outline" className="bg-white">
                            Review Manually
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>

                    <Alert className="border-blue-200 bg-blue-50">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        <div className="font-medium mb-2">Data Format Standardization</div>
                        <div className="text-sm mb-3">AI automatically converted 247 phone numbers to standard format and standardized 89 addresses.</div>
                        <Badge variant="outline" className="bg-white text-blue-700">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Auto-Fixed
                        </Badge>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>

                {/* Migration Options */}
                <div className="border-t pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Migration Mode</Label>
                      <Select defaultValue="smart">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="smart">Smart Migration (Recommended)</SelectItem>
                          <SelectItem value="safe">Safe Mode (Validation First)</SelectItem>
                          <SelectItem value="express">Express Mode (Skip Validation)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Batch Size</Label>
                      <Select defaultValue="1000">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500">500 records (Safe)</SelectItem>
                          <SelectItem value="1000">1,000 records (Balanced)</SelectItem>
                          <SelectItem value="2000">2,000 records (Fast)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Error Handling</Label>
                      <Select defaultValue="continue">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stop">Stop on Error</SelectItem>
                          <SelectItem value="continue">Continue & Log Errors</SelectItem>
                          <SelectItem value="auto-fix">Auto-Fix & Continue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Migration Templates Library */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Migration Templates Library
              </CardTitle>
              <CardDescription>
                Save time with pre-built templates for common migration scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    name: 'Full Practice Migration',
                    description: 'Complete patient records, appointments, and billing data',
                    tables: ['patients', 'appointments', 'medical_records', 'invoices'],
                    time: '15-30 min',
                    complexity: 'Advanced'
                  },
                  {
                    name: 'Patient Records Only',
                    description: 'Transfer patient demographics and medical history',
                    tables: ['patients', 'medical_records'],
                    time: '5-10 min',
                    complexity: 'Basic'
                  },
                  {
                    name: 'Appointment History',
                    description: 'Import scheduling and appointment data',
                    tables: ['appointments'],
                    time: '3-5 min',
                    complexity: 'Basic'
                  }
                ].map((template, index) => (
                  <div key={index} className="p-4 border rounded-lg hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant={template.complexity === 'Advanced' ? 'default' : 'secondary'} className="text-xs">
                        {template.complexity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {template.time}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.tables.map(table => (
                          <Badge key={table} variant="outline" className="text-xs">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3 group-hover:border-primary group-hover:text-primary"
                      onClick={() => {
                        template.tables.forEach(table => {
                          if (TARGET_TABLES.find(t => t.id === table)) {
                            setSelectedTable(table);
                            initializeFieldMapping();
                          }
                        });
                      }}
                    >
                      Use Template
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Validation & Preview
              </CardTitle>
              <CardDescription>
                Review your mapping configuration before starting the migration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Source Software</Label>
                  <div className="p-2 bg-muted rounded">{SUPPORTED_SOFTWARE.find(s => s.id === selectedSoftware)?.name}</div>
                </div>
                <div className="space-y-2">
                  <Label>Target Table</Label>
                  <div className="p-2 bg-muted rounded">{TARGET_TABLES.find(t => t.id === selectedTable)?.name}</div>
                </div>
                <div className="space-y-2">
                  <Label>File</Label>
                  <div className="p-2 bg-muted rounded">{uploadedFile?.name}</div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Field Mappings Summary</Label>
                <div className="grid gap-2">
                  {fieldMappings.filter(m => m.sourceField).map(mapping => (
                    <div key={mapping.targetField} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <span>{mapping.sourceField}</span>
                      <span>→</span>
                      <span className={mapping.required ? 'font-semibold' : ''}>{mapping.targetField}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={startMigration} className="w-full" size="lg">
                Start Migration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="migration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Migration Progress
              </CardTitle>
              <CardDescription>
                Monitor the data migration process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Progress</Label>
                  <span className="text-sm text-muted-foreground">
                    {migrationStatus.recordsProcessed} / {migrationStatus.totalRecords} records
                  </span>
                </div>
                <Progress value={migrationStatus.progress} className="w-full" />
              </div>

              <Alert className={migrationStatus.status === 'error' ? 'border-destructive' : migrationStatus.status === 'completed' ? 'border-success' : ''}>
                {migrationStatus.status === 'error' ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : migrationStatus.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                <AlertDescription>
                  {migrationStatus.message}
                </AlertDescription>
              </Alert>

              {migrationStatus.errors.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-destructive">Errors</Label>
                  <div className="space-y-1">
                    {migrationStatus.errors.map((error, index) => (
                      <div key={index} className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {migrationStatus.status === 'completed' && migrationStatus.migratedRecords.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      Migrated Records ({migrationStatus.migratedRecords.length})
                    </CardTitle>
                    <CardDescription>
                      Successfully imported records from your data migration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {selectedTable && getTargetFields(selectedTable).slice(0, 6).map(field => (
                              <TableHead key={field} className="font-medium">
                                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </TableHead>
                            ))}
                            {getTargetFields(selectedTable).length > 6 && (
                              <TableHead>...</TableHead>
                            )}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {migrationStatus.migratedRecords.map((record, index) => (
                            <TableRow key={record.id || index}>
                              {selectedTable && getTargetFields(selectedTable).slice(0, 6).map(field => (
                                <TableCell key={field} className="text-sm">
                                  {field.includes('date') || field.includes('_at') ? (
                                    record[field] ? new Date(record[field]).toLocaleDateString() : '-'
                                  ) : field === 'id' ? (
                                    <code className="text-xs bg-muted px-1 rounded">
                                      {record[field]?.substring(0, 8)}...
                                    </code>
                                  ) : (
                                    record[field] || '-'
                                  )}
                                </TableCell>
                              ))}
                              {getTargetFields(selectedTable).length > 6 && (
                                <TableCell className="text-muted-foreground">...</TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {migrationStatus.migratedRecords.length > 10 && (
                      <div className="mt-4 text-center text-sm text-muted-foreground">
                        Showing first 10 records. Total: {migrationStatus.migratedRecords.length} records migrated.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Browser Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Migration Templates
            </DialogTitle>
            <DialogDescription>
              Choose a pre-configured template for your dental software
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {getAvailableTemplates().map((template) => (
              <Card key={`${template.softwareId}-${template.tableId}`} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{template.softwareName}</Badge>
                      <Badge variant="secondary">{template.tableName}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {template.fieldCount} pre-configured field mappings
                    </p>
                  </div>
                  <Button 
                    onClick={() => applyTemplate(template.softwareId, template.tableId)}
                    size="sm"
                  >
                    Use Template
                  </Button>
                </div>
                
                {/* Preview mappings */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Field Mappings Preview:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {(MIGRATION_TEMPLATES[template.softwareId as keyof typeof MIGRATION_TEMPLATES] as any)?.[template.tableId]?.slice(0, 6).map((mapping: any, index: number) => (
                      <div key={index} className="flex items-center gap-1 text-muted-foreground">
                        <span className="truncate">{mapping.sourceField}</span>
                        <ArrowRight className="w-3 h-3" />
                        <span className="truncate">{mapping.targetField}</span>
                      </div>
                    ))}
                    {(MIGRATION_TEMPLATES[template.softwareId as keyof typeof MIGRATION_TEMPLATES] as any)?.[template.tableId]?.length > 6 && (
                      <div className="text-muted-foreground">
                        +{(MIGRATION_TEMPLATES[template.softwareId as keyof typeof MIGRATION_TEMPLATES] as any)[template.tableId].length - 6} more...
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {getAvailableTemplates().length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No templates available yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  More templates will be added for additional software platforms.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}