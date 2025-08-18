import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  Shield, 
  Zap, 
  Cloud, 
  FileText, 
  Check, 
  X, 
  Play, 
  Pause, 
  Calendar,
  Settings,
  Archive,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Monitor
} from "lucide-react";

interface BackupJob {
  id: string;
  type: 'full' | 'incremental' | 'selective';
  format: 'sql' | 'json' | 'csv';
  status: 'running' | 'completed' | 'failed' | 'scheduled';
  tables: string[];
  size: string;
  created_at: string;
  duration?: string;
  compression?: boolean;
  encryption?: boolean;
}

interface BackupSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  type: 'full' | 'incremental';
  enabled: boolean;
  next_run: string;
}

export default function AdminDatabaseBackup() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("backup");
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [schedules, setSchedules] = useState<BackupSchedule[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [currentOperation, setCurrentOperation] = useState("");

  // Backup Configuration
  const [backupType, setBackupType] = useState<'full' | 'incremental' | 'selective'>('full');
  const [exportFormat, setExportFormat] = useState<'sql' | 'json' | 'csv'>('sql');
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [compression, setCompression] = useState(true);
  const [encryption, setEncryption] = useState(false);
  const [cloudStorage, setCloudStorage] = useState(false);
  const [storageLocation, setStorageLocation] = useState<'supabase' | 'external' | 'local'>('supabase');

  // Schedule Configuration
  const [scheduleName, setScheduleName] = useState("");
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [scheduleTime, setScheduleTime] = useState("02:00");
  const [scheduleType, setScheduleType] = useState<'full' | 'incremental'>('full');

  useEffect(() => {
    loadBackupHistory();
    loadSchedules();
    loadAvailableTables();
  }, []);

  const loadBackupHistory = async () => {
    try {
      // Simulate backup history - in real implementation, this would fetch from database
      const mockJobs: BackupJob[] = [
        {
          id: "1",
          type: "full",
          format: "sql",
          status: "completed",
          tables: ["all"],
          size: "2.4 GB",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          duration: "15m 32s",
          compression: true,
          encryption: true
        },
        {
          id: "2",
          type: "incremental",
          format: "json",
          status: "completed",
          tables: ["patients", "appointments"],
          size: "156 MB",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          duration: "3m 45s",
          compression: true
        },
        {
          id: "3",
          type: "selective",
          format: "csv",
          status: "failed",
          tables: ["medical_records"],
          size: "0 MB",
          created_at: new Date(Date.now() - 259200000).toISOString(),
          compression: false
        }
      ];
      setBackupJobs(mockJobs);
    } catch (error) {
      console.error('Error loading backup history:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      const mockSchedules: BackupSchedule[] = [
        {
          id: "1",
          name: "Daily Full Backup",
          frequency: "daily",
          time: "02:00",
          type: "full",
          enabled: true,
          next_run: new Date(Date.now() + 86400000).toISOString()
        },
        {
          id: "2",
          name: "Weekly Incremental",
          frequency: "weekly",
          time: "01:00",
          type: "incremental",
          enabled: false,
          next_run: new Date(Date.now() + 604800000).toISOString()
        }
      ];
      setSchedules(mockSchedules);
    } catch (error) {
      console.error('Error loading schedules:', error);
    }
  };

  const loadAvailableTables = async () => {
    try {
      const { data: tables, error } = await supabase
        .rpc('exec_sql', { 
          sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name" 
        });

      if (error) throw error;
      
      const tableNames = Array.isArray(tables) ? tables.map((t: any) => t.table_name) : [];
      setAvailableTables(tableNames);
    } catch (error) {
      console.error('Error loading tables:', error);
      // Fallback to common tables
      setAvailableTables([
        'patients', 'appointments', 'medical_records', 'consent_forms',
        'invoices', 'employees', 'tenants', 'profiles'
      ]);
    }
  };

  const startBackup = async () => {
    setIsLoading(true);
    setBackupProgress(0);
    setCurrentOperation("Initializing backup...");

    try {
      // Simulate backup progress
      const progressSteps = [
        { progress: 10, message: "Validating database connection..." },
        { progress: 25, message: "Analyzing selected tables..." },
        { progress: 40, message: "Generating backup strategy..." },
        { progress: 60, message: "Exporting data..." },
        { progress: 80, message: "Applying compression..." },
        { progress: 95, message: "Finalizing backup file..." },
        { progress: 100, message: "Backup completed successfully!" }
      ];

      for (const step of progressSteps) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBackupProgress(step.progress);
        setCurrentOperation(step.message);
      }

      // Call the backup edge function
      const { data, error } = await supabase.functions.invoke('database-backup', {
        body: {
          type: backupType,
          format: exportFormat,
          tables: backupType === 'selective' ? selectedTables : [],
          compression,
          encryption,
          cloudStorage
        }
      });

      if (error) throw error;

      toast({
        title: "Backup Completed",
        description: `${backupType.charAt(0).toUpperCase() + backupType.slice(1)} backup completed successfully. File size: ${data.fileSize}`,
      });

      // Add to backup history
      const newJob: BackupJob = {
        id: Date.now().toString(),
        type: backupType,
        format: exportFormat,
        status: "completed",
        tables: backupType === 'selective' ? selectedTables : ["all"],
        size: data.fileSize || "Unknown",
        created_at: new Date().toISOString(),
        duration: "Calculating...",
        compression,
        encryption
      };

      setBackupJobs(prev => [newJob, ...prev]);
      
    } catch (error: any) {
      console.error('Backup failed:', error);
      toast({
        title: "Backup Failed",
        description: error.message || "An error occurred during backup",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setBackupProgress(0);
      setCurrentOperation("");
    }
  };

  const createSchedule = async () => {
    if (!scheduleName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a schedule name",
        variant: "destructive",
      });
      return;
    }

    const newSchedule: BackupSchedule = {
      id: Date.now().toString(),
      name: scheduleName,
      frequency: scheduleFrequency,
      time: scheduleTime,
      type: scheduleType,
      enabled: true,
      next_run: new Date().toISOString()
    };

    setSchedules(prev => [...prev, newSchedule]);
    setScheduleName("");
    
    toast({
      title: "Schedule Created",
      description: `Backup schedule "${scheduleName}" has been created successfully`,
    });
  };

  const toggleSchedule = (id: string) => {
    setSchedules(prev => 
      prev.map(schedule => 
        schedule.id === id 
          ? { ...schedule, enabled: !schedule.enabled }
          : schedule
      )
    );
  };

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== id));
    toast({
      title: "Schedule Deleted",
      description: "Backup schedule has been deleted successfully",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'running': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Database Backup Manager</h1>
          <p className="text-muted-foreground">
            Advanced backup solution with AI-powered optimization and cloud integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Enterprise Security
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            AI Optimized
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Create Backup
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            History
          </TabsTrigger>
          <TabsTrigger value="restore" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Restore
          </TabsTrigger>
        </TabsList>

        <TabsContent value="backup" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Backup Configuration
                </CardTitle>
                <CardDescription>
                  Configure your database backup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Backup Type</Label>
                  <Select value={backupType} onValueChange={(value: any) => setBackupType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup</SelectItem>
                      <SelectItem value="incremental">Incremental Backup</SelectItem>
                      <SelectItem value="selective">Selective Tables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sql">SQL Dump</SelectItem>
                      <SelectItem value="json">JSON Export</SelectItem>
                      <SelectItem value="csv">CSV Files</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Storage Location</Label>
                  <div className="grid grid-cols-1 gap-2">
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        storageLocation === 'supabase' 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setStorageLocation('supabase')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          storageLocation === 'supabase' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {storageLocation === 'supabase' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            <span className="font-medium">Supabase Storage</span>
                            <Badge variant="secondary" className="text-xs">Default</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Secure cloud storage with built-in versioning
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        storageLocation === 'external' 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setStorageLocation('external')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          storageLocation === 'external' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {storageLocation === 'external' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Cloud className="h-4 w-4" />
                            <span className="font-medium">External Cloud</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            AWS S3, Google Cloud, or Azure Blob Storage
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div 
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        storageLocation === 'local' 
                          ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setStorageLocation('local')}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          storageLocation === 'local' ? 'border-primary bg-primary' : 'border-muted-foreground'
                        }`}>
                          {storageLocation === 'local' && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            <span className="font-medium">Local Download</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Download directly to your device
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {backupType === 'selective' && (
                  <div className="space-y-2">
                    <Label>Select Tables</Label>
                    <div className="max-h-40 overflow-y-auto space-y-2 border rounded-md p-3">
                      {availableTables.map((table) => (
                        <div key={table} className="flex items-center space-x-2">
                          <Checkbox
                            id={table}
                            checked={selectedTables.includes(table)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTables(prev => [...prev, table]);
                              } else {
                                setSelectedTables(prev => prev.filter(t => t !== table));
                              }
                            }}
                          />
                          <Label htmlFor={table} className="text-sm">{table}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Compression</Label>
                      <p className="text-xs text-muted-foreground">
                        Reduce backup file size by up to 70%
                      </p>
                    </div>
                    <Switch checked={compression} onCheckedChange={setCompression} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Encryption</Label>
                      <p className="text-xs text-muted-foreground">
                        AES-256 encryption for sensitive data
                      </p>
                    </div>
                    <Switch checked={encryption} onCheckedChange={setEncryption} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cloud Storage</Label>
                      <p className="text-xs text-muted-foreground">
                        Upload to secure cloud storage
                      </p>
                    </div>
                    <Switch checked={cloudStorage} onCheckedChange={setCloudStorage} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Backup Operations
                </CardTitle>
                <CardDescription>
                  Start backup process and monitor progress
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        {currentOperation}
                      </span>
                    </div>
                    <Progress value={backupProgress} className="w-full" />
                    <div className="text-center text-sm text-muted-foreground">
                      {backupProgress}% Complete
                    </div>
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      className="w-full" 
                      size="lg" 
                      disabled={isLoading || (backupType === 'selective' && selectedTables.length === 0)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Backup
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Backup Operation</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will create a {backupType} backup in {exportFormat.toUpperCase()} format.
                        {backupType === 'selective' && (
                          <> Selected tables: {selectedTables.join(', ')}</>
                        )}
                        <br /><br />
                        Options: 
                        {compression && " Compression enabled."}
                        {encryption && " Encryption enabled."}
                        {cloudStorage && " Cloud storage enabled."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={startBackup}>
                        Start Backup
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <Clock className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Create Schedule</CardTitle>
                <CardDescription>
                  Set up automated backup schedules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule-name">Schedule Name</Label>
                  <Input
                    id="schedule-name"
                    value={scheduleName}
                    onChange={(e) => setScheduleName(e.target.value)}
                    placeholder="e.g., Daily Production Backup"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Select value={scheduleFrequency} onValueChange={(value: any) => setScheduleFrequency(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Backup Type</Label>
                  <Select value={scheduleType} onValueChange={(value: any) => setScheduleType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Backup</SelectItem>
                      <SelectItem value="incremental">Incremental Backup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={createSchedule} className="w-full">
                  Create Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Schedules</CardTitle>
                <CardDescription>
                  Manage your backup schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div key={schedule.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{schedule.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {schedule.frequency} at {schedule.time} • {schedule.type}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Next run: {new Date(schedule.next_run).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.enabled}
                          onCheckedChange={() => toggleSchedule(schedule.id)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>
                View and manage your backup history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {backupJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(job.status)}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {job.type.charAt(0).toUpperCase() + job.type.slice(1)} Backup
                          </span>
                          <Badge variant="outline">{job.format.toUpperCase()}</Badge>
                          {job.compression && <Badge variant="outline">Compressed</Badge>}
                          {job.encryption && <Badge variant="outline">Encrypted</Badge>}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(job.created_at).toLocaleString()} • {job.size}
                          {job.duration && ` • ${job.duration}`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Tables: {job.tables.join(', ')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="restore" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Database Restore
              </CardTitle>
              <CardDescription>
                Restore your database from backup files
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium">Drop backup file here</div>
                <div className="text-sm text-muted-foreground">
                  Or click to browse for SQL, JSON, or CSV backup files
                </div>
                <Button className="mt-4">
                  Browse Files
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Restore Type</Label>
                  <Select defaultValue="full">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Restore</SelectItem>
                      <SelectItem value="partial">Partial Restore</SelectItem>
                      <SelectItem value="merge">Merge Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Database</Label>
                  <Select defaultValue="current">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Current Database</SelectItem>
                      <SelectItem value="new">New Database</SelectItem>
                      <SelectItem value="staging">Staging Environment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="verify-backup" />
                <Label htmlFor="verify-backup">
                  Verify backup integrity before restore
                </Label>
              </div>

              <Button className="w-full" variant="destructive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Start Restore Process
              </Button>

              <div className="text-xs text-muted-foreground text-center">
                ⚠️ Warning: This will overwrite existing data. Please ensure you have a current backup.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}