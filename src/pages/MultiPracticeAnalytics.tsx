import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencyDisplay } from "@/components/CurrencyDisplay";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTenant } from "@/contexts/TenantContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Building, 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign, 
  BarChart3, 
  Activity, 
  MapPin,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Target,
  Clock,
  Star,
  Brain,
  TrendingDown
} from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart } from 'recharts';
import { useNavigate } from "react-router-dom";

// Chart data arrays (can be enhanced with live data in the future)

const performanceData = [
  { month: 'Jan', downtown: 45000, westside: 35000, northside: 40000, southside: 30000 },
  { month: 'Feb', downtown: 52000, westside: 38000, northside: 42000, southside: 32000 },
  { month: 'Mar', downtown: 48000, westside: 41000, northside: 45000, southside: 35000 },
  { month: 'Apr', downtown: 55000, westside: 43000, northside: 47000, southside: 37000 },
  { month: 'May', downtown: 58000, westside: 45000, northside: 50000, southside: 40000 },
  { month: 'Jun', downtown: 62000, westside: 48000, northside: 52000, southside: 42000 }
];

const patientFlow = [
  { practice: 'Downtown', new: 45, returning: 165, total: 210 },
  { practice: 'Westside', new: 35, returning: 125, total: 160 },
  { practice: 'Northside', new: 40, returning: 140, total: 180 },
  { practice: 'Southside', new: 28, returning: 110, total: 138 }
];

const treatmentData = [
  { name: 'Cleanings', value: 45, color: '#8884d8' },
  { name: 'Fillings', value: 25, color: '#82ca9d' },
  { name: 'Crowns', value: 15, color: '#ffc658' },
  { name: 'Root Canals', value: 10, color: '#ff7300' },
  { name: 'Extractions', value: 5, color: '#8dd1e1' }
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

// Top performing staff across practices
const topPerformers = [
  { name: "Dr. Sarah Johnson", practice: "Downtown Dental", metric: "Revenue", value: "$45,000", rank: 1 },
  { name: "Dr. Michael Chen", practice: "Northside Dental", metric: "Patient Satisfaction", value: "98%", rank: 2 },
  { name: "Lisa Rodriguez, RDH", practice: "Downtown Dental", metric: "Efficiency", value: "95%", rank: 3 },
  { name: "Dr. Emily Davis", practice: "Westside Dental", metric: "Treatment Acceptance", value: "87%", rank: 4 },
  { name: "James Wilson, RDH", practice: "Northside Dental", metric: "Productivity", value: "92%", rank: 5 }
];

// AI Insights
const aiInsights = [
  {
    type: "warning",
    practice: "Westside Dental",
    message: "Branch #2 has highest no-show risk this month (18% above average)",
    action: "Implement reminder automation"
  },
  {
    type: "optimization",
    practice: "Southside Dental",
    message: "Branch #4 is underutilizing Chair 3, consider schedule optimization",
    action: "Adjust scheduling patterns"
  },
  {
    type: "opportunity",
    practice: "Downtown Dental",
    message: "High treatment acceptance rate suggests capacity for premium services",
    action: "Introduce cosmetic packages"
  },
  {
    type: "prediction",
    practice: "All Practices",
    message: "Forecast shows 15% revenue increase potential with staff reallocation",
    action: "Review staffing strategy"
  }
];

// Service revenue breakdown
const serviceRevenue = [
  { service: 'Cleanings', downtown: 35000, westside: 28000, northside: 32000, southside: 25000 },
  { service: 'Fillings', downtown: 25000, westside: 20000, northside: 23000, southside: 18000 },
  { service: 'Crowns', downtown: 30000, westside: 22000, northside: 27000, southside: 20000 },
  { service: 'Implants', downtown: 20000, westside: 15000, northside: 18000, southside: 12000 },
  { service: 'Orthodontics', downtown: 15000, westside: 13000, northside: 10000, southside: 10000 }
];

// Staff efficiency radar data
const staffEfficiency = [
  { practice: 'Downtown', productivity: 90, satisfaction: 95, efficiency: 88, retention: 92 },
  { practice: 'Westside', productivity: 75, satisfaction: 80, efficiency: 72, retention: 85 },
  { practice: 'Northside', productivity: 85, satisfaction: 92, efficiency: 87, retention: 90 },
  { practice: 'Southside', productivity: 70, satisfaction: 75, efficiency: 68, retention: 80 }
];

export default function MultiPracticeAnalytics() {
  const { t } = useLanguage();
  const { tenants, currentTenant, corporation } = useTenant();
  const [selectedPractice, setSelectedPractice] = useState("all");
  const [timeRange, setTimeRange] = useState("6months");
  const [activeTab, setActiveTab] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [serviceRevenueData, setServiceRevenueData] = useState<any[]>([]);
  const [staffPerformanceData, setStaffPerformanceData] = useState<any[]>([]);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [aiInsightsData, setAiInsightsData] = useState<any[]>([]);
  const [networkRevenue, setNetworkRevenue] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAllData();
  }, [timeRange, tenants.length, currentTenant?.id, corporation?.id]);

  const getStartDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '1month': now.setMonth(now.getMonth() - 1); break;
      case '3months': now.setMonth(now.getMonth() - 3); break;
      case '6months': now.setMonth(now.getMonth() - 6); break;
      case '1year': now.setFullYear(now.getFullYear() - 1); break;
    }
    return now.toISOString();
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // 1) Practice analytics (optional metrics)
      const { data: practiceData, error: practiceError } = await supabase
        .from('practice_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (practiceError) console.warn('practice_analytics not available for this role:', practiceError.message);

      // 2) Live revenue from invoices across allowed clinics
      // 2) Live revenue: corporation-wide via secure RPC, otherwise current clinic fallback
      const start = getStartDate();
      const end = new Date().toISOString();

      if (corporation?.id) {
        const { data: corpRows, error: corpErr } = await supabase.rpc('get_corporation_revenue', {
          _start: start,
          _end: end,
        });
        if (corpErr) throw corpErr;
        const total = (corpRows || []).reduce((sum: number, r: any) => sum + (Number(r.total_revenue) || 0), 0);
        setNetworkRevenue(total);
      } else {
        const tenantIds = currentTenant ? [currentTenant.id] : [];
        if (tenantIds.length > 0) {
          const { data: invoices, error: invError } = await supabase
            .from('invoices')
            .select('tenant_id,total,issued_at')
            .in('tenant_id', tenantIds)
            .gte('issued_at', start)
            .lte('issued_at', end);
          if (invError) throw invError;
          const total = (invoices || []).reduce((sum, inv) => sum + (Number(inv.total) || 0), 0);
          setNetworkRevenue(total);
        } else {
          setNetworkRevenue(0);
        }
      }

      // 3) Leaderboard and AI insights (existing)
      const [{ data: leaderData, error: leaderError }, { data: insightsData, error: insightsError }] = await Promise.all([
        supabase.from('practice_leaderboard').select('*').order('ranking', { ascending: true }),
        supabase.from('ai_practice_insights').select('*').order('created_at', { ascending: false }).limit(10),
      ]);
      if (leaderError) console.warn('practice_leaderboard fetch warning:', leaderError.message);
      if (insightsError) console.warn('ai_practice_insights fetch warning:', insightsError.message);

      const practiceMetrics = groupMetricsByPractice(practiceData || []);
      setAnalyticsData(practiceMetrics);
      setLeaderboardData(leaderData || []);
      setAiInsightsData(insightsData || []);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to group metrics by practice
  const groupMetricsByPractice = (metrics: any[]) => {
    const practiceMap = new Map();
    
    metrics.forEach(metric => {
      const practiceKey = metric.metadata?.practice_name || `Practice ${Math.floor(Math.random() * 4) + 1}`;
      
      if (!practiceMap.has(practiceKey)) {
        practiceMap.set(practiceKey, {
          id: practiceMap.size + 1,
          practice_name: practiceKey,
          location: metric.metadata?.location || 'Downtown',
          revenue: 0,
          patient_count: 0,
          appointments_count: 0,
          chair_utilization: 75,
          treatment_acceptance_rate: 80,
          no_show_rate: 10,
          insurance_claim_success_rate: 90,
          staff_count: 8,
          created_at: metric.created_at
        });
      }
      
      const practice = practiceMap.get(practiceKey);
      
      // Map metric types to practice properties
      switch (metric.metric_type) {
        case 'revenue':
          practice.revenue = metric.metric_value;
          break;
        case 'patients':
          practice.patient_count = metric.metric_value;
          break;
        case 'appointments':
          practice.appointments_count = metric.metric_value;
          break;
        case 'utilization':
          practice.chair_utilization = metric.metric_value;
          break;
        case 'acceptance_rate':
          practice.treatment_acceptance_rate = metric.metric_value;
          break;
        case 'no_show_rate':
          practice.no_show_rate = metric.metric_value;
          break;
        case 'insurance_success':
          practice.insurance_claim_success_rate = metric.metric_value;
          break;
      }
    });
    
    return Array.from(practiceMap.values());
  };

  // Transform analytics data into practices format
  const practices = analyticsData.length > 0 ? analyticsData.map((practice, index) => ({
    id: practice.id,
    name: practice.practice_name,
    location: practice.location,
    patients: practice.patient_count,
    revenue: practice.revenue,
    appointments: practice.appointments_count,
    target: practice.revenue * 0.9, // Set target as 90% of current revenue
    chairUtilization: practice.chair_utilization,
    treatmentAcceptance: practice.treatment_acceptance_rate,
    missedAppointments: Math.floor(practice.appointments_count * (practice.no_show_rate / 100)),
    insuranceClaimSuccess: practice.insurance_claim_success_rate,
    status: practice.revenue >= (practice.revenue * 0.9) ? 'above_target' : 
            practice.chair_utilization >= 75 ? 'at_risk' : 'needs_attention',
    coordinates: { lat: 40.7128 + (index * 0.1), lng: -74.0060 + (index * 0.1) },
    staffCount: practice.staff_count,
    chairCount: Math.ceil(practice.chair_utilization / 15) // Estimate chairs based on utilization
  })) : [];

  const displayedPractices = selectedPractice === "all"
    ? practices
    : practices.filter((p) => p.id.toString() === selectedPractice);

  const totalMetrics = displayedPractices.length > 0 ? {
    totalRevenue: displayedPractices.reduce((sum, p) => sum + p.revenue, 0),
    totalPatients: displayedPractices.reduce((sum, p) => sum + p.patients, 0),
    totalAppointments: displayedPractices.reduce((sum, p) => sum + p.appointments, 0),
    avgRevenue: displayedPractices.reduce((sum, p) => sum + p.revenue, 0) / displayedPractices.length,
    avgChairUtilization: displayedPractices.reduce((sum, p) => sum + p.chairUtilization, 0) / displayedPractices.length,
    avgTreatmentAcceptance: displayedPractices.reduce((sum, p) => sum + p.treatmentAcceptance, 0) / displayedPractices.length,
    totalMissedAppointments: displayedPractices.reduce((sum, p) => sum + p.missedAppointments, 0),
    avgInsuranceSuccess: displayedPractices.reduce((sum, p) => sum + p.insuranceClaimSuccess, 0) / displayedPractices.length
  } : {
    totalRevenue: 0,
    totalPatients: 0,
    totalAppointments: 0,
    avgRevenue: 0,
    avgChairUtilization: 0,
    avgTreatmentAcceptance: 0,
    totalMissedAppointments: 0,
    avgInsuranceSuccess: 0
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'above_target': return 'text-green-600 bg-green-50 border-green-200';
      case 'at_risk': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'needs_attention': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'above_target': return <CheckCircle className="h-4 w-4" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'needs_attention': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Multi-Practice Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive insights & AI-powered recommendations across all practice locations</p>
        </div>
        <div className="flex gap-4">
          <Select value={selectedPractice} onValueChange={setSelectedPractice}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Practice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Practices</SelectItem>
              {practices.map((practice) => (
                <SelectItem key={practice.id} value={practice.id.toString()}>
                  {practice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
          {currentTenant?.id && (
            <Button variant="outline" onClick={() => navigate(`/practice-analytics/${currentTenant.id}`)}>
              View Clinic Detail
            </Button>
          )}
        </div>
      </div>

      {/* Enhanced Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <CurrencyDisplay amount={networkRevenue || totalMetrics.totalRevenue} variant="large" />
            </div>
            <p className="text-xs text-muted-foreground">Time range applied</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chair Utilization</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMetrics.avgChairUtilization)}%</div>
            <p className="text-xs text-muted-foreground">Network average</p>
            <Progress value={totalMetrics.avgChairUtilization} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Treatment Acceptance</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMetrics.avgTreatmentAcceptance)}%</div>
            <p className="text-xs text-muted-foreground">Average across practices</p>
            <Progress value={totalMetrics.avgTreatmentAcceptance} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No-Show Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round((totalMetrics.totalMissedAppointments / totalMetrics.totalAppointments) * 100)}%</div>
            <p className="text-xs text-muted-foreground">Network average</p>
            <Progress value={(totalMetrics.totalMissedAppointments / totalMetrics.totalAppointments) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Insurance Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMetrics.avgInsuranceSuccess)}%</div>
            <p className="text-xs text-muted-foreground">Claim approval rate</p>
            <Progress value={totalMetrics.avgInsuranceSuccess} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* AI Insights Panel */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI-Powered Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiInsightsData.length > 0 ? aiInsightsData.slice(0, 4).map((insight, index) => (
              <div key={insight.id} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.insight_type === 'alert' ? 'bg-yellow-100 text-yellow-600' :
                    insight.insight_type === 'recommendation' ? 'bg-blue-100 text-blue-600' :
                    insight.insight_type === 'prediction' && insight.insight_category === 'opportunity' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {insight.insight_type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                    {insight.insight_type === 'recommendation' && <Target className="h-4 w-4" />}
                    {insight.insight_type === 'prediction' && insight.insight_category === 'opportunity' && <TrendingUp className="h-4 w-4" />}
                    {insight.insight_type === 'prediction' && insight.insight_category !== 'opportunity' && <Brain className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground mb-1">{insight.title}</h4>
                    <p className="text-sm text-foreground">{insight.description}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">{insight.practice_name}</Badge>
                      <Badge variant={insight.priority_level === 'high' ? 'destructive' : insight.priority_level === 'medium' ? 'default' : 'secondary'} className="text-xs">
                        {insight.priority_level}
                      </Badge>
                    </div>
                    {insight.confidence_score && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Confidence</span>
                          <span>{insight.confidence_score}%</span>
                        </div>
                        <Progress value={insight.confidence_score} className="h-1 mt-1" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : aiInsights.map((insight, index) => (
              <div key={index} className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                    insight.type === 'optimization' ? 'bg-blue-100 text-blue-600' :
                    insight.type === 'opportunity' ? 'bg-green-100 text-green-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {insight.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {insight.type === 'optimization' && <Target className="h-4 w-4" />}
                    {insight.type === 'opportunity' && <TrendingUp className="h-4 w-4" />}
                    {insight.type === 'prediction' && <Brain className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{insight.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">Suggested Action: {insight.action}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{insight.practice}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Practice Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Practice Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {displayedPractices.map((practice) => (
              <Card key={practice.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{practice.name}</h3>
                    <Badge variant="secondary">{practice.location}</Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Patients:</span>
                      <span className="font-medium">{practice.patients}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revenue:</span>
                      <span className="font-medium">${practice.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Appointments:</span>
                      <span className="font-medium">{practice.appointments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Branch Insights</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="efficiency">Staff Efficiency</TabsTrigger>
          <TabsTrigger value="predictions">AI Predictions</TabsTrigger>
          <TabsTrigger value="map">Branch Map</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Practice Comparison KPIs with Color Coding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {displayedPractices.map((practice) => (
              <Card key={practice.id} className={`border-l-4 ${
                practice.status === 'above_target' ? 'border-l-green-500' :
                practice.status === 'at_risk' ? 'border-l-yellow-500' :
                'border-l-red-500'
              }`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{practice.name}</CardTitle>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(practice.status)}`}>
                      {getStatusIcon(practice.status)}
                      <span className="capitalize">{practice.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <CurrencyDisplay amount={practice.revenue} variant="small" className="font-semibold" />
                      <p className="text-xs text-muted-foreground">Target: <CurrencyDisplay amount={practice.target} variant="compact" /></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Chair Utilization</p>
                      <p className="font-semibold">{practice.chairUtilization}%</p>
                      <Progress value={practice.chairUtilization} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">Treatment Acceptance</p>
                      <p className="font-semibold">{practice.treatmentAcceptance}%</p>
                      <Progress value={practice.treatmentAcceptance} className="mt-1" />
                    </div>
                    <div>
                      <p className="text-muted-foreground">No-Shows</p>
                      <p className="font-semibold">{practice.missedAppointments}</p>
                      <p className="text-xs text-muted-foreground">This month</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Insurance Claims</span>
                      <span className="font-semibold">{practice.insuranceClaimSuccess}%</span>
                    </div>
                    <Progress value={practice.insuranceClaimSuccess} className="mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Cross-Practice Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboardData.length > 0 ? leaderboardData.slice(0, 5).map((performer, index) => (
                  <div key={performer.id} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-500'
                    }`}>
                      {performer.ranking}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{performer.staff_name}</h3>
                      <p className="text-sm text-muted-foreground">{performer.practice_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {performer.metric_type === 'revenue' ? `$${performer.metric_value.toLocaleString()}` : 
                         `${performer.metric_value}${performer.metric_type.includes('efficiency') || performer.metric_type.includes('satisfaction') ? '%' : ''}`}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{performer.metric_type.replace('_', ' ')}</p>
                    </div>
                    {index === 0 && <Star className="h-5 w-5 text-yellow-500" />}
                  </div>
                )) : topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 rounded-lg border bg-muted/30">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      index === 0 ? 'bg-yellow-500' :
                      index === 1 ? 'bg-gray-400' :
                      index === 2 ? 'bg-orange-600' :
                      'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{performer.name}</h3>
                      <p className="text-sm text-muted-foreground">{performer.practice}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{performer.value}</p>
                      <p className="text-xs text-muted-foreground">{performer.metric}</p>
                    </div>
                    {index === 0 && <Star className="h-5 w-5 text-yellow-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Service Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={serviceRevenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="service" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="downtown" stackId="a" fill="#8884d8" name="Downtown" />
                    <Bar dataKey="westside" stackId="a" fill="#82ca9d" name="Westside" />
                    <Bar dataKey="northside" stackId="a" fill="#ffc658" name="Northside" />
                    <Bar dataKey="southside" stackId="a" fill="#ff7300" name="Southside" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trends (6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Line type="monotone" dataKey="downtown" stroke="#8884d8" strokeWidth={2} name="Downtown" />
                    <Line type="monotone" dataKey="westside" stroke="#82ca9d" strokeWidth={2} name="Westside" />
                    <Line type="monotone" dataKey="northside" stroke="#ffc658" strokeWidth={2} name="Northside" />
                    <Line type="monotone" dataKey="southside" stroke="#ff7300" strokeWidth={2} name="Southside" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Staff Efficiency Heatmap</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={staffEfficiency}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="practice" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Productivity" dataKey="productivity" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Radar name="Satisfaction" dataKey="satisfaction" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    <Radar name="Efficiency" dataKey="efficiency" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                    <Radar name="Retention" dataKey="retention" stroke="#ff7300" fill="#ff7300" fillOpacity={0.6} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Patient Flow Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={patientFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="practice" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="new" stackId="a" fill="#8884d8" name="New Patients" />
                    <Bar dataKey="returning" stackId="a" fill="#82ca9d" name="Returning Patients" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Treatment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={treatmentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {treatmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Treatment Volume by Practice</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {treatmentData.map((treatment, index) => (
                    <div key={treatment.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: treatment.color }}
                        />
                        <span className="font-medium">{treatment.name}</span>
                      </div>
                      <Badge variant="outline">{treatment.value}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-600" />
                  AI Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
                  <h4 className="font-semibold text-purple-800">Staffing Optimization</h4>
                  <p className="text-sm text-purple-700 mt-1">Westside Dental needs 2 additional hygienists next month to handle predicted 25% appointment increase.</p>
                  <Button size="sm" className="mt-2" variant="outline">View Details</Button>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <h4 className="font-semibold text-green-800">Revenue Opportunity</h4>
                  <p className="text-sm text-green-700 mt-1">Downtown location has 15% capacity for premium cosmetic services based on patient demographics.</p>
                  <Button size="sm" className="mt-2" variant="outline">Implement</Button>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
                  <h4 className="font-semibold text-orange-800">Risk Alert</h4>
                  <p className="text-sm text-orange-700 mt-1">Southside practice showing early indicators of patient drop-off. Immediate intervention recommended.</p>
                  <Button size="sm" className="mt-2" variant="outline">Take Action</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue Leak Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayedPractices.map((practice) => (
                    <div key={practice.id} className="p-3 rounded-lg border">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{practice.name}</h4>
                        <Badge variant={practice.status === 'above_target' ? 'default' : practice.status === 'at_risk' ? 'outline' : 'destructive'}>
                          {practice.status === 'above_target' ? 'Optimal' : practice.status === 'at_risk' ? 'Monitor' : 'Action Needed'}
                        </Badge>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Potential Revenue Leak:</span>
                          <span className="font-medium">${((practice.target - practice.revenue) > 0 ? (practice.target - practice.revenue) : 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Efficiency Score:</span>
                          <span className="font-medium">{practice.chairUtilization}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="map" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Interactive Branch Map View
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-blue-200 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-blue-800">Interactive Map Coming Soon</h3>
                  <p className="text-blue-600 mt-2">Real-time practice locations with color-coded performance indicators</p>
                </div>
                
                {/* Simulated map pins */}
                <div className="absolute top-20 left-20 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute top-32 right-24 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-32 left-32 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg"></div>
                <div className="absolute bottom-20 right-20 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              
              {/* Map Legend */}
              <div className="mt-4 flex justify-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Above Target</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">At Risk</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm">Needs Attention</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}