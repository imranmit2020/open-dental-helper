import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Shield, BarChart3 } from "lucide-react";
import { BiometricClockIn } from "@/components/BiometricClockIn";
import { TimeTrackingDashboard } from "@/components/TimeTrackingDashboard";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/contexts/TenantContext";

function setSEO() {
  document.title = "Employee Time Tracking | DentalAI";
  const desc = "Advanced biometric time tracking with location verification and AI insights";
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "description");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", desc);

  let canonical = document.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.setAttribute("rel", "canonical");
    document.head.appendChild(canonical);
  }
  canonical.setAttribute("href", window.location.origin + "/employee-time-tracking");
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
  employee_id?: string;
}

export default function EmployeeTimeTracking() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const { currentTenant } = useTenant();

  const employeeParam = searchParams.get("employee");

  useEffect(() => {
    setSEO();
  }, []);

  useEffect(() => {
    if (currentTenant) {
      fetchEmployees();
    }
  }, [currentTenant]);

  useEffect(() => {
    if (employeeParam && employees.length > 0) {
      setSelectedEmployee(employeeParam);
    }
  }, [employeeParam, employees]);

  const fetchEmployees = async () => {
    if (!currentTenant) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, role, employee_id')
        .eq('tenant_id', currentTenant.id)
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    if (employeeId) {
      setSearchParams({ employee: employeeId });
    } else {
      setSearchParams({});
    }
  };

  const selectedEmployeeData = employees.find(emp => emp.id === selectedEmployee);

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Employee Time Tracking
          </h1>
          <p className="text-muted-foreground">
            Advanced biometric time tracking with location verification and AI insights
          </p>
        </div>
      </header>
      <Separator />

      {/* Employee Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Employee
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedEmployee} onValueChange={handleEmployeeSelect}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Choose an employee..." />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.first_name} {employee.last_name} 
                  {employee.employee_id && ` (${employee.employee_id})`}
                  <span className="ml-2 text-muted-foreground">- {employee.role}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEmployee && selectedEmployeeData && (
        <Tabs defaultValue="clock" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clock" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Clock In/Out
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clock" className="space-y-6">
            <div className="max-w-2xl mx-auto">
              <BiometricClockIn
                employeeId={selectedEmployee}
                employeeName={`${selectedEmployeeData.first_name} ${selectedEmployeeData.last_name}`}
                onSuccess={() => {
                  // Refresh data or show success message
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <TimeTrackingDashboard employeeId={selectedEmployee} />
          </TabsContent>
        </Tabs>
      )}

      {!selectedEmployee && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Select an Employee</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Choose an employee from the dropdown above to access their time tracking features,
              including biometric clock-in/out and performance insights.
            </p>
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading employees...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </main>
  );
}