import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Edit
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Mock data for marketing automation
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
    trigger: "New patient signup"
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
    trigger: "6 months since last visit"
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
    trigger: "3 days after treatment"
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
    trigger: "Patient birthday month"
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
  { id: 1, name: "New Patients", count: 245, criteria: "Registered in last 30 days" },
  { id: 2, name: "Due for Cleaning", count: 890, criteria: "Last cleaning > 6 months ago" },
  { id: 3, name: "High Value Patients", count: 156, criteria: "Lifetime value > $5,000" },
  { id: 4, name: "Missed Appointments", count: 78, criteria: "No-show in last 90 days" },
  { id: 5, name: "Treatment Complete", count: 234, criteria: "Completed treatment in last 7 days" }
];

export default function MarketingAutomation() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const totalMetrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalAudience: campaigns.reduce((sum, c) => sum + c.audience, 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0)
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
          <h1 className="text-3xl font-bold text-foreground">Marketing Automation</h1>
          <p className="text-muted-foreground">Automated campaigns and patient communication</p>
        </div>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">{totalMetrics.activeCampaigns} active</p>
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
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaign Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Open Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="audiences">Audiences</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Active Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {campaign.type === 'email' ? (
                          <Mail className="h-4 w-4 text-primary" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{campaign.name}</h3>
                        <p className="text-sm text-muted-foreground">{campaign.trigger}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.audience}</div>
                        <div className="text-xs text-muted-foreground">Audience</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.openRate}%</div>
                        <div className="text-xs text-muted-foreground">Open Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">{campaign.conversions}</div>
                        <div className="text-xs text-muted-foreground">Conversions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium">${campaign.revenue.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                      </div>
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                      <div className="flex gap-2">
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
              <div className="space-y-4">
                {audienceSegments.map((segment) => (
                  <div key={segment.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <h3 className="font-medium">{segment.name}</h3>
                      <p className="text-sm text-muted-foreground">{segment.criteria}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold">{segment.count}</div>
                        <div className="text-xs text-muted-foreground">Patients</div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
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
                  Campaign Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
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
                <CardTitle>ROI by Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns
                    .sort((a, b) => b.revenue - a.revenue)
                    .map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{campaign.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {campaign.conversions} conversions
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${campaign.revenue.toLocaleString()}</div>
                          <div className="text-sm text-muted-foreground">
                            {Math.round((campaign.revenue / campaign.audience) * 100) / 100} per patient
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