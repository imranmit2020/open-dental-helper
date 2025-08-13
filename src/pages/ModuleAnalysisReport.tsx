import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ModuleAnalyzer } from "@/utils/moduleAnalyzer";
import { 
  FileSpreadsheet, 
  Download, 
  BarChart3, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  XCircle,
  Cpu,
  TrendingUp
} from "lucide-react";

export default function ModuleAnalysisReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const analyzer = new ModuleAnalyzer();

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      analyzer.downloadReport();
      toast({
        title: "Report Generated",
        description: "Excel report has been downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Get summary statistics
  const modules = (analyzer as any).modules; // Access private property for display
  const totalModules = modules.length;
  const implementedCount = modules.filter((m: any) => m.overallStatus === 'Implemented').length;
  const partiallyImplementedCount = modules.filter((m: any) => m.overallStatus === 'Partially Implemented').length;
  const placeholderCount = modules.filter((m: any) => m.overallStatus === 'Placeholder').length;
  const notImplementedCount = modules.filter((m: any) => m.overallStatus === 'Not Implemented').length;
  const aiIntegratedCount = modules.filter((m: any) => m.aiIntegration).length;
  const totalEstimatedHours = modules.reduce((sum: number, m: any) => sum + (m.estimatedHours || 0), 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Implemented': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'Partially Implemented': return <Clock className="h-4 w-4 text-warning" />;
      case 'Placeholder': return <AlertCircle className="h-4 w-4 text-info" />;
      case 'Not Implemented': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Implemented': return 'bg-success text-success-foreground';
      case 'Partially Implemented': return 'bg-warning text-warning-foreground';
      case 'Placeholder': return 'bg-info text-info-foreground';
      case 'Not Implemented': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const categories = [...new Set(modules.map((m: any) => m.category))];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold gradient-text">Module Analysis Report</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of all platform modules and features
            </p>
          </div>
        </div>
        <Button 
          onClick={handleDownload}
          disabled={isGenerating}
          className="bg-gradient-primary hover:bg-gradient-primary/90"
        >
          <FileSpreadsheet className={`h-4 w-4 mr-2 ${isGenerating ? 'animate-pulse' : ''}`} />
          {isGenerating ? 'Generating...' : 'Download Excel Report'}
        </Button>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Modules</p>
                <p className="text-2xl font-bold">{totalModules}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI Integration</p>
                <p className="text-2xl font-bold">{Math.round((aiIntegratedCount / totalModules) * 100)}%</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Cpu className="h-6 w-6 text-secondary" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {aiIntegratedCount} of {totalModules} modules
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Implementation Rate</p>
                <p className="text-2xl font-bold">{Math.round(((implementedCount + partiallyImplementedCount) / totalModules) * 100)}%</p>
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              {implementedCount + partiallyImplementedCount} modules ready
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Est. Development</p>
                <p className="text-2xl font-bold">{totalEstimatedHours}h</p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Remaining work estimate
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Implementation Status Overview</CardTitle>
          <CardDescription>
            Current status of all modules in the platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { status: 'Implemented', count: implementedCount, color: 'success' },
              { status: 'Partially Implemented', count: partiallyImplementedCount, color: 'warning' },
              { status: 'Placeholder', count: placeholderCount, color: 'info' },
              { status: 'Not Implemented', count: notImplementedCount, color: 'destructive' }
            ].map(({ status, count, color }) => (
              <div key={status} className="flex items-center justify-between p-4 rounded-lg border border-border/30 bg-gradient-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status)}
                  <div>
                    <div className="font-medium">{status}</div>
                    <div className="text-sm text-muted-foreground">{count} modules</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg">{Math.round((count / totalModules) * 100)}%</div>
                  <Progress 
                    value={(count / totalModules) * 100} 
                    className="w-16 h-2 mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Modules by Category</CardTitle>
          <CardDescription>
            Implementation status grouped by module category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {categories.map(category => {
              const categoryModules = modules.filter((m: any) => m.category === category);
              const categoryImplemented = categoryModules.filter((m: any) => m.overallStatus === 'Implemented').length;
              const categoryPartial = categoryModules.filter((m: any) => m.overallStatus === 'Partially Implemented').length;
              const categoryProgress = ((categoryImplemented + categoryPartial) / categoryModules.length) * 100;
              
              return (
                <div key={String(category)} className="p-4 rounded-lg border border-border/30 bg-gradient-card">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold">{String(category)}</h3>
                      <p className="text-sm text-muted-foreground">{categoryModules.length} modules</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{Math.round(categoryProgress)}%</div>
                      <div className="text-sm text-muted-foreground">Complete</div>
                    </div>
                  </div>
                  <Progress value={categoryProgress} className="h-2" />
                  <div className="flex gap-2 mt-2">
                    {categoryModules.map((module: any) => (
                      <Badge 
                        key={module.moduleName}
                        variant="outline" 
                        className={`text-xs ${getStatusColor(module.overallStatus)}`}
                      >
                        {module.moduleName}
                      </Badge>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Report Contents */}
      <Card>
        <CardHeader>
          <CardTitle>Excel Report Contents</CardTitle>
          <CardDescription>
            The downloadable Excel file includes the following sheets:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: 'Summary',
                description: 'High-level statistics and overview metrics'
              },
              {
                name: 'Modules Overview',
                description: 'Complete list of all modules with status and details'
              },
              {
                name: 'Detailed Features',
                description: 'Individual features within each module with implementation status'
              },
              {
                name: 'By Category',
                description: 'Implementation breakdown grouped by module category'
              },
              {
                name: 'Priority Analysis',
                description: 'Modules organized by priority level with effort estimates'
              }
            ].map((sheet) => (
              <div key={sheet.name} className="p-4 rounded-lg border border-border/30 bg-gradient-card">
                <h3 className="font-semibold mb-2">{sheet.name}</h3>
                <p className="text-sm text-muted-foreground">{sheet.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}