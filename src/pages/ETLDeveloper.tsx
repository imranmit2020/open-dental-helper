import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Save, 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  Database, 
  FileText, 
  Settings, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
  Code,
  Table,
  Filter,
  Shuffle,
  FolderOpen
} from 'lucide-react';

interface ETLStep {
  id: string;
  type: 'extract' | 'transform' | 'load';
  name: string;
  config: Record<string, any>;
  enabled: boolean;
}

interface ETLPipeline {
  id: string;
  name: string;
  description: string;
  steps: ETLStep[];
  schedule?: string;
  lastRun?: Date;
  status: 'draft' | 'active' | 'paused' | 'error';
}

export default function ETLDeveloper() {
  const [pipelines, setPipelines] = useState<ETLPipeline[]>([
    {
      id: '1',
      name: 'Patient Data Import',
      description: 'Import patient data from external CSV files',
      steps: [],
      status: 'draft'
    }
  ]);
  
  const [selectedPipeline, setSelectedPipeline] = useState<ETLPipeline | null>(pipelines[0] || null);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<Array<{timestamp: Date, level: string, message: string}>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const extractSources = [
    { value: 'csv', label: 'CSV File', icon: FileText },
    { value: 'json', label: 'JSON File', icon: Code },
    { value: 'api', label: 'REST API', icon: Database },
    { value: 'database', label: 'External Database', icon: Table }
  ];

  const transformTypes = [
    { value: 'filter', label: 'Filter Rows', icon: Filter },
    { value: 'map', label: 'Transform Fields', icon: Shuffle },
    { value: 'validate', label: 'Data Validation', icon: CheckCircle },
    { value: 'dedupe', label: 'Remove Duplicates', icon: Settings }
  ];

  const loadTargets = [
    { value: 'patients', label: 'Patients Table', icon: Table },
    { value: 'appointments', label: 'Appointments Table', icon: Clock },
    { value: 'medical_records', label: 'Medical Records Table', icon: FileText }
  ];

  const addStep = (type: 'extract' | 'transform' | 'load') => {
    if (!selectedPipeline) return;
    
    const newStep: ETLStep = {
      id: `step-${Date.now()}`,
      type,
      name: `New ${type} step`,
      config: {},
      enabled: true
    };

    const updatedPipeline = {
      ...selectedPipeline,
      steps: [...selectedPipeline.steps, newStep]
    };

    setSelectedPipeline(updatedPipeline);
    setPipelines(pipelines.map(p => p.id === selectedPipeline.id ? updatedPipeline : p));
    
    // Show success message
    toast({
      title: "Step Added",
      description: `${type.charAt(0).toUpperCase() + type.slice(1)} step added to pipeline`,
    });
  };

  const removeStep = (stepId: string) => {
    if (!selectedPipeline) return;
    
    const updatedPipeline = {
      ...selectedPipeline,
      steps: selectedPipeline.steps.filter(s => s.id !== stepId)
    };

    setSelectedPipeline(updatedPipeline);
    setPipelines(pipelines.map(p => p.id === selectedPipeline.id ? updatedPipeline : p));
  };

  const updateStepConfig = (stepId: string, config: Record<string, any>) => {
    if (!selectedPipeline) return;
    
    const updatedPipeline = {
      ...selectedPipeline,
      steps: selectedPipeline.steps.map(s => 
        s.id === stepId ? { ...s, config: { ...s.config, ...config } } : s
      )
    };

    setSelectedPipeline(updatedPipeline);
    setPipelines(pipelines.map(p => p.id === selectedPipeline.id ? updatedPipeline : p));
  };

  const runPipeline = async () => {
    if (!selectedPipeline) return;
    
    setIsRunning(true);
    setLogs([]);

    try {
      // Simulate ETL execution
      const newLog = (level: string, message: string) => {
        setLogs(prev => [...prev, { timestamp: new Date(), level, message }]);
      };

      newLog('info', `Starting pipeline: ${selectedPipeline.name}`);
      
      for (const step of selectedPipeline.steps) {
        if (!step.enabled) {
          newLog('info', `Skipping disabled step: ${step.name}`);
          continue;
        }

        newLog('info', `Executing ${step.type} step: ${step.name}`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing
        newLog('success', `Completed step: ${step.name}`);
      }

      newLog('success', 'Pipeline execution completed successfully');
      
      toast({
        title: "Pipeline Executed",
        description: "ETL pipeline completed successfully",
      });

    } catch (error) {
      setLogs(prev => [...prev, { 
        timestamp: new Date(), 
        level: 'error', 
        message: `Pipeline failed: ${error}` 
      }]);
      
      toast({
        title: "Pipeline Failed",
        description: "Check logs for details",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const savePipeline = () => {
    if (!selectedPipeline) return;
    
    toast({
      title: "Pipeline Saved",
      description: "ETL pipeline configuration saved successfully",
    });
  };

  const createNewPipeline = () => {
    const newPipeline: ETLPipeline = {
      id: `pipeline-${Date.now()}`,
      name: 'New Pipeline',
      description: 'Description for new pipeline',
      steps: [],
      status: 'draft'
    };

    setPipelines([...pipelines, newPipeline]);
    setSelectedPipeline(newPipeline);
  };

  const handleFileUpload = async (stepId: string, file: File) => {
    if (!file) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `etl-data/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('etl-files')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL
      const { data } = supabase.storage
        .from('etl-files')
        .getPublicUrl(filePath);

      // Update the step config with the uploaded file path
      updateStepConfig(stepId, { filePath: data.publicUrl });

      toast({
        title: "File Uploaded",
        description: `${file.name} uploaded successfully`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderStepConfig = (step: ETLStep) => {
    switch (step.type) {
      case 'extract':
        return (
          <div className="space-y-4">
            <div>
              <Label>Source Type</Label>
              <Select 
                value={step.config.sourceType || ''} 
                onValueChange={(value) => updateStepConfig(step.id, { sourceType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source type" />
                </SelectTrigger>
                <SelectContent>
                  {extractSources.map(source => (
                    <SelectItem key={source.value} value={source.value}>
                      <div className="flex items-center">
                        <source.icon className="w-4 h-4 mr-2" />
                        {source.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {(step.config.sourceType === 'csv' || step.config.sourceType === 'json') && (
              <div className="space-y-2">
                <Label>File Path or URL</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="/path/to/file.csv or https://example.com/data.csv"
                    value={step.config.filePath || ''}
                    onChange={(e) => updateStepConfig(step.id, { filePath: e.target.value })}
                    className="flex-1"
                  />
                  <div className="relative">
                    <input
                      type="file"
                      accept={step.config.sourceType === 'csv' ? '.csv' : '.json'}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(step.id, file);
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      disabled={isUploading}
                      className="whitespace-nowrap"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      {isUploading ? 'Uploading...' : 'Browse'}
                    </Button>
                  </div>
                </div>
                {step.config.filePath && (
                  <p className="text-sm text-muted-foreground">
                    Current file: {step.config.filePath.split('/').pop()}
                  </p>
                )}
              </div>
            )}
            
            {step.config.sourceType === 'api' && (
              <>
                <div>
                  <Label>API Endpoint</Label>
                  <Input 
                    placeholder="https://api.example.com/data"
                    value={step.config.apiUrl || ''}
                    onChange={(e) => updateStepConfig(step.id, { apiUrl: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Headers (JSON)</Label>
                  <Textarea 
                    placeholder='{"Authorization": "Bearer token"}'
                    value={step.config.headers || ''}
                    onChange={(e) => updateStepConfig(step.id, { headers: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        );

      case 'transform':
        return (
          <div className="space-y-4">
            <div>
              <Label>Transform Type</Label>
              <Select 
                value={step.config.transformType || ''} 
                onValueChange={(value) => updateStepConfig(step.id, { transformType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transformation" />
                </SelectTrigger>
                <SelectContent>
                  {transformTypes.map(transform => (
                    <SelectItem key={transform.value} value={transform.value}>
                      <div className="flex items-center">
                        <transform.icon className="w-4 h-4 mr-2" />
                        {transform.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Transformation Rules (JavaScript)</Label>
              <Textarea 
                className="font-mono text-sm"
                placeholder="// Transform function
row => ({
  ...row,
  full_name: row.first_name + ' ' + row.last_name,
  email: row.email.toLowerCase()
})"
                rows={8}
                value={step.config.transformCode || ''}
                onChange={(e) => updateStepConfig(step.id, { transformCode: e.target.value })}
              />
            </div>
          </div>
        );

      case 'load':
        return (
          <div className="space-y-4">
            <div>
              <Label>Target Table</Label>
              <Select 
                value={step.config.targetTable || ''} 
                onValueChange={(value) => updateStepConfig(step.id, { targetTable: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target table" />
                </SelectTrigger>
                <SelectContent>
                  {loadTargets.map(target => (
                    <SelectItem key={target.value} value={target.value}>
                      <div className="flex items-center">
                        <target.icon className="w-4 h-4 mr-2" />
                        {target.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Load Strategy</Label>
              <Select 
                value={step.config.loadStrategy || 'insert'} 
                onValueChange={(value) => updateStepConfig(step.id, { loadStrategy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="insert">Insert New Records</SelectItem>
                  <SelectItem value="upsert">Insert or Update</SelectItem>
                  <SelectItem value="replace">Replace All Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Batch Size</Label>
              <Input 
                type="number"
                placeholder="1000"
                value={step.config.batchSize || ''}
                onChange={(e) => updateStepConfig(step.id, { batchSize: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return <div>No configuration available for this step type.</div>;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ETL Developer</h1>
          <p className="text-muted-foreground">Design and manage custom data pipelines</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createNewPipeline} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            New Pipeline
          </Button>
          <Button onClick={savePipeline} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button onClick={runPipeline} disabled={isRunning || !selectedPipeline}>
            <Play className="w-4 h-4 mr-2" />
            {isRunning ? 'Running...' : 'Run Pipeline'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Pipeline List */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pipelines</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <div className="space-y-2 p-4">
                  {pipelines.map(pipeline => (
                    <div
                      key={pipeline.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedPipeline?.id === pipeline.id ? 'bg-muted border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedPipeline(pipeline)}
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{pipeline.name}</h4>
                        <Badge variant={
                          pipeline.status === 'active' ? 'default' :
                          pipeline.status === 'error' ? 'destructive' : 'secondary'
                        }>
                          {pipeline.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {pipeline.description}
                      </p>
                      <div className="text-xs text-muted-foreground mt-2">
                        {pipeline.steps.length} steps
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-9">
          {selectedPipeline ? (
            <Tabs defaultValue="design" className="space-y-4">
              <TabsList>
                <TabsTrigger value="design">Pipeline Design</TabsTrigger>
                <TabsTrigger value="logs">Execution Logs</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="design" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{selectedPipeline.name}</CardTitle>
                        <CardDescription>{selectedPipeline.description}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => addStep('extract')} 
                          variant="outline" 
                          size="sm"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Extract
                        </Button>
                        <Button 
                          onClick={() => addStep('transform')} 
                          variant="outline" 
                          size="sm"
                        >
                          <Shuffle className="w-4 h-4 mr-2" />
                          Transform
                        </Button>
                        <Button 
                          onClick={() => addStep('load')} 
                          variant="outline" 
                          size="sm"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Load
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedPipeline.steps.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="font-medium mb-2">No steps configured</h3>
                        <p>Add Extract, Transform, and Load steps to build your pipeline</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedPipeline.steps.map((step, index) => (
                          <Card key={step.id} className="border-l-4 border-l-primary">
                            <CardHeader className="pb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                                    {index + 1}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      {step.type === 'extract' && <Download className="w-4 h-4" />}
                                      {step.type === 'transform' && <Shuffle className="w-4 h-4" />}
                                      {step.type === 'load' && <Upload className="w-4 h-4" />}
                                      <Input
                                        value={step.name}
                                        onChange={(e) => updateStepConfig(step.id, { name: e.target.value })}
                                        className="font-medium border-none p-0 h-auto focus-visible:ring-0"
                                      />
                                    </div>
                                    <Badge variant="outline" className="mt-1">
                                      {step.type.toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    onClick={() => removeStep(step.id)}
                                    variant="ghost"
                                    size="sm"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {renderStepConfig(step)}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="logs">
                <Card>
                  <CardHeader>
                    <CardTitle>Execution Logs</CardTitle>
                    <CardDescription>View pipeline execution history and debugging information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px] w-full">
                      {logs.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <h3 className="font-medium mb-2">No logs available</h3>
                          <p>Run the pipeline to see execution logs</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {logs.map((log, index) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                              <div className="flex items-center gap-2 min-w-0">
                                {log.level === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                                {log.level === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                                {log.level === 'info' && <AlertCircle className="w-4 h-4 text-blue-500" />}
                                <span className="text-xs text-muted-foreground">
                                  {log.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                              <span className="font-mono text-sm">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="schedule">
                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline Schedule</CardTitle>
                    <CardDescription>Configure automated execution schedule</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <Clock className="w-4 h-4" />
                      <AlertDescription>
                        Scheduling feature coming soon. Pipelines can currently be executed manually.
                      </AlertDescription>
                    </Alert>
                    
                    <div>
                      <Label>Schedule Type</Label>
                      <Select disabled>
                        <SelectTrigger>
                          <SelectValue placeholder="Select schedule type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="cron">Custom (Cron)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Database className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No Pipeline Selected</h3>
                <p className="text-muted-foreground mb-4">
                  Select a pipeline from the left panel or create a new one to get started
                </p>
                <Button onClick={createNewPipeline}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Pipeline
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}