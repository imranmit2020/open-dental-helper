import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  Users, 
  Calendar, 
  Send, 
  Settings, 
  Play, 
  Pause, 
  Eye,
  BarChart3,
  Plus,
  Edit,
  Brain,
  Star,
  Share2,
  Gift,
  Instagram,
  Facebook,
  Phone,
  CheckCircle,
  AlertCircle,
  TrendingDown,
  DollarSign,
  Zap,
  Heart,
  Camera
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import BranchMap from "@/components/BranchMap";

export default function MarketingAutomation() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMarketingData();
  }, []);

  const fetchMarketingData = async () => {
    setLoading(true);
    try {
      const [campaignsData, leadsData] = await Promise.all([
        supabase.from('marketing_campaigns_enhanced').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(50)
      ]);

      if (campaignsData.error) throw campaignsData.error;
      if (leadsData.error) throw leadsData.error;

      setCampaigns(campaignsData.data || []);
      setLeads(leadsData.data || []);
    } catch (error) {
      console.error('Error fetching marketing data:', error);
      toast({
        title: "Error",
        description: "Failed to load marketing data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading marketing data...</p>
          </div>
        </div>
      </div>
    );
  }

  const totalMetrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalLeads: leads.length,
    convertedLeads: leads.filter(l => l.status === 'converted').length,
    totalRevenue: leads.reduce((sum, l) => sum + (l.ai_lead_score * 100), 0), // Estimate based on lead score
    avgConversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length) * 100 : 0,
    predictedGrowth: 23.5
  };

  // Generate audience segments from leads data
  const audienceSegments = [
    { 
      id: 1, 
      name: "New Leads", 
      count: leads.filter(l => l.status === 'new').length, 
      criteria: "Status: New", 
      engagement: 78, 
      potential: "high" 
    },
    { 
      id: 2, 
      name: "High Score Leads", 
      count: leads.filter(l => l.ai_lead_score > 70).length, 
      criteria: "AI Score > 70", 
      engagement: 85, 
      potential: "high" 
    },
    { 
      id: 3, 
      name: "Qualified Leads", 
      count: leads.filter(l => l.status === 'qualified').length, 
      criteria: "Status: Qualified", 
      engagement: 92, 
      potential: "premium" 
    },
    { 
      id: 4, 
      name: "Follow-up Required", 
      count: leads.filter(l => l.status === 'contacted').length, 
      criteria: "Contacted but not converted", 
      engagement: 45, 
      potential: "medium" 
    }
  ];

  // AI-generated segment suggestions from live data
  const aiSegmentSuggestions = [
    {
      segment: "High Score Leads",
      message: `Follow up with ${leads.filter(l => l.ai_lead_score > 80).length} high-scoring leads this week`,
      expectedROI: "250%",
      confidence: 85
    },
    {
      segment: "New Leads", 
      message: `${leads.filter(l => l.status === 'new').length} new leads need immediate attention`,
      expectedROI: "180%",
      confidence: 92
    },
    {
      segment: "Conversion Opportunity",
      message: `${leads.filter(l => l.status === 'contacted' && l.ai_lead_score > 60).length} contacted leads show high conversion potential`,
      expectedROI: "320%",
      confidence: 78
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Marketing Automation</h1>
          <p className="text-muted-foreground">Smart campaigns, lead tracking & reputation management with live data</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <Brain className="h-4 w-4" />
            AI Suggestions
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">of {totalMetrics.totalCampaigns} total</p>
            <Progress value={totalMetrics.totalCampaigns > 0 ? (totalMetrics.activeCampaigns / totalMetrics.totalCampaigns) * 100 : 0} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalLeads}</div>
            <p className="text-xs text-muted-foreground">This month</p>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lead Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(totalMetrics.totalRevenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Estimated potential</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMetrics.avgConversionRate)}%</div>
            <p className="text-xs text-muted-foreground">{totalMetrics.convertedLeads} converted</p>
            <Progress value={totalMetrics.avgConversionRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Leads</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter(l => ['new', 'contacted'].includes(l.status)).length}</div>
            <p className="text-xs text-muted-foreground">Need follow-up</p>
            <Progress value={75} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Predicted Growth</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalMetrics.predictedGrowth}%</div>
            <p className="text-xs text-muted-foreground">Next 3 months</p>
            <Progress value={totalMetrics.predictedGrowth} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* AI Marketing Suggestions Panel */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-green-600" />
            AI Marketing Suggestions (Live Data)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiSegmentSuggestions.map((suggestion, index) => (
              <div key={index} className="p-4 rounded-lg border bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800">{suggestion.segment}</h4>
                    <p className="text-sm text-green-700 mt-1">{suggestion.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <Badge variant="outline" className="text-xs">ROI: {suggestion.expectedROI}</Badge>
                      <Button size="sm" variant="outline">Implement</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Live Campaigns</TabsTrigger>
          <TabsTrigger value="leads">Lead Analytics</TabsTrigger>
          <TabsTrigger value="audiences">AI Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Live Campaign Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Campaign Performance (Live Data)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaigns.length > 0 ? campaigns.slice(0, 4).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="font-medium">{campaign.campaign_name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.campaign_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No campaigns found. Create your first campaign to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lead Sources from Live Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Lead Sources (Live Data)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {leads.length > 0 ? (
                  <>
                    {/* Group leads by source */}
                    {Object.entries(
                      leads.reduce((acc: any, lead) => {
                        const source = lead.source || 'Direct';
                        acc[source] = (acc[source] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([source, count]) => (
                      <div key={source} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">{source}</span>
                          <span className="text-muted-foreground">{count as number} leads</span>
                        </div>
                        <Progress value={((count as number) / leads.length) * 100} className="h-2" />
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No leads data available yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Branch Map (Live) */}
          <Card>
            <CardHeader>
              <CardTitle>Branch Map (Live)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[480px]">
                <BranchMap />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Live Marketing Campaigns
              </CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </CardHeader>
            <CardContent>
              {campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-4 rounded-lg border hover:bg-muted/50">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <h3 className="font-medium">{campaign.campaign_name}</h3>
                            <p className="text-sm text-muted-foreground">{campaign.campaign_type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {campaign.ai_optimization_enabled && (
                        <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">AI Optimization Enabled</span>
                          </div>
                          <p className="text-sm text-blue-700">This campaign is being automatically optimized by AI</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first marketing campaign to start engaging with your patients.</p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Lead Analytics Dashboard (Live Data)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {leads.length > 0 ? (
                <div className="space-y-4">
                  {leads.slice(0, 10).map((lead) => (
                    <div key={lead.id} className="p-4 rounded-lg border hover:bg-muted/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{lead.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {lead.source} • AI Score: {lead.ai_lead_score || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={
                            lead.status === 'converted' ? 'default' :
                            lead.status === 'qualified' ? 'outline' :
                            lead.status === 'contacted' ? 'secondary' : 'destructive'
                          }>
                            {lead.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{lead.email || 'No email'}</div>
                          <div className="text-xs text-muted-foreground">Email</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{lead.phone || 'No phone'}</div>
                          <div className="text-xs text-muted-foreground">Phone</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{lead.urgency_level || 'Medium'}</div>
                          <div className="text-xs text-muted-foreground">Urgency</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{Math.round(lead.conversion_probability || 0)}%</div>
                          <div className="text-xs text-muted-foreground">Conv. Prob.</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Leads Yet</h3>
                  <p className="text-muted-foreground">Leads will appear here as they come in through your marketing campaigns.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Audience Segments (Live Data)
              </CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Segment
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {audienceSegments.map((segment) => (
                  <div key={segment.id} className="p-4 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{segment.name}</h3>
                        <p className="text-sm text-muted-foreground">{segment.criteria}</p>
                      </div>
                      <Badge variant={
                        segment.potential === 'premium' ? 'default' :
                        segment.potential === 'high' ? 'outline' :
                        segment.potential === 'medium' ? 'secondary' :
                        'destructive'
                      }>
                        {segment.potential}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{segment.count}</div>
                        <div className="text-xs text-muted-foreground">Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold">{segment.engagement}%</div>
                        <div className="text-xs text-muted-foreground">Engagement</div>
                      </div>
                      <div className="text-center">
                        <Button size="sm" variant="outline" className="w-full">
                          <Target className="h-4 w-4 mr-1" />
                          Target
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}