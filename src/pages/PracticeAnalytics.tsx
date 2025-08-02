import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Network
} from "lucide-react";

export default function PracticeAnalytics() {
  const { t } = useLanguage();
  const revolutionaryMetrics = [
    {
      title: "AI Predictive Success Rate",
      value: "94.7%",
      change: "+12.3% vs traditional",
      icon: Brain,
      color: "text-purple-600",
      gradient: "from-purple-500 to-indigo-600",
      description: "Treatment success prediction using ML algorithms"
    },
    {
      title: "Patient Risk Score",
      value: "Low",
      change: "3 high-risk identified",
      icon: Shield,
      color: "text-green-600",
      gradient: "from-green-500 to-emerald-600",
      description: "Real-time risk assessment using biomarkers"
    },
    {
      title: "Neural Revenue Optimization",
      value: "$47,240",
      change: "+23.7% AI optimized",
      icon: Zap,
      color: "text-yellow-600",
      gradient: "from-yellow-500 to-orange-600",
      description: "AI-driven pricing and scheduling optimization"
    },
    {
      title: "Quantum Efficiency Index",
      value: "97.2%",
      change: "Peak performance achieved",
      icon: Gauge,
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-600",
      description: "Multidimensional practice efficiency measurement"
    }
  ];

  const aiInsights = [
    {
      type: "breakthrough",
      title: "Predictive Model Alert",
      message: "Patient Sarah Chen shows 89% probability of treatment success with ceramic crowns vs 67% with amalgam",
      confidence: "High",
      icon: Brain,
      action: "View Full Analysis"
    },
    {
      type: "optimization",
      title: "Revenue Opportunity",
      message: "AI detected $12,400 potential revenue increase by optimizing Tuesday 2-4 PM slot scheduling",
      confidence: "Very High",
      icon: Target,
      action: "Apply Optimization"
    },
    {
      type: "risk",
      title: "Patient Risk Assessment",
      message: "3 patients flagged for potential complications based on genetic markers and treatment history",
      confidence: "High",
      icon: AlertTriangle,
      action: "Review Patients"
    },
    {
      type: "innovation",
      title: "Treatment Innovation Suggestion",
      message: "New laser therapy protocol shows 34% better outcomes for your patient demographic",
      confidence: "Medium",
      icon: Lightbulb,
      action: "Learn More"
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

      {/* Revolutionary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revolutionaryMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title} className="professional-card hover-lift relative overflow-hidden group" style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <CardHeader className="pb-3 relative z-10">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {metric.title}
                  </CardDescription>
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${metric.gradient}`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-3xl font-bold gradient-text mb-2">{metric.value}</div>
                <p className="text-sm text-muted-foreground mb-3 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  {metric.change}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{metric.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

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

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="behavior" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-muted p-1 rounded-xl">
          <TabsTrigger value="behavior" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            Patient Behavior
          </TabsTrigger>
          <TabsTrigger value="biometric" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            Biometric Analysis
          </TabsTrigger>
          <TabsTrigger value="quantum" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            Quantum Metrics
          </TabsTrigger>
          <TabsTrigger value="predictions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary data-[state=active]:text-white">
            Future Predictions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="behavior" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Eye className="h-6 w-6 text-primary" />
                {t('analytics.patientBehavior', 'Advanced Patient Behavior Analytics')}
              </CardTitle>
              <CardDescription>
                Deep learning analysis of patient interaction patterns and treatment responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {patientBehaviorAnalytics.map((item, index) => (
                  <div key={index} className="p-4 bg-gradient-card rounded-xl border border-border/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-muted-foreground">{item.metric}</span>
                      {item.trend === "up" ? (
                        <ArrowUpRight className="h-4 w-4 text-success" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-destructive" />
                      )}
                    </div>
                    <div className="text-2xl font-bold text-foreground mb-1">{item.value}</div>
                    <div className="text-xs text-success flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {item.change}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="biometric" className="space-y-6">
          <Card className="professional-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Heart className="h-6 w-6 text-red-500" />
                {t('analytics.biometricAnalysis', 'Real-Time Biometric Analysis')}
              </CardTitle>
              <CardDescription>
                Revolutionary patient monitoring using wearable integration and vital sign analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {biometricData.map((item, index) => (
                  <div key={index} className="p-6 bg-gradient-card rounded-xl border border-border/30">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">{item.name}</h3>
                      <Badge className={
                        item.status === "excellent" ? "bg-green-100 text-green-700" :
                        item.status === "exceeding" ? "bg-purple-100 text-purple-700" :
                        item.status === "improving" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }>
                        {item.status}
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Current: {item.current}%</span>
                        <span>Optimal: {item.optimal}%</span>
                      </div>
                      <Progress value={item.current} className="h-3" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
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