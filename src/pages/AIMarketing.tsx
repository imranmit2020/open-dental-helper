import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import { 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  Mail,
  MessageSquare,
  Calendar,
  Star,
  Phone,
  Smartphone,
  BarChart3,
  Zap
} from "lucide-react";

const AIMarketing = () => {
  const { t } = useLanguage();
  const campaignStats = [
    {
      title: "Active Campaigns",
      value: "12",
      change: "+3",
      changeType: "positive" as const,
      icon: Target,
    },
    {
      title: "Email Open Rate",
      value: "68%",
      change: "+12%",
      changeType: "positive" as const,
      icon: Mail,
    },
    {
      title: "New Leads",
      value: "47",
      change: "+18",
      changeType: "positive" as const,
      icon: Users,
    },
    {
      title: "Conversion Rate",
      value: "24%",
      change: "+5%",
      changeType: "positive" as const,
      icon: TrendingUp,
    },
  ];

  const activeCampaigns = [
    {
      id: 1,
      name: "Teeth Whitening Special",
      type: "Promotional",
      status: "active",
      reach: 2847,
      engagement: 68,
      conversions: 23,
      budget: "$500",
      spent: "$387"
    },
    {
      id: 2,
      name: "Preventive Care Reminder",
      type: "Educational",
      status: "scheduled",
      reach: 1523,
      engagement: 45,
      conversions: 12,
      budget: "$300",
      spent: "$0"
    },
    {
      id: 3,
      name: "Emergency Dental Care",
      type: "Awareness",
      status: "active",
      reach: 892,
      engagement: 72,
      conversions: 8,
      budget: "$200",
      spent: "$156"
    }
  ];

  const aiInsights = [
    {
      id: 1,
      title: "Optimal Posting Time",
      insight: "Best engagement occurs between 2-4 PM on weekdays",
      action: "Schedule posts accordingly",
      impact: "high",
      type: "timing"
    },
    {
      id: 2,
      title: "Content Recommendation",
      insight: "Educational content about oral hygiene performs 45% better",
      action: "Increase educational content ratio",
      impact: "medium",
      type: "content"
    },
    {
      id: 3,
      title: "Target Audience Expansion",
      insight: "Similar audiences in nearby zip codes show high conversion potential",
      action: "Expand targeting radius",
      impact: "high",
      type: "targeting"
    }
  ];

  const leadSources = [
    { source: "Google Ads", leads: 23, percentage: 35 },
    { source: "Facebook/Instagram", leads: 18, percentage: 28 },
    { source: "Email Campaigns", leads: 12, percentage: 18 },
    { source: "Referrals", leads: 8, percentage: 12 },
    { source: "Direct Website", leads: 5, percentage: 7 }
  ];

  const automatedActions = [
    {
      id: 1,
      action: "Follow-up email sent",
      target: "New consultation leads",
      time: "2 hours ago",
      success: true
    },
    {
      id: 2,
      action: "Appointment reminder",
      target: "Tomorrow's patients",
      time: "1 day ago",
      success: true
    },
    {
      id: 3,
      action: "Review request sent",
      target: "Recent treatment completions",
      time: "2 days ago",
      success: true
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('marketing.title', 'AI Marketing Hub')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t('marketing.description', 'Intelligent marketing automation and campaign optimization')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Brain className="w-4 h-4 mr-2" />
              {t('marketing.aiSuggestions', 'AI Suggestions')}
            </Button>
            <Button>
              <Zap className="w-4 h-4 mr-2" />
              {t('marketing.createCampaign', 'Create Campaign')}
            </Button>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {campaignStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={`${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </span>
                  {" "}from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Campaigns */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {t('marketing.activeCampaigns', 'Active Campaigns')}
                </CardTitle>
                <CardDescription>
                  {t('marketing.campaignsDescription', 'Monitor and manage your marketing campaigns')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.type}</p>
                      </div>
                      <Badge variant={campaign.status === "active" ? "default" : "secondary"}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Reach</p>
                        <p className="font-medium">{campaign.reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Engagement</p>
                        <p className="font-medium">{campaign.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Conversions</p>
                        <p className="font-medium">{campaign.conversions}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Budget</p>
                        <p className="font-medium">{campaign.spent} / {campaign.budget}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  {t('marketing.aiInsights', 'AI Marketing Insights')}
                </CardTitle>
                <CardDescription>
                  {t('marketing.insightsDescription', 'Data-driven recommendations to optimize your campaigns')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {aiInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge
                        variant={insight.impact === "high" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{insight.insight}</p>
                    <p className="text-sm font-medium text-primary">{insight.action}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Lead Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Lead Sources
                </CardTitle>
                <CardDescription>
                  This month's lead generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {leadSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{source.source}</span>
                      <span className="text-muted-foreground">{source.leads} leads</span>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Automated Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Automated Actions
                </CardTitle>
                <CardDescription>
                  Recent AI-triggered activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {automatedActions.map((action) => (
                  <div
                    key={action.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h5 className="font-medium text-sm">{action.action}</h5>
                      <Badge variant={action.success ? "default" : "destructive"} className="text-xs">
                        {action.success ? "Success" : "Failed"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{action.target}</p>
                    <p className="text-xs text-muted-foreground mt-1">{action.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{t('marketing.tools', 'Marketing Tools')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  {t('marketing.emailCampaign', 'Email Campaign')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {t('marketing.socialPost', 'Social Media Post')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('marketing.smsCampaign', 'SMS Campaign')}
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="w-4 h-4 mr-2" />
                  {t('marketing.reviewManager', 'Review Manager')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIMarketing;