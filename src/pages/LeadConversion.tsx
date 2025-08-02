import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  MessageSquare,
  Target,
  Clock,
  DollarSign,
  Brain,
  AlertTriangle
} from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'website' | 'phone' | 'referral' | 'social' | 'ads';
  aiLeadScore: number;
  conversionProbability: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  serviceInterest: string[];
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  lastContact: string;
  nextAction: string;
}

export default function LeadConversion() {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Jennifer Walsh',
      email: 'jennifer@email.com',
      phone: '(555) 123-4567',
      source: 'website',
      aiLeadScore: 92,
      conversionProbability: 87,
      urgencyLevel: 'high',
      serviceInterest: ['Invisalign', 'Teeth Whitening'],
      status: 'new',
      lastContact: 'Never',
      nextAction: 'Call within 30 minutes'
    },
    {
      id: '2',
      name: 'Robert Chen',
      email: 'robert.chen@email.com', 
      phone: '(555) 987-6543',
      source: 'referral',
      aiLeadScore: 78,
      conversionProbability: 71,
      urgencyLevel: 'medium',
      serviceInterest: ['Root Canal', 'Crown'],
      status: 'contacted',
      lastContact: '2 hours ago',
      nextAction: 'Schedule consultation'
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-4xl font-bold gradient-text text-center">Lead Conversion AI</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <p className="text-2xl font-bold">247</p>
            <p className="text-sm text-muted-foreground">Total Leads</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">23%</p>
            <p className="text-sm text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <p className="text-2xl font-bold">$1,847</p>
            <p className="text-sm text-muted-foreground">Avg Deal Value</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-orange-500" />
            <p className="text-2xl font-bold">4.2h</p>
            <p className="text-sm text-muted-foreground">Avg Response Time</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              AI-Scored Leads
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockLeads.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50" onClick={() => setSelectedLead(lead)}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{lead.name}</h4>
                  <Badge className={lead.urgencyLevel === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                    {lead.urgencyLevel} priority
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Lead Score</span>
                    <span className="font-medium">{lead.aiLeadScore}/100</span>
                  </div>
                  <Progress value={lead.aiLeadScore} className="h-2" />
                  <div className="flex justify-between text-sm">
                    <span>Conversion Probability</span>
                    <span className="font-medium">{lead.conversionProbability}%</span>
                  </div>
                  <Progress value={lead.conversionProbability} className="h-2" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="outline">{lead.source}</Badge>
                  {lead.serviceInterest.map((service, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">{service}</Badge>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm"><Phone className="w-3 h-3 mr-1" />Call</Button>
                  <Button size="sm" variant="outline"><Mail className="w-3 h-3 mr-1" />Email</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedLead && (
          <Card>
            <CardHeader>
              <CardTitle>Lead Details & AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">{selectedLead.name}</h4>
                <p className="text-sm text-muted-foreground">{selectedLead.email}</p>
                <p className="text-sm text-muted-foreground">{selectedLead.phone}</p>
              </div>
              
              <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-800">AI Recommendation</span>
                </div>
                <p className="text-sm text-blue-700">{selectedLead.nextAction}</p>
              </div>

              <div className="space-y-3">
                <Button className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  Start Call Sequence
                </Button>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  Send Personalized Email
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}