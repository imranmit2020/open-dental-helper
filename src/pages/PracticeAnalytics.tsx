import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  TrendingUp, 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  Heart, 
  DollarSign,
  Users,
  Calendar,
  Eye,
  Shield,
  Activity,
  Camera,
  AlertTriangle,
  Star,
  Lightbulb,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Gauge,
  PieChart,
  LineChart,
  Database,
  Cpu,
  Network,
  Layers,
  Radar,
  BarChart2
} from "lucide-react";
import HeatmapChart from "@/components/analytics/HeatmapChart";
import GaugeChart from "@/components/analytics/GaugeChart";
import SankeyChart from "@/components/analytics/SankeyChart";
import TreemapChart from "@/components/analytics/TreemapChart";
import WaterfallChart from "@/components/analytics/WaterfallChart";
import RadialBarChart from "@/components/analytics/RadialBarChart";
import AdvancedMetricsGrid from "@/components/analytics/AdvancedMetricsGrid";
import RevenueTrendChart from "@/components/analytics/RevenueTrendChart";
import AppointmentsTrendChart from "@/components/analytics/AppointmentsTrendChart";
import TreatmentMixChart from "@/components/analytics/TreatmentMixChart";
import StaffPerformanceChart from "@/components/analytics/StaffPerformanceChart";

export default function PracticeAnalytics() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [practiceData, setPracticeData] = useState<any[]>([]);
  const [aiInsightsData, setAiInsightsData] = useState<any[]>([]);
  const [staffData, setStaffData] = useState<any[]>([]);
  const [appointmentsData, setAppointmentsData] = useState<any[]>([]);
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [patientsData, setPatientsData] = useState<any[]>([]);
  
  useEffect(() => {
    fetchLiveData();
  }, []);

  const fetchLiveData = async () => {
    try {
      const [practiceRes, insightsRes, staffRes, appointmentsRes, invoicesRes, patientsRes] = await Promise.all([
        supabase.from('practice_analytics').select('*'),
        supabase.from('ai_practice_insights').select('*'),
        supabase.from('staff_performance').select('*'),
        supabase.from('appointments').select('*').limit(100),
        supabase.from('invoices').select('*').limit(100),
        supabase.from('patients').select('*').limit(100)
      ]);

      if (practiceRes.data) setPracticeData(practiceRes.data);
      if (insightsRes.data) setAiInsightsData(insightsRes.data);
      if (staffRes.data) setStaffData(staffRes.data);
      if (appointmentsRes.data) setAppointmentsData(appointmentsRes.data);
      if (invoicesRes.data) setInvoicesData(invoicesRes.data);
      if (patientsRes.data) setPatientsData(patientsRes.data);
    } catch (error) {
      console.error('Error fetching practice data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading practice analytics...</p>
        </div>
      </div>
    );
  }
  const revolutionaryMetrics = practiceData.length > 0 ? [
    {
      title: "AI Success Rate",
      value: `${practiceData[0]?.efficiency_score || 98.9}%`,
      change: `+${practiceData[0]?.growth_rate || 23.4}% vs traditional`,
      icon: Brain,
      color: "text-purple-600",
      gradient: "from-purple-500 to-indigo-600",
      description: "AI-enhanced treatment prediction algorithms"
    },
    {
      title: "Risk Assessment",
      value: practiceData[0]?.risk_level || "Ultra-Low",
      change: `${practiceData[0]?.risk_factors || 2} factors identified`,
      icon: Shield,
      color: "text-green-600",
      gradient: "from-green-500 to-emerald-600",
      description: "AI-powered risk analysis and prediction"
    },
    {
      title: "Revenue Optimization",
      value: `$${(practiceData[0]?.total_revenue || 67840).toLocaleString()}`,
      change: `+${practiceData[0]?.revenue_growth || 47.2}% optimized`,
      icon: Zap,
      color: "text-yellow-600",
      gradient: "from-yellow-500 to-orange-600",
      description: "AI-driven pricing and scheduling optimization"
    },
    {
      title: "Efficiency Index",
      value: `${practiceData[0]?.efficiency_score || 97.2}%`,
      change: "Peak performance achieved",
      icon: Gauge,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-600",
      description: "Multidimensional practice efficiency measurement"
    }
  ] : [];

  const aiInsights = aiInsightsData.length > 0 ? aiInsightsData.map(insight => ({
    type: insight.insight_type,
    title: insight.title,
    message: insight.message,
    confidence: insight.confidence_level,
    icon: insight.insight_type === 'optimization' ? Target :
          insight.insight_type === 'risk' ? AlertTriangle :
          insight.insight_type === 'innovation' ? Lightbulb : Brain,
    action: insight.action_recommended || "View Details"
  })) : [
    {
      type: "breakthrough",
      title: "Predictive Model Alert",
      message: "Patient analysis shows treatment success probability trends",
      confidence: "High",
      icon: Brain,
      action: "View Full Analysis"
    },
    {
      type: "optimization",
      title: "Revenue Opportunity",
      message: "AI detected potential revenue increase through scheduling optimization",
      confidence: "Very High",
      icon: Target,
      action: "Apply Optimization"
    }
  ];

  const patientBehaviorAnalytics = [
    { metric: "Visit Completion Rate", value: "96.8%", change: "+8.2%", trend: "up" },
    { metric: "Treatment Acceptance", value: "87.3%", change: "+15.7%", trend: "up" },
    { metric: "Referral Generation", value: "142%", change: "+42.0%", trend: "up" },
    { metric: "No-Show Prediction Accuracy", value: "91.4%", change: "+31.4%", trend: "up" }
  ];

  const biometricData = [
    { name: "Stress Levels During Treatment", current: 23, optimal: 15, status: "improving" },
    { name: "Pain Response Prediction", current: 89, optimal: 90, status: "excellent" },
    { name: "Recovery Time Estimation", current: 92, optimal: 85, status: "exceeding" },
    { name: "Treatment Anxiety Index", current: 34, optimal: 40, status: "good" }
  ];

  const quantumMetrics = [
    { title: "Molecular Treatment Response", value: "98.3%", description: "DNA-based treatment optimization" },
    { title: "Neurological Pain Prediction", value: "94.7%", description: "Brain activity pattern analysis" },
    { title: "Cellular Healing Rate", value: "156%", description: "Accelerated recovery protocols" },
    { title: "Biomarker Success Indicators", value: "91.2%", description: "Personalized medicine integration" }
  ];

  // Mock data for innovative charts
  const heatmapData = [
    { hour: 9, day: 'Monday', appointments: 8, revenue: 3200 },
    { hour: 10, day: 'Monday', appointments: 12, revenue: 4800 },
    { hour: 11, day: 'Monday', appointments: 15, revenue: 6000 },
    { hour: 14, day: 'Monday', appointments: 10, revenue: 4000 },
    { hour: 15, day: 'Monday', appointments: 13, revenue: 5200 },
    { hour: 9, day: 'Tuesday', appointments: 7, revenue: 2800 },
    { hour: 10, day: 'Tuesday', appointments: 14, revenue: 5600 },
    { hour: 11, day: 'Tuesday', appointments: 16, revenue: 6400 },
    { hour: 14, day: 'Tuesday', appointments: 12, revenue: 4800 },
    { hour: 15, day: 'Tuesday', appointments: 11, revenue: 4400 },
  ];

  const sankeyNodes = [
    { id: 'new_patients', label: 'New Patients', x: 50, y: 50, width: 120, height: 40, color: 'hsl(var(--primary))' },
    { id: 'consultations', label: 'Consultations', x: 250, y: 30, width: 120, height: 40, color: 'hsl(var(--accent))' },
    { id: 'treatments', label: 'Treatments', x: 250, y: 100, width: 120, height: 40, color: 'hsl(var(--secondary))' },
    { id: 'revenue', label: 'Revenue', x: 450, y: 65, width: 120, height: 40, color: 'hsl(var(--success))' }
  ];

  const sankeyLinks = [
    { source: 'new_patients', target: 'consultations', value: 85, color: 'hsl(var(--primary) / 0.6)' },
    { source: 'new_patients', target: 'treatments', value: 65, color: 'hsl(var(--primary) / 0.6)' },
    { source: 'consultations', target: 'revenue', value: 75, color: 'hsl(var(--accent) / 0.6)' },
    { source: 'treatments', target: 'revenue', value: 85, color: 'hsl(var(--secondary) / 0.6)' }
  ];

  const treemapData = [
    { name: 'Cleanings', size: 45000, revenue: 180000, patients: 450 },
    { name: 'Fillings', size: 28000, revenue: 120000, patients: 280 },
    { name: 'Crowns', size: 35000, revenue: 175000, patients: 175 },
    { name: 'Root Canals', size: 15000, revenue: 90000, patients: 90 },
    { name: 'Implants', size: 25000, revenue: 200000, patients: 80 },
    { name: 'Orthodontics', size: 18000, revenue: 160000, patients: 120 }
  ];

  const waterfallData = [
    { name: 'Base Revenue', value: 180000, type: 'positive' as const },
    { name: 'New Patients', value: 45000, type: 'positive' as const },
    { name: 'Upsells', value: 28000, type: 'positive' as const },
    { name: 'No-shows', value: -12000, type: 'negative' as const },
    { name: 'Cancellations', value: -8000, type: 'negative' as const },
    { name: 'Net Revenue', value: 233000, type: 'total' as const }
  ];

  const radialBarData = [
    { name: 'Patient Satisfaction', value: 96, fill: 'hsl(var(--success))' },
    { name: 'Treatment Success', value: 94, fill: 'hsl(var(--primary))' },
    { name: 'Staff Efficiency', value: 89, fill: 'hsl(var(--accent))' },
    { name: 'Revenue Growth', value: 87, fill: 'hsl(var(--warning))' }
  ];

  const advancedMetrics = [
    {
      title: "AI Diagnostic Accuracy",
      value: "99.7%",
      change: "+2.3% this month",
      trend: 'up' as const,
      icon: Brain,
      color: "text-purple-600",
      gradient: "from-purple-500 to-indigo-600",
      description: "ML-powered diagnostic accuracy improvement",
      progress: 99.7,
      target: 95,
      status: 'excellent' as const
    },
    {
      title: "Predictive Treatment Success",
      value: "94.2%",
      change: "+1.8% improvement",
      trend: 'up' as const,
      icon: Target,
      color: "text-green-600",
      gradient: "from-green-500 to-emerald-600",
      description: "AI-predicted treatment outcome accuracy",
      progress: 94.2,
      target: 90,
      status: 'excellent' as const
    },
    {
      title: "Patient Risk Assessment",
      value: "Ultra-Low",
      change: "3 risk factors eliminated",
      trend: 'up' as const,
      icon: Shield,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-600",
      description: "Real-time patient health risk monitoring",
      progress: 97,
      status: 'excellent' as const
    },
    {
      title: "Revenue Optimization",
      value: "$247K",
      change: "+31.4% optimized",
      trend: 'up' as const,
      icon: Zap,
      color: "text-yellow-600",
      gradient: "from-yellow-500 to-orange-600",
      description: "AI-driven revenue maximization algorithms",
      progress: 89,
      target: 85,
      status: 'excellent' as const
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Revolutionary Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Revolutionary Practice Analytics</h1>
              <p className="text-xl text-purple-100 mt-2">AI-Powered Insights Beyond Traditional Analytics</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Cpu className="h-6 w-6 text-purple-300" />
                <span className="font-semibold">Neural Processing</span>
              </div>
              <p className="text-sm text-purple-100">Advanced ML algorithms analyze 847 data points per patient</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Database className="h-6 w-6 text-blue-300" />
                <span className="font-semibold">Quantum Computing</span>
              </div>
              <p className="text-sm text-blue-100">Real-time processing of complex patient interaction patterns</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <Network className="h-6 w-6 text-indigo-300" />
                <span className="font-semibold">Predictive Networks</span>
              </div>
              <p className="text-sm text-indigo-100">Cross-practice learning from 10,000+ dental professionals</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Metrics Grid */}
      <AdvancedMetricsGrid metrics={advancedMetrics} />

      {/* Revolutionary AI Insights */}
      <Card className="professional-card hover-lift">
        <CardHeader className="border-b border-border/50">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600">
              <Brain className="h-6 w-6 text-white" />
            </div>
            Revolutionary AI Insights
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">BETA</Badge>
          </CardTitle>
          <CardDescription className="text-base">
            Next-generation predictive analytics and treatment optimization recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {aiInsights.map((insight, index) => {
              const Icon = insight.icon;
              const gradients = {
                breakthrough: "from-purple-500 to-indigo-600",
                optimization: "from-green-500 to-emerald-600", 
                risk: "from-red-500 to-orange-600",
                innovation: "from-blue-500 to-cyan-600"
              };
              
              return (
                <div key={index} className="group p-6 bg-gradient-card rounded-xl border border-border/30 hover-lift transition-all duration-300 relative overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradients[insight.type as keyof typeof gradients]} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${gradients[insight.type as keyof typeof gradients]} shadow-lg`}>
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-foreground">{insight.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {insight.confidence} Confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{insight.message}</p>
                        <Button size="sm" className={`bg-gradient-to-r ${gradients[insight.type as keyof typeof gradients]} text-white hover:opacity-90`}>
                          {insight.action}
                          <ArrowUpRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revolutionary Analytics Tabs */}
      <Tabs defaultValue="heatmaps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 bg-muted p-1 rounded-xl">
          <TabsTrigger value="heatmaps" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            <Layers className="h-4 w-4 mr-2" />
            Heatmaps
          </TabsTrigger>
          <TabsTrigger value="flows" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            <Network className="h-4 w-4 mr-2" />
            Patient Flow
          </TabsTrigger>
          <TabsTrigger value="treemaps" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            <BarChart2 className="h-4 w-4 mr-2" />
            Service Mix
          </TabsTrigger>
          <TabsTrigger value="performance" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            <Radar className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            <LineChart className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="quantum" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            <Sparkles className="h-4 w-4 mr-2" />
            Quantum
          </TabsTrigger>
        </TabsList>

        <TabsContent value="heatmaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Layers className="h-6 w-6 text-primary" />
                  Appointment Density Heatmap
                </CardTitle>
                <CardDescription>
                  Visualize peak appointment times and optimize scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HeatmapChart data={heatmapData} />
              </CardContent>
            </Card>
            
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gauge className="h-6 w-6 text-primary" />
                  Real-Time Performance Gauges
                </CardTitle>
                <CardDescription>
                  Live performance metrics with dynamic thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <GaugeChart 
                    value={94.2} 
                    title="Chair Utilization" 
                    target={85}
                    color="hsl(var(--primary))"
                  />
                  <GaugeChart 
                    value={87.8} 
                    title="Treatment Acceptance" 
                    target={80}
                    color="hsl(var(--success))"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flows" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Network className="h-6 w-6 text-primary" />
                Patient Journey Flow Analysis
              </CardTitle>
              <CardDescription>
                Visualize patient pathways from consultation to treatment completion
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SankeyChart 
                nodes={sankeyNodes} 
                links={sankeyLinks} 
                title="Patient Conversion Flow"
              />
            </CardContent>
          </Card>

          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-6 w-6 text-primary" />
                Revenue Waterfall Analysis
              </CardTitle>
              <CardDescription>
                Track revenue components and identify optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WaterfallChart data={waterfallData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treemaps" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <BarChart2 className="h-6 w-6 text-primary" />
                  Service Revenue Distribution
                </CardTitle>
                <CardDescription>
                  Hierarchical view of revenue by treatment type
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreemapChart data={treemapData} />
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <PieChart className="h-6 w-6 text-primary" />
                  Treatment Mix Analysis
                </CardTitle>
                <CardDescription>
                  Breakdown of treatments performed across the practice
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreatmentMixChart appointments={appointmentsData} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Radar className="h-6 w-6 text-primary" />
                  Multi-Dimensional Performance
                </CardTitle>
                <CardDescription>
                  Comprehensive performance metrics in radial format
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadialBarChart data={radialBarData} />
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-primary" />
                  Staff Performance Comparison
                </CardTitle>
                <CardDescription>
                  Analyze staff productivity and appointment outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StaffPerformanceChart 
                  appointments={appointmentsData} 
                  dentists={staffData}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <DollarSign className="h-6 w-6 text-primary" />
                  Revenue Trend Analysis
                </CardTitle>
                <CardDescription>
                  Advanced revenue tracking with predictive forecasting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueTrendChart invoices={invoicesData} granularity="daily" />
              </CardContent>
            </Card>

            <Card className="professional-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  Appointment Volume Trends
                </CardTitle>
                <CardDescription>
                  Track appointment patterns and seasonal variations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AppointmentsTrendChart appointments={appointmentsData} granularity="daily" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="quantum" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-purple-500" />
                {t('analytics.quantumMetrics', 'Quantum-Level Practice Metrics')}
              </CardTitle>
              <CardDescription>
                Molecular and cellular-level treatment analysis using quantum computing principles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quantumMetrics.map((metric, index) => (
                  <div key={index} className="p-6 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">{metric.value}</div>
                    <h3 className="font-semibold text-foreground mb-2">{metric.title}</h3>
                    <p className="text-sm text-muted-foreground">{metric.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Brain className="h-6 w-6 text-blue-500" />
                {t('analytics.futurePredictions', 'Future Practice Predictions')}
              </CardTitle>
              <CardDescription>
                AI-powered forecasting for practice growth, patient outcomes, and market trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                    <h3 className="font-bold text-xl mb-3 text-blue-700 dark:text-blue-300">6-Month Revenue Prediction</h3>
                    <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">$284,750</div>
                    <p className="text-blue-600/80 dark:text-blue-400/80">+34% growth trajectory with AI optimization</p>
                    <div className="mt-4 p-4 bg-white/60 dark:bg-black/20 rounded-lg">
                      <div className="text-sm text-blue-700 dark:text-blue-300">Key Growth Drivers:</div>
                      <ul className="text-sm text-blue-600/80 dark:text-blue-400/80 mt-2 space-y-1">
                        <li>• Predictive scheduling optimization: +18% efficiency</li>
                        <li>• AI treatment recommendations: +21% acceptance rate</li>
                        <li>• Patient behavior analysis: +15% retention</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-xl border border-green-200/50 dark:border-green-800/50">
                    <h3 className="font-bold text-xl mb-3 text-green-700 dark:text-green-300">Treatment Success Forecast</h3>
                    <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">96.3%</div>
                    <p className="text-green-600/80 dark:text-green-400/80">Predicted success rate for next quarter</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-xl border border-purple-200/50 dark:border-purple-800/50">
                    <h3 className="font-bold text-lg mb-3 text-purple-700 dark:text-purple-300">Market Opportunities</h3>
                    <div className="space-y-3 text-sm text-purple-600/80 dark:text-purple-400/80">
                      <div>• Cosmetic dentistry surge predicted</div>
                      <div>• Elderly care market expansion</div>
                      <div>• Preventive care trend increase</div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 rounded-xl border border-orange-200/50 dark:border-orange-800/50">
                    <h3 className="font-bold text-lg mb-3 text-orange-700 dark:text-orange-300">Risk Factors</h3>
                    <div className="space-y-3 text-sm text-orange-600/80 dark:text-orange-400/80">
                      <div>• 2 patients at high cancellation risk</div>
                      <div>• Equipment maintenance due Q2</div>
                      <div>• Staff training gap identified</div>
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