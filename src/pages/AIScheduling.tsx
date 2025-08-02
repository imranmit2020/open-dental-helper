import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  Monitor,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Bot,
  Phone,
  Video
} from "lucide-react";
import { AISchedulingService } from "@/services/AISchedulingService";

export default function AIScheduling() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedChair, setSelectedChair] = useState<string>('all');
  const [cancellationPredictions, setCancellationPredictions] = useState<any[]>([]);
  const [chairUtilization, setChairUtilization] = useState<any[]>([]);

  useEffect(() => {
    loadAIData();
  }, [currentDate]);

  const loadAIData = async () => {
    try {
      const predictions = await AISchedulingService.predictCancellations(currentDate);
      const utilization = await AISchedulingService.analyzeChairUtilization(currentDate);
      setCancellationPredictions(predictions);
      setChairUtilization(utilization);
    } catch (error) {
      console.error('Failed to load AI data:', error);
    }
  };

  const chairs = [
    { id: '1', name: 'Chair 1', status: 'occupied', patient: 'Sarah Johnson', time: '9:00 AM', treatment: 'Cleaning' },
    { id: '2', name: 'Chair 2', status: 'predicted-cancel', patient: 'Mike Davis', time: '10:30 AM', treatment: 'Root Canal' },
    { id: '3', name: 'Chair 3', status: 'free', patient: null, time: '11:00 AM', treatment: null },
    { id: '4', name: 'Chair 4', status: 'occupied', patient: 'Emily Chen', time: '2:00 PM', treatment: 'Crown Prep' },
    { id: '5', name: 'Chair 5', status: 'free', patient: null, time: '3:30 PM', treatment: null },
  ];

  const aiSuggestions = [
    {
      id: 1,
      type: 'reschedule',
      message: 'Move Patient A to 10:30 AM to reduce gap',
      confidence: 0.89,
      impact: 'Improves efficiency by 15%'
    },
    {
      id: 2,
      type: 'teledentistry',
      message: 'Offer tele-visit to Sarah who may cancel',
      confidence: 0.75,
      impact: 'Retains appointment revenue'
    },
    {
      id: 3,
      type: 'fill-in',
      message: 'Contact waitlist patients for 11:00 AM slot',
      confidence: 0.92,
      impact: 'Additional $150 revenue'
    }
  ];

  const getChairStatusColor = (status: string) => {
    switch (status) {
      case 'occupied': return 'bg-success/20 border-success text-success';
      case 'predicted-cancel': return 'bg-warning/20 border-warning text-warning';
      case 'free': return 'bg-muted/20 border-muted text-muted-foreground';
      default: return 'bg-muted/20 border-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight gradient-text">AI-Driven Scheduling</h1>
            <p className="text-muted-foreground">Smart chair management with predictive analytics</p>
          </div>
        </div>
      </div>

      {/* Calendar Strip */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-semibold min-w-[300px] text-center">
                {formatDate(currentDate)}
              </h2>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant={view === 'day' ? "default" : "outline"} size="sm" onClick={() => setView('day')}>
                  Daily
                </Button>
                <Button variant={view === 'week' ? "default" : "outline"} size="sm" onClick={() => setView('week')}>
                  Weekly
                </Button>
              </div>
              
              <Select value={selectedChair} onValueChange={setSelectedChair}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chairs</SelectItem>
                  <SelectItem value="1">Chair 1</SelectItem>
                  <SelectItem value="2">Chair 2</SelectItem>
                  <SelectItem value="3">Chair 3</SelectItem>
                  <SelectItem value="4">Chair 4</SelectItem>
                  <SelectItem value="5">Chair 5</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filter Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Dentist</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All dentists" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Dentists</SelectItem>
                    <SelectItem value="dr-smith">Dr. Smith</SelectItem>
                    <SelectItem value="dr-johnson">Dr. Johnson</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Treatment Type</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="All treatments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Treatments</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="filling">Filling</SelectItem>
                    <SelectItem value="crown">Crown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Chair Utilization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Chair Utilization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {chairs.map((chair) => (
                <div key={chair.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{chair.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${Math.random() * 40 + 60}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {Math.floor(Math.random() * 40 + 60)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Smart Chair Map */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Smart Chair Map
              </CardTitle>
              <CardDescription>
                Visual chair status with AI predictions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-4">
                {chairs.map((chair) => (
                  <div
                    key={chair.id}
                    className={`p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${getChairStatusColor(chair.status)}`}
                  >
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center w-8 h-8 mx-auto bg-white/20 rounded-lg">
                        <Monitor className="h-4 w-4" />
                      </div>
                      <h3 className="font-medium">{chair.name}</h3>
                      <div className="text-xs">
                        {chair.patient ? (
                          <>
                            <div className="font-medium">{chair.patient}</div>
                            <div>{chair.time}</div>
                            <div>{chair.treatment}</div>
                          </>
                        ) : (
                          <div>Available</div>
                        )}
                      </div>
                      {chair.status === 'predicted-cancel' && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          May Cancel
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Suggestions Carousel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
              <CardDescription>
                Smart recommendations to optimize your schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4 bg-gradient-card rounded-xl border border-border/30 hover-lift transition-all duration-300">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {suggestion.type === 'reschedule' && <Calendar className="h-4 w-4 text-primary" />}
                          {suggestion.type === 'teledentistry' && <Video className="h-4 w-4 text-secondary" />}
                          {suggestion.type === 'fill-in' && <Users className="h-4 w-4 text-success" />}
                          <span className="text-sm font-medium text-foreground">{suggestion.message}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(suggestion.confidence * 100)}%</span>
                          <span>{suggestion.impact}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {suggestion.type === 'teledentistry' && (
                          <Button variant="outline" size="sm">
                            <Phone className="h-3 w-3 mr-1" />
                            Call
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          Apply
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}