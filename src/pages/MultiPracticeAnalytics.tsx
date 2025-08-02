import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Building, TrendingUp, Users, Calendar, DollarSign, BarChart3, Activity } from "lucide-react";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Mock data for multipractice analytics
const practices = [
  { id: 1, name: "Downtown Dental", location: "Downtown", patients: 1250, revenue: 125000, appointments: 890 },
  { id: 2, name: "Westside Dental", location: "Westside", patients: 980, revenue: 98000, appointments: 720 },
  { id: 3, name: "Northside Dental", location: "Northside", patients: 1100, revenue: 110000, appointments: 800 },
  { id: 4, name: "Southside Dental", location: "Southside", patients: 850, revenue: 85000, appointments: 650 }
];

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

export default function MultiPracticeAnalytics() {
  const [selectedPractice, setSelectedPractice] = useState("all");
  const [timeRange, setTimeRange] = useState("6months");

  const totalMetrics = {
    totalRevenue: practices.reduce((sum, p) => sum + p.revenue, 0),
    totalPatients: practices.reduce((sum, p) => sum + p.patients, 0),
    totalAppointments: practices.reduce((sum, p) => sum + p.appointments, 0),
    avgRevenue: practices.reduce((sum, p) => sum + p.revenue, 0) / practices.length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Multi-Practice Analytics</h1>
          <p className="text-muted-foreground">Comprehensive insights across all practice locations</p>
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
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalPatients.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+8.3% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMetrics.totalAppointments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+6.7% from last period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Practice Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${Math.round(totalMetrics.avgRevenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+9.2% from last period</p>
          </CardContent>
        </Card>
      </div>

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
            {practices.map((practice) => (
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

      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="patients">Patient Flow</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Analysis</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue by Practice (6 Months)</CardTitle>
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
        </TabsContent>

        <TabsContent value="patients" className="space-y-6">
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

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Efficiency Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {practices.map((practice) => (
                  <div key={practice.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <h4 className="font-medium">{practice.name}</h4>
                      <p className="text-sm text-muted-foreground">Patients per day: {Math.round(practice.appointments / 30)}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">${Math.round(practice.revenue / practice.patients)}</div>
                      <div className="text-sm text-muted-foreground">Revenue per patient</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Performance Rankings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {practices
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((practice, index) => (
                    <div key={practice.id} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{practice.name}</h4>
                        <p className="text-sm text-muted-foreground">${practice.revenue.toLocaleString()} revenue</p>
                      </div>
                      <Badge variant={index === 0 ? "default" : "secondary"}>
                        {index === 0 ? "Top" : `#${index + 1}`}
                      </Badge>
                    </div>
                  ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}