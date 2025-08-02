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

// Enhanced Mock data for marketing automation
const campaigns = [
  {
    id: 1,
    name: "Welcome Series",
    type: "email",
    status: "active",
    audience: 450,
    openRate: 68,
    clickRate: 12,
    conversions: 34,
    revenue: 8500,
    lastSent: "2024-01-15",
    trigger: "New patient signup",
    aiSuggestion: "Add WhatsApp channel for 15% higher engagement"
  },
  {
    id: 2,
    name: "Cleaning Reminders",
    type: "sms",
    status: "active",
    audience: 1200,
    openRate: 95,
    clickRate: 23,
    conversions: 156,
    revenue: 18700,
    lastSent: "2024-01-14",
    trigger: "6 months since last visit",
    aiSuggestion: "Optimal campaign - consider expanding to other practices"
  },
  {
    id: 3,
    name: "Post-Treatment Follow-up",
    type: "email",
    status: "active",
    audience: 280,
    openRate: 72,
    clickRate: 18,
    conversions: 42,
    revenue: 5200,
    lastSent: "2024-01-13",
    trigger: "3 days after treatment",
    aiSuggestion: "Add review request automation for 2-3x better reviews"
  },
  {
    id: 4,
    name: "Birthday Promotions",
    type: "email",
    status: "paused",
    audience: 800,
    openRate: 55,
    clickRate: 8,
    conversions: 24,
    revenue: 3600,
    lastSent: "2024-01-10",
    trigger: "Patient birthday month",
    aiSuggestion: "Low performance - try whitening promotion instead"
  },
  {
    id: 5,
    name: "Whitening Campaign",
    type: "whatsapp",
    status: "active",
    audience: 320,
    openRate: 89,
    clickRate: 35,
    conversions: 68,
    revenue: 15400,
    lastSent: "2024-01-12",
    trigger: "AI detected interest in cosmetic services",
    aiSuggestion: "High-performing segment - scale to similar demographics"
  },
  {
    id: 6,
    name: "Invisalign Prospects",
    type: "email",
    status: "active",
    audience: 156,
    openRate: 62,
    clickRate: 28,
    conversions: 22,
    revenue: 26400,
    lastSent: "2024-01-11",
    trigger: "Crowding noted in X-rays",
    aiSuggestion: "Perfect targeting - consider similar orthodontic campaigns"
  }
];

const templates = [
  {
    id: 1,
    name: "Appointment Reminder",
    type: "sms",
    subject: "Appointment Reminder",
    content: "Hi {{firstName}}, this is a reminder of your appointment tomorrow at {{time}}. Reply CONFIRM to confirm or RESCHEDULE to change.",
    variables: ["firstName", "time"]
  },
  {
    id: 2,
    name: "Treatment Follow-up",
    type: "email",
    subject: "How are you feeling after your treatment?",
    content: "Dear {{firstName}}, we hope you're feeling great after your recent {{treatment}}. If you have any questions or concerns, please don't hesitate to reach out.",
    variables: ["firstName", "treatment"]
  },
  {
    id: 3,
    name: "Cleaning Reminder",
    type: "email",
    subject: "Time for your dental cleaning!",
    content: "Hi {{firstName}}, it's been 6 months since your last cleaning. Regular cleanings are important for maintaining oral health. Book your appointment today!",
    variables: ["firstName"]
  }
];

const audienceSegments = [
  { id: 1, name: "New Patients", count: 245, criteria: "Registered in last 30 days", engagement: 78, potential: "high" },
  { id: 2, name: "Due for Cleaning", count: 890, criteria: "Last cleaning > 6 months ago", engagement: 85, potential: "high" },
  { id: 3, name: "High Value Patients", count: 156, criteria: "Lifetime value > $5,000", engagement: 92, potential: "premium" },
  { id: 4, name: "Missed Appointments", count: 78, criteria: "No-show in last 90 days", engagement: 45, potential: "low" },
  { id: 5, name: "Treatment Complete", count: 234, criteria: "Completed treatment in last 7 days", engagement: 88, potential: "medium" },
  { id: 6, name: "Whitening Prospects", count: 320, criteria: "Inquired about cosmetic services", engagement: 89, potential: "high" },
  { id: 7, name: "Orthodontic Candidates", count: 156, criteria: "Crowding noted in X-rays", engagement: 72, potential: "premium" },
  { id: 8, name: "Inactive Patients", count: 445, criteria: "No visit in 12+ months", engagement: 35, potential: "reactivation" }
];

// AI-generated segment suggestions
const aiSegmentSuggestions = [
  {
    segment: "Whitening Prospects",
    message: "Send Whitening Promo to 22 patients who inquired last 6 months",
    expectedROI: "250%",
    confidence: 85
  },
  {
    segment: "Invisalign Candidates", 
    message: "Promote Invisalign to 15 patients with crowding noted in last X-rays",
    expectedROI: "420%",
    confidence: 92
  },
  {
    segment: "Family Package",
    message: "Target families with multiple members for cleaning package deals",
    expectedROI: "180%",
    confidence: 78
  }
];

// Referral & Loyalty Program data
const referralProgram = {
  totalReferrals: 156,
  activeMembers: 890,
  pointsAwarded: 12450,
  rewardsRedeemed: 67,
  topReferrers: [
    { name: "Sarah Johnson", referrals: 8, points: 800, tier: "Gold" },
    { name: "Michael Chen", referrals: 6, points: 600, tier: "Silver" },
    { name: "Emily Davis", referrals: 5, points: 500, tier: "Silver" }
  ]
};

// Social Media & Reputation data
const reputationData = {
  googleReviews: { total: 234, average: 4.8, thisMonth: 23 },
  facebookReviews: { total: 156, average: 4.7, thisMonth: 18 },
  instagramFollowers: 2340,
  postsThisMonth: 16,
  engagement: 6.8,
  sentimentScore: 92
};

// Lead tracking data
const leadData = [
  { source: "Google Ads", leads: 45, converted: 23, conversionRate: 51, cost: 890, roi: 240 },
  { source: "Facebook Ads", leads: 38, converted: 15, conversionRate: 39, cost: 650, roi: 180 },
  { source: "Website", leads: 67, converted: 34, conversionRate: 51, cost: 0, roi: "∞" },
  { source: "Referrals", leads: 23, converted: 19, conversionRate: 83, cost: 0, roi: "∞" },
  { source: "Instagram", leads: 12, converted: 5, conversionRate: 42, cost: 240, roi: 150 }
];

export default function MarketingAutomation() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const totalMetrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalAudience: campaigns.reduce((sum, c) => sum + c.audience, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
    avgOpenRate: campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length,
    avgConversionRate: campaigns.reduce((sum, c) => sum + (c.conversions / c.audience * 100), 0) / campaigns.length,
    predictedGrowth: 23.5
  };

  const CampaignDialog = ({ campaign, isNew = false }: { campaign?: any, isNew?: boolean }) => (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle>{isNew ? "Create New Campaign" : `Edit ${campaign?.name}`}</DialogTitle>
      </DialogHeader>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="campaignName">Campaign Name</Label>
            <Input id="campaignName" placeholder="Enter campaign name" defaultValue={campaign?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="campaignType">Campaign Type</Label>
            <Select defaultValue={campaign?.type}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="audience">Target Audience</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select audience segment" />
            </SelectTrigger>
            <SelectContent>
              {audienceSegments.map(segment => (
                <SelectItem key={segment.id} value={segment.id.toString()}>
                  {segment.name} ({segment.count} patients)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trigger">Trigger</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="signup">New patient signup</SelectItem>
              <SelectItem value="appointment">Appointment scheduled</SelectItem>
              <SelectItem value="treatment">Treatment completed</SelectItem>
              <SelectItem value="cleaning">Due for cleaning</SelectItem>
              <SelectItem value="birthday">Patient birthday</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="template">Message Template</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map(template => (
                <SelectItem key={template.id} value={template.id.toString()}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="active" defaultChecked={campaign?.status === 'active'} />
          <Label htmlFor="active">Active Campaign</Label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>{isNew ? "Create Campaign" : "Save Changes"}</Button>
        </div>
      </div>
    </DialogContent>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Marketing Automation</h1>
          <p className="text-muted-foreground">Smart campaigns, lead tracking & reputation management across all practices</p>
        </div>
        <div className="flex gap-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Brain className="h-4 w-4" />
                AI Suggest
              </Button>
            </DialogTrigger>
            <CampaignDialog isNew={true} />
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Campaign
              </Button>
            </DialogTrigger>
            <CampaignDialog isNew={true} />
          </Dialog>
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
            <Progress value={(totalMetrics.activeCampaigns / totalMetrics.totalCampaigns) * 100} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audience</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalAudience.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Unique patients reached</p>
            <Progress value={78} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+24.8% from last month</p>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMetrics.avgOpenRate)}%</div>
            <p className="text-xs text-muted-foreground">Industry avg: 22%</p>
            <Progress value={totalMetrics.avgOpenRate} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalMetrics.avgConversionRate)}%</div>
            <p className="text-xs text-muted-foreground">Above industry avg</p>
            <Progress value={totalMetrics.avgConversionRate} className="mt-2" />
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
            AI Marketing Suggestions
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
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Smart Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="referrals">Referrals & Loyalty</TabsTrigger>
          <TabsTrigger value="social">Social & Reputation</TabsTrigger>
          <TabsTrigger value="leads">Lead Tracking</TabsTrigger>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Campaign Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Campaign Performance Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaigns.slice(0, 4).map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        campaign.type === 'email' ? 'bg-blue-100 text-blue-600' :
                        campaign.type === 'sms' ? 'bg-green-100 text-green-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {campaign.type === 'email' && <Mail className="h-4 w-4" />}
                        {campaign.type === 'sms' && <MessageSquare className="h-4 w-4" />}
                        {campaign.type === 'whatsapp' && <Phone className="h-4 w-4" />}
                      </div>
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.trigger}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${campaign.revenue.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{campaign.openRate}% open</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Marketing Budget ROI */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Marketing ROI Forecast
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                  <h4 className="font-semibold text-blue-800">Google Ads</h4>
                  <p className="text-sm text-blue-700 mt-1">Suggested budget: $1,500/month for 30% more leads</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-blue-600">Expected ROI: 280%</span>
                    <Button size="sm" variant="outline">Optimize</Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                  <h4 className="font-semibold text-purple-800">Facebook/Instagram</h4>
                  <p className="text-sm text-purple-700 mt-1">Increase cosmetic service ads for better ROI</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-purple-600">Expected ROI: 220%</span>
                    <Button size="sm" variant="outline">Adjust</Button>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <h4 className="font-semibold text-green-800">Referral Program</h4>
                  <p className="text-sm text-green-700 mt-1">Increase referral rewards by 25% for 40% more referrals</p>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-green-600">Expected ROI: 450%</span>
                    <Button size="sm" variant="outline">Implement</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Smart Campaigns with AI Integration
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Brain className="h-4 w-4" />
                  AI Optimize All
                </Button>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Smart Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="p-4 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${
                          campaign.type === 'email' ? 'bg-blue-100 text-blue-600' :
                          campaign.type === 'sms' ? 'bg-green-100 text-green-600' :
                          'bg-purple-100 text-purple-600'
                        }`}>
                          {campaign.type === 'email' && <Mail className="h-4 w-4" />}
                          {campaign.type === 'sms' && <MessageSquare className="h-4 w-4" />}
                          {campaign.type === 'whatsapp' && <Phone className="h-4 w-4" />}
                        </div>
                        <div>
                          <h3 className="font-medium">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">{campaign.trigger}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                          {campaign.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <CampaignDialog campaign={campaign} />
                          </Dialog>
                          <Button size="sm" variant="outline">
                            {campaign.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-4 mb-3">
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.audience}</div>
                        <div className="text-xs text-muted-foreground">Audience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.openRate}%</div>
                        <div className="text-xs text-muted-foreground">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.clickRate}%</div>
                        <div className="text-xs text-muted-foreground">Click Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.conversions}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">${campaign.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                    </div>

                    {/* AI Suggestion */}
                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Brain className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-800">AI Suggestion</span>
                      </div>
                      <p className="text-sm text-blue-700">{campaign.aiSuggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Message Templates
              </CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {templates.map((template) => (
                  <Card key={template.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">
                          {template.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.subject}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm">{template.content}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            {template.variables.map((variable) => (
                              <Badge key={variable} variant="secondary" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audiences" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Audience Segments
              </CardTitle>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Segment
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
                        <div className="text-xs text-muted-foreground">Patients</div>
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

        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Referral Program Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{referralProgram.totalReferrals}</div>
                    <div className="text-sm text-muted-foreground">Total Referrals</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{referralProgram.activeMembers}</div>
                    <div className="text-sm text-muted-foreground">Active Members</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {referralProgram.topReferrers.map((referrer, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{referrer.name}</h4>
                          <p className="text-sm text-muted-foreground">{referrer.referrals} referrals</p>
                        </div>
                      </div>
                      <Badge variant={referrer.tier === 'Gold' ? 'default' : 'secondary'}>
                        {referrer.tier}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  Loyalty Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800">Points System</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    {referralProgram.pointsAwarded.toLocaleString()} points awarded this month
                  </p>
                  <p className="text-sm text-yellow-700">
                    {referralProgram.rewardsRedeemed} rewards redeemed
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-medium">Reward Tiers</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Bronze (0-300 pts)</span>
                      <span className="text-sm text-muted-foreground">5% discount</span>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Silver (301-600 pts)</span>
                      <span className="text-sm text-muted-foreground">10% discount</span>
                    </div>
                    <div className="flex justify-between p-2 rounded border">
                      <span className="text-sm">Gold (601+ pts)</span>
                      <span className="text-sm text-muted-foreground">15% discount</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Reputation Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border text-center">
                    <div className="text-lg font-bold">{reputationData.googleReviews.average}</div>
                    <div className="text-sm text-muted-foreground">Google Rating</div>
                    <div className="text-xs text-muted-foreground">{reputationData.googleReviews.total} reviews</div>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <div className="text-lg font-bold">{reputationData.sentimentScore}%</div>
                    <div className="text-sm text-muted-foreground">Sentiment Score</div>
                    <div className="text-xs text-muted-foreground">AI analyzed</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
                  <h4 className="font-semibold text-green-800">Auto-Review Requests</h4>
                  <p className="text-sm text-green-700 mt-1">
                    {reputationData.googleReviews.thisMonth} new reviews this month (+28% vs last month)
                  </p>
                  <Button size="sm" className="mt-2" variant="outline">Configure</Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  Social Media Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg border text-center">
                    <div className="text-lg font-bold">{reputationData.instagramFollowers.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Instagram Followers</div>
                  </div>
                  <div className="p-3 rounded-lg border text-center">
                    <div className="text-lg font-bold">{reputationData.engagement}%</div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                  <h4 className="font-semibold text-purple-800">Auto-Publishing</h4>
                  <p className="text-sm text-purple-700 mt-1">
                    {reputationData.postsThisMonth} posts published automatically with patient consent
                  </p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline">
                      <Camera className="h-4 w-4 mr-1" />
                      Before/After
                    </Button>
                    <Button size="sm" variant="outline">
                      <Heart className="h-4 w-4 mr-1" />
                      Testimonials
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Multi-Practice Lead Tracking & AI Conversion Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leadData.map((lead, index) => (
                  <div key={index} className="p-4 rounded-lg border hover:bg-muted/30">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Target className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{lead.source}</h4>
                          <p className="text-sm text-muted-foreground">
                            AI Conversion Probability: {lead.conversionRate}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={lead.conversionRate > 60 ? 'default' : lead.conversionRate > 40 ? 'outline' : 'secondary'}>
                          {lead.conversionRate > 60 ? 'High' : lead.conversionRate > 40 ? 'Medium' : 'Low'} Quality
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 text-sm">
                      <div className="text-center">
                        <div className="font-medium">{lead.leads}</div>
                        <div className="text-xs text-muted-foreground">Total Leads</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{lead.converted}</div>
                        <div className="text-xs text-muted-foreground">Converted</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{lead.conversionRate}%</div>
                        <div className="text-xs text-muted-foreground">Conv. Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">${lead.cost}</div>
                        <div className="text-xs text-muted-foreground">Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{lead.roi}</div>
                        <div className="text-xs text-muted-foreground">ROI</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Campaign Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => (
                    <div key={campaign.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{campaign.name}</span>
                        <span className="text-sm text-muted-foreground">{campaign.openRate}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all" 
                          style={{ width: `${campaign.openRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Marketing Performance ROI</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 5)
                    .map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.conversions} conversions
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${campaign.revenue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            ${Math.round((campaign.revenue / campaign.audience) * 100) / 100} per patient
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}