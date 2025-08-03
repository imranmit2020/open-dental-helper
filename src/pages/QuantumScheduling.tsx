import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin, Cpu, Zap, TrendingUp, AlertCircle, CheckCircle, User, Settings } from 'lucide-react';
import { toast } from 'sonner';

const QuantumScheduling = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [quantumStates, setQuantumStates] = useState(2048);

  const globalMetrics = [
    {
      title: "Global Efficiency",
      value: "94.7%",
      change: "+23.4%",
      icon: TrendingUp,
      description: "Cross-clinic optimization efficiency"
    },
    {
      title: "Quantum States",
      value: quantumStates.toLocaleString(),
      change: "+156 today",
      icon: Cpu,
      description: "Active scheduling quantum superpositions"
    },
    {
      title: "Patient Satisfaction",
      value: "98.2%",
      change: "+4.8%",
      icon: Users,
      description: "AI-predicted satisfaction scores"
    },
    {
      title: "Wait Time Reduction",
      value: "67%",
      change: "-12.3min avg",
      icon: Clock,
      description: "Quantum-optimized wait times"
    }
  ];

  const clinicLocations = [
    {
      id: 1,
      name: "Manhattan Dental Center",
      location: "New York, NY",
      efficiency: 96.4,
      patients: 247,
      status: "optimal",
      waitTime: "2.1min",
      quantumLoad: 87
    },
    {
      id: 2,
      name: "Beverly Hills Smiles",
      location: "Los Angeles, CA",
      efficiency: 94.8,
      patients: 198,
      status: "excellent",
      waitTime: "1.8min",
      quantumLoad: 72
    },
    {
      id: 3,
      name: "Chicago Family Dental",
      location: "Chicago, IL",
      efficiency: 92.1,
      patients: 156,
      status: "good",
      waitTime: "3.4min",
      quantumLoad: 91
    },
    {
      id: 4,
      name: "Miami Coastal Dental",
      location: "Miami, FL",
      efficiency: 89.7,
      patients: 134,
      status: "optimizing",
      waitTime: "4.2min",
      quantumLoad: 95
    }
  ];

  const optimizationFactors = [
    {
      factor: "Cross-Clinic Resource Sharing",
      impact: "High",
      status: "Active",
      description: "Equipment and staff sharing between locations"
    },
    {
      factor: "Predictive Emergency Slots",
      impact: "Medium",
      status: "Active", 
      description: "AI-predicted emergency appointment needs"
    },
    {
      factor: "Patient Flow Optimization",
      impact: "High",
      status: "Active",
      description: "Quantum routing for minimal wait times"
    },
    {
      factor: "Dynamic Pricing Optimization",
      impact: "Medium",
      status: "Processing",
      description: "Real-time pricing based on demand patterns"
    }
  ];

  const runQuantumOptimization = async () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    toast.info("Initiating quantum scheduling optimization...");

    // Simulate quantum processing with progress updates
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsOptimizing(false);
          setQuantumStates(prev => prev + Math.floor(Math.random() * 200) + 50);
          toast.success("Quantum optimization complete! Efficiency increased by 12.4%");
          return 100;
        }
        return prev + Math.random() * 15 + 5;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-800';
      case 'excellent': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'optimizing': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'excellent':
        return <CheckCircle className="w-4 h-4" />;
      case 'good':
        return <AlertCircle className="w-4 h-4" />;
      case 'optimizing':
        return <Settings className="w-4 h-4 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-10 h-10 text-primary animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Quantum Scheduling Optimization
            </h1>
            <Calendar className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AI-orchestrated clinic optimization using quantum algorithms for global treatment 
            scheduling and patient care coordination.
          </p>
        </div>

        {/* Global Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {globalMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className="w-8 h-8 text-primary" />
                    <Badge variant="outline" className="text-xs">
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.title}</div>
                    <div className="text-xs text-green-600">↗ {metric.change}</div>
                    <div className="text-xs text-muted-foreground">{metric.description}</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quantum Optimization Control */}
        <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-primary" />
              Global Quantum Optimization Control
            </CardTitle>
            <CardDescription>
              Run quantum algorithms to optimize schedules across all clinic locations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Optimization Scope</label>
                <Select defaultValue="global">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Clinic</SelectItem>
                    <SelectItem value="regional">Regional Network</SelectItem>
                    <SelectItem value="global">Global Optimization</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Quantum Depth</label>
                <Select defaultValue="deep">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shallow">Shallow (Fast)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="deep">Deep (Maximum)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Horizon</label>
                <Select defaultValue="week">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">24 Hours</SelectItem>
                    <SelectItem value="week">1 Week</SelectItem>
                    <SelectItem value="month">1 Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isOptimizing && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Quantum Processing Progress</span>
                  <span>{Math.round(optimizationProgress)}%</span>
                </div>
                <Progress value={optimizationProgress} className="h-3" />
                <div className="text-sm text-muted-foreground">
                  Processing {quantumStates.toLocaleString()} quantum states...
                </div>
              </div>
            )}

            <Button 
              onClick={runQuantumOptimization}
              disabled={isOptimizing}
              className="w-full bg-gradient-to-r from-primary to-primary/80"
              size="lg"
            >
              {isOptimizing ? (
                <>
                  <Cpu className="w-5 h-5 mr-2 animate-spin" />
                  Processing Quantum Optimization...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2" />
                  Run Global Quantum Optimization
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Clinic Network Overview */}
        <Tabs defaultValue="clinics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="clinics">Clinic Network</TabsTrigger>
            <TabsTrigger value="optimization">Optimization Factors</TabsTrigger>
          </TabsList>

          <TabsContent value="clinics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Global Clinic Network Status
                </CardTitle>
                <CardDescription>
                  Real-time performance across all clinic locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clinicLocations.map((clinic) => (
                    <Card key={clinic.id} className="p-4 bg-gradient-to-r from-muted/30 to-muted/10">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{clinic.name}</h3>
                            <Badge className={getStatusColor(clinic.status)}>
                              {getStatusIcon(clinic.status)}
                              <span className="ml-1">{clinic.status}</span>
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {clinic.location}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Efficiency</span>
                            <span className="font-medium">{clinic.efficiency}%</span>
                          </div>
                          <Progress value={clinic.efficiency} className="h-2" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Quantum Load</span>
                            <span className="font-medium">{clinic.quantumLoad}%</span>
                          </div>
                          <Progress value={clinic.quantumLoad} className="h-2" />
                        </div>
                        
                        <div className="text-right space-y-1">
                          <div className="text-sm">
                            <span className="text-muted-foreground">Patients:</span>
                            <span className="font-medium ml-1">{clinic.patients}</span>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Wait:</span>
                            <span className="font-medium ml-1">{clinic.waitTime}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-primary" />
                  Active Optimization Factors
                </CardTitle>
                <CardDescription>
                  Current quantum optimization parameters and their impact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {optimizationFactors.map((factor, index) => (
                    <Card key={index} className="p-4 bg-gradient-to-r from-muted/20 to-transparent">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="font-semibold">{factor.factor}</h3>
                          <p className="text-sm text-muted-foreground">{factor.description}</p>
                        </div>
                        <div className="text-right space-y-1">
                          <Badge variant={factor.impact === 'High' ? 'default' : 'secondary'}>
                            {factor.impact} Impact
                          </Badge>
                          <div className="text-sm">
                            <Badge 
                              variant={factor.status === 'Active' ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {factor.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuantumScheduling;