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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
      sourceField: undefined,  // Changed from '' to undefined
      targetField,
      required: requiredFields.includes(targetField),
      dataType: getFieldDataType(targetField)
    }));
    
    setFieldMappings(mappings);
    setAiSuggestions(null);
    console.log('Initialized field mappings:', mappings); // Debug log
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
                                      <SelectContent className="bg-background z-50">
                                        <SelectItem value="SKIP_FIELD">-- Skip this field --</SelectItem>
                                        {fieldMappings
                                          .filter(fm => !fm.sourceField)
                                          .map(fm => (
                                            <SelectItem key={fm.targetField} value={fm.targetField}>
                                              {fm.targetField}
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