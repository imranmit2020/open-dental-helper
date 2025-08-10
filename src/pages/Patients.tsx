import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLanguage } from "@/contexts/LanguageContext";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import NewPatientForm from "@/components/NewPatientForm";
import { useAuditLog } from "@/hooks/useAuditLog";
import { useToast } from "@/hooks/use-toast";
import { useTenant } from "@/contexts/TenantContext";
import { 
  Search, 
  Plus, 
  Filter,
  Phone,
  Mail,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from "lucide-react";

export default function Patients() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { logPatientView } = useAuditLog();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    riskLevel: "",
    ageRange: "",
    insurance: ""
  });
  const [stats, setStats] = useState({
    totalPatients: 0,
    activeTreatments: 0,
    overdueCheckups: 0,
    appointmentsThisMonth: 0
  });

  const { toast } = useToast();
  const { currentTenant } = useTenant();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      // Add a small delay to ensure auth context is established
      const timer = setTimeout(() => {
        fetchPatients();
        fetchStats();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching patients for user:', user?.id);
      
      // Ensure we have a valid session before making the query
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return;
      }

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Fetched patients:', data?.length || 0);
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total patients count
      const { count: totalCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get active treatments count
      const { count: treatmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      // Get overdue checkups (patients with no recent appointments)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { count: overdueCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .lt('last_visit', sixMonthsAgo.toISOString().split('T')[0]);

      // Get appointments this month
      const thisMonth = new Date();
      const firstDay = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
      const lastDay = new Date(thisMonth.getFullYear(), thisMonth.getMonth() + 1, 0);

      const { count: monthlyCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', firstDay.toISOString())
        .lte('appointment_date', lastDay.toISOString())
        .eq('status', 'completed');

      setStats({
        totalPatients: totalCount || 0,
        activeTreatments: treatmentCount || 0,
        overdueCheckups: overdueCount || 0,
        appointmentsThisMonth: monthlyCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getAge = (dateOfBirth: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getPatientStatus = (patient: any) => {
    if (!patient.last_visit) return 'new';
    
    const lastVisit = new Date(patient.last_visit);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (lastVisit < sixMonthsAgo) return 'overdue';
    if (lastVisit < threeMonthsAgo) return 'due';
    return 'active';
  };

  const handlePatientAdded = (newPatient: any) => {
    setPatients(prev => [...prev, newPatient]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success border-success/20";
      case "treatment": return "bg-warning/10 text-warning border-warning/20";
      case "overdue": return "bg-destructive/10 text-destructive border-destructive/20";
      default: return "bg-muted/10 text-muted-foreground border-muted/20";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "text-success";
      case "medium": return "text-warning";
      case "high": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      riskLevel: "",
      ageRange: "",
      insurance: ""
    });
    setSearchTerm("");
  };

  const filteredPatients = patients.filter(patient => {
    // Text search filter
    const matchesSearch = !searchTerm || 
      `${patient.first_name} ${patient.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone || '').includes(searchTerm);

    // Status filter
    const matchesStatus = !filters.status || getPatientStatus(patient) === filters.status;

    // Risk level filter
    const matchesRisk = !filters.riskLevel || patient.risk_level === filters.riskLevel;

    // Age range filter
    const matchesAge = !filters.ageRange || (() => {
      const age = getAge(patient.date_of_birth);
      if (age === 'N/A') return false;
      const ageNum = parseInt(age.toString());
      switch (filters.ageRange) {
        case 'under18': return ageNum < 18;
        case '18-30': return ageNum >= 18 && ageNum <= 30;
        case '31-50': return ageNum >= 31 && ageNum <= 50;
        case '51-70': return ageNum >= 51 && ageNum <= 70;
        case 'over70': return ageNum > 70;
        default: return true;
      }
    })();

    // Insurance filter
    const matchesInsurance = !filters.insurance || (() => {
      const hasInsurance = patient.insurance_info?.provider;
      return filters.insurance === 'with' ? hasInsurance : !hasInsurance;
    })();

    return matchesSearch && matchesStatus && matchesRisk && matchesAge && matchesInsurance;
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredPatients.length / pageSize) || 1;
  const paginatedPatients = filteredPatients.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, patients.length]);

  // Export current filtered patients to CSV
  const handleExport = () => {
    try {
      const rows = filteredPatients.map((p) => ({
        first_name: p.first_name ?? "",
        last_name: p.last_name ?? "",
        email: p.email ?? "",
        phone: p.phone ?? "",
        date_of_birth: p.date_of_birth ?? "",
        gender: p.gender ?? "",
        address: p.address ?? "",
        insurance_provider: p.insurance_info?.provider ?? "",
        risk_level: p.risk_level ?? "",
        last_visit: p.last_visit ?? "",
      }));
      const headers = Object.keys(rows[0] || {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
      });
      const csvEscape = (val: any) => {
        const s = String(val ?? "");
        if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
        return s;
      };
      const csv = [
        headers.join(","),
        ...rows.map((r) => headers.map((h) => csvEscape((r as any)[h])).join(",")),
      ].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "patients_export.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Export complete", description: `Exported ${rows.length} patients.` });
    } catch (e) {
      console.error(e);
      toast({ title: "Export failed", description: "Could not export patients.", variant: "destructive" });
    }
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: any) => {
    try {
      const file: File | undefined = e.target.files?.[0];
      if (!file) return;
      if (!currentTenant?.id) {
        toast({ title: "No clinic selected", description: "Please select a clinic before importing.", variant: "destructive" });
        return;
      }
      const text = await file.text();
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) {
        toast({ title: "Empty file", description: "No data rows found.", variant: "destructive" });
        return;
      }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const idx = (name: string) => headers.indexOf(name);
      const get = (arr: string[], key: string) => {
        const i = idx(key);
        return i >= 0 ? arr[i]?.trim() : "";
      };
      const toISODate = (val: string) => {
        if (!val) return null;
        // accept YYYY-MM-DD or MM/DD/YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        const m = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (m) {
          const mm = m[1].padStart(2, '0');
          const dd = m[2].padStart(2, '0');
          const yyyy = m[3].length === 2 ? '20' + m[3] : m[3];
          return `${yyyy}-${mm}-${dd}`;
        }
        return val; // fallback
      };

      const rows = lines.slice(1).map((line) => line.split(","));
      const payload = rows
        .filter((cols) => cols.some((c) => c && c.trim()))
        .map((cols) => ({
          first_name: get(cols, "first_name") || get(cols, "first name"),
          last_name: get(cols, "last_name") || get(cols, "last name"),
          email: get(cols, "email") || null,
          phone: get(cols, "phone") || null,
          date_of_birth: toISODate(get(cols, "date_of_birth") || get(cols, "dob")) as any,
          gender: get(cols, "gender") || null,
          address: get(cols, "address") || null,
          risk_level: (get(cols, "risk_level") || 'low') as any,
          insurance_info: (() => {
            const provider = get(cols, "insurance_provider") || get(cols, "insurance");
            return provider ? { provider } : null;
          })(),
          tenant_id: currentTenant.id,
        }));

      if (payload.length === 0) {
        toast({ title: "Nothing to import", description: "No valid rows detected.", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.from('patients').insert(payload).select();
      if (error) throw error;

      toast({ title: "Import complete", description: `Imported ${data?.length ?? payload.length} patients.` });
      await fetchPatients();
    } catch (err: any) {
      console.error('Import error:', err);
      toast({ title: "Import failed", description: err?.message || "Could not import patients.", variant: "destructive" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 p-6 space-y-8">
      {/* Animated Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Patient Management
          </h1>
          <p className="text-muted-foreground text-lg">Manage your patient records with AI-powered insights</p>
        </div>
        <NewPatientForm onPatientAdded={handlePatientAdded} />
      </div>

      {/* Enhanced Search Card */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl animate-scale-in">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
               <Input
                 placeholder="Search patients by name, email, or phone..."
                 value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20 rounded-xl"
              />
            </div>
            <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-12 px-6 hover:bg-primary/5 hover:border-primary/30 transition-all duration-300 rounded-xl">
                  <Filter className="h-5 w-5 mr-2" />
                  Advanced Filters
                  {(filters.status || filters.riskLevel || filters.ageRange || filters.insurance) && (
                    <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {Object.values(filters).filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-6" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Advanced Filters</h4>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Status</label>
                      <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="due">Due for Visit</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="new">New Patient</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Risk Level</label>
                      <Select value={filters.riskLevel} onValueChange={(value) => setFilters(prev => ({ ...prev, riskLevel: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Age Range</label>
                      <Select value={filters.ageRange} onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select age range" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under18">Under 18</SelectItem>
                          <SelectItem value="18-30">18-30</SelectItem>
                          <SelectItem value="31-50">31-50</SelectItem>
                          <SelectItem value="51-70">51-70</SelectItem>
                          <SelectItem value="over70">Over 70</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Insurance</label>
                      <Select value={filters.insurance} onValueChange={(value) => setFilters(prev => ({ ...prev, insurance: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="with">With Insurance</SelectItem>
                          <SelectItem value="without">Without Insurance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in">
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Total Patients</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{stats.totalPatients}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="w-1 h-1 bg-success rounded-full"></span>
                  Active patients
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Active Treatments</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-warning to-orange-500 bg-clip-text text-transparent">{stats.activeTreatments}</p>
                <p className="text-xs text-warning flex items-center gap-1">
                  <span className="w-1 h-1 bg-warning rounded-full"></span>
                  Scheduled appointments
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-warning/20 to-warning/10 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">Overdue Checkups</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-destructive to-red-600 bg-clip-text text-transparent">{stats.overdueCheckups}</p>
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span className="w-1 h-1 bg-destructive rounded-full"></span>
                  Need follow-up
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-destructive/20 to-destructive/10 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-card to-muted/30 border-border/50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-medium">This Month</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">{stats.appointmentsThisMonth}</p>
                <p className="text-xs text-success flex items-center gap-1">
                  <span className="w-1 h-1 bg-success rounded-full"></span>
                  Appointments completed
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-success/20 to-success/10 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Patient List */}
      <Card className="bg-card/60 backdrop-blur-sm border-border/50 shadow-2xl animate-scale-in">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
               <CardTitle className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                 Patient Records
               </CardTitle>
               <CardDescription className="text-base mt-2">
                 {filteredPatients.length} patients found • AI-powered insights available
               </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="hover:bg-primary/5" onClick={handleExport}>Export</Button>
              <Button variant="ghost" size="sm" className="hover:bg-primary/5" onClick={handleImportClick}>Import</Button>
              <input ref={fileInputRef} type="file" accept=".csv,text/csv" onChange={handleFileChange} className="hidden" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {paginatedPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="group flex items-center justify-between p-6 border border-border/50 rounded-2xl hover:bg-gradient-to-r hover:from-muted/30 hover:to-accent/5 hover:border-primary/30 hover:shadow-xl transition-all duration-300 cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-6">
                <Avatar className="h-16 w-16 ring-2 ring-background shadow-lg group-hover:ring-primary/30 transition-all duration-300">
                  <AvatarImage src="" alt={`${patient.first_name} ${patient.last_name} profile image`} />
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20 text-primary font-bold text-lg">
                    {(patient.first_name?.[0] || '') + (patient.last_name?.[0] || '')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                      {patient.first_name} {patient.last_name}
                    </h3>
                    <Badge variant="outline" className={`${getStatusColor(getPatientStatus(patient))} font-medium px-3 py-1`}>
                      {getPatientStatus(patient)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-6 text-muted-foreground">
                    <span className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4" />
                      {patient.email || 'No email'}
                    </span>
                    <span className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Phone className="h-4 w-4" />
                      {patient.phone || 'No phone'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Age</p>
                  <p className="text-lg font-bold">{getAge(patient.date_of_birth)}</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Last Visit</p>
                  <p className="text-sm font-semibold">
                    {patient.last_visit ? new Date(patient.last_visit).toLocaleDateString() : 'No visits'}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Risk Level</p>
                  <p className={`text-sm font-bold ${getRiskColor(patient.risk_level)} uppercase tracking-wide`}>
                    {patient.risk_level}
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Insurance</p>
                  <p className="text-sm font-semibold">
                    {patient.insurance_info?.provider || 'No insurance'}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/10"
                  onClick={() => {
                    // Log patient access for HIPAA compliance
                    logPatientView(patient.id.toString(), {
                      action_context: 'patient_list_view',
                      patient_name: `${patient.first_name} ${patient.last_name}`,
                      timestamp: new Date().toISOString()
                    });
                    navigate(`/patients/${patient.id}`);
                  }}
                 >
                   View Details
                 </Button>
              </div>
            </div>
          ))}
          {totalPages > 1 && (
            <div className="pt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }} />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                    <PaginationItem key={pNum}>
                      <PaginationLink href="#" isActive={pNum === page} onClick={(e) => { e.preventDefault(); setPage(pNum); }}>
                        {pNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}