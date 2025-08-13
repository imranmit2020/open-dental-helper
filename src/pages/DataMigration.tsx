import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, Database, FileText, CheckCircle, AlertTriangle, Download, Sparkles, Zap } from "lucide-react";
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
}

interface FieldMapping {
  sourceField: string;
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

export default function DataMigration() {
  const { toast } = useToast();
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceFields, setSourceFields] = useState<string[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isApplyingAI, setIsApplyingAI] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    status: 'idle',
    progress: 0,
    message: '',
    errors: [],
    recordsProcessed: 0,
    totalRecords: 0
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
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
      sourceField: '',
      targetField,
      required: requiredFields.includes(targetField),
      dataType: getFieldDataType(targetField)
    }));
    
    setFieldMappings(mappings);
    setAiSuggestions(null);
  };

  const generateAIMapping = async () => {
    if (!selectedTable || sourceFields.length === 0) return;

    setIsApplyingAI(true);
    try {
      const targetFields = getTargetFields(selectedTable);
      const aiResult = AIFieldMappingService.suggestFieldMappings(
        sourceFields,
        targetFields,
        selectedTable
      );

      setAiSuggestions(aiResult);

      toast({
        title: "AI Analysis Complete",
        description: `Found ${aiResult.suggestions.length} field mapping suggestions.`
      });
    } catch (error) {
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
        totalRecords: data.totalRecords
      });

      toast({
        title: "Migration completed",
        description: `Successfully imported ${data.recordsImported} records.`
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

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload">1. Upload File</TabsTrigger>
          <TabsTrigger value="mapping" disabled={!uploadedFile}>2. Field Mapping</TabsTrigger>
          <TabsTrigger value="validation" disabled={fieldMappings.length === 0}>3. Validation</TabsTrigger>
          <TabsTrigger value="migration" disabled={migrationStatus.status !== 'mapping'}>4. Migration</TabsTrigger>
        </TabsList>

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
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center mb-4">
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
                  <Badge variant="outline" className="px-3 py-1">
                    {aiSuggestions.suggestions.length} AI matches found
                  </Badge>
                )}
              </div>

              {aiSuggestions && aiSuggestions.suggestions.length > 0 && (
                <Alert className="mb-4">
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    AI found {aiSuggestions.suggestions.length} field mapping suggestions. 
                    Review the suggestions below and click "Apply AI Suggestions" to use them automatically.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-4">
                {fieldMappings.map((mapping, index) => (
                  <div key={mapping.targetField} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center p-4 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Label className={mapping.required ? 'font-semibold' : ''}>{mapping.targetField}</Label>
                      {mapping.required && <Badge variant="destructive">Required</Badge>}
                    </div>
                    
                    <Select
                      value={mapping.sourceField}
                      onValueChange={(value) => {
                        const newMappings = [...fieldMappings];
                        newMappings[index].sourceField = value;
                        newMappings[index].confidence = undefined;
                        newMappings[index].reason = undefined;
                        setFieldMappings(newMappings);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source field" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">-- Skip this field --</SelectItem>
                        {sourceFields.map(field => (
                          <SelectItem key={field} value={field}>{field}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Badge variant="outline">{mapping.dataType}</Badge>
                    
                    {mapping.confidence && (
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={mapping.confidence > 0.8 ? "default" : mapping.confidence > 0.6 ? "secondary" : "outline"}
                          className="text-xs"
                        >
                          AI: {Math.round(mapping.confidence * 100)}%
                        </Badge>
                        <Sparkles className="w-3 h-3 text-primary" />
                      </div>
                    )}

                    <div className="text-sm text-muted-foreground">
                      {mapping.reason ? (
                        <div>
                          <div className="font-medium">{mapping.required ? 'Required' : 'Optional'}</div>
                          <div className="text-xs opacity-70">{mapping.reason}</div>
                        </div>
                      ) : (
                        mapping.required ? 'Required field' : 'Optional field'
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {aiSuggestions && aiSuggestions.unmatchedSourceFields.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Unmatched source fields:</div>
                    <div className="flex flex-wrap gap-1">
                      {aiSuggestions.unmatchedSourceFields.map((field: string) => (
                        <Badge key={field} variant="outline" className="text-xs">{field}</Badge>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}