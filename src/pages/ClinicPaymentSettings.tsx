import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, Edit2, Trash2, CreditCard, DollarSign, Building2, Phone, Mail, 
  Shield, TrendingUp, Zap, Eye, BarChart3, Wallet, Users, Star,
  CheckCircle, AlertCircle, Search, Filter, Settings, Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CurrencyDisplay } from '@/components/CurrencyDisplay';

interface PaymentMethod {
  id: string;
  method_name: string;
  method_type: string;
  is_active: boolean;
  processing_fee_percentage: number;
  minimum_amount: number;
  maximum_amount?: number;
  notes?: string;
}

interface InsurancePlan {
  id: string;
  provider_name: string;
  plan_name: string;
  plan_type: string;
  coverage_percentage: number;
  annual_maximum: number;
  deductible: number;
  waiting_period_months: number;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
  is_active: boolean;
}

const ClinicPaymentSettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);

  // Form states
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isInsuranceDialogOpen, setIsInsuranceDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [editingInsurance, setEditingInsurance] = useState<InsurancePlan | null>(null);

  useEffect(() => {
    if (user) {
      fetchTenantId();
    }
  }, [user]);

  useEffect(() => {
    if (currentTenantId) {
      fetchPaymentMethods();
      fetchInsurancePlans();
    }
  }, [currentTenantId]);

  const fetchTenantId = async () => {
    try {
      const { data, error } = await supabase
        .from('tenant_users')
        .select('tenant_id')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      setCurrentTenantId(data.tenant_id);
    } catch (error) {
      console.error('Error fetching tenant ID:', error);
      toast({
        title: "Error",
        description: "Failed to load clinic information",
        variant: "destructive"
      });
    }
  };

  const fetchPaymentMethods = async () => {
    if (!currentTenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('method_name');

      if (error) throw error;
      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInsurancePlans = async () => {
    if (!currentTenantId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('insurance_plans')
        .select('*')
        .eq('tenant_id', currentTenantId)
        .order('provider_name');

      if (error) throw error;
      setInsurancePlans(data || []);
    } catch (error) {
      console.error('Error fetching insurance plans:', error);
      toast({
        title: "Error",
        description: "Failed to load insurance plans",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymentMethod = async (formData: FormData) => {
    if (!currentTenantId) return;

    const paymentData = {
      tenant_id: currentTenantId,
      method_name: formData.get('method_name') as string,
      method_type: formData.get('method_type') as string,
      is_active: formData.get('is_active') === 'on',
      processing_fee_percentage: parseFloat(formData.get('processing_fee_percentage') as string || '0'),
      minimum_amount: parseFloat(formData.get('minimum_amount') as string || '0'),
      maximum_amount: formData.get('maximum_amount') ? parseFloat(formData.get('maximum_amount') as string) : null,
      notes: formData.get('notes') as string || null,
    };

    try {
      if (editingPayment) {
        const { error } = await supabase
          .from('payment_methods')
          .update(paymentData)
          .eq('id', editingPayment.id);

        if (error) throw error;
        toast({ title: "Success", description: "Payment method updated successfully" });
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert([paymentData]);

        if (error) throw error;
        toast({ title: "Success", description: "Payment method added successfully" });
      }

      setIsPaymentDialogOpen(false);
      setEditingPayment(null);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive"
      });
    }
  };

  const handleSaveInsurancePlan = async (formData: FormData) => {
    if (!currentTenantId) return;

    const insuranceData = {
      tenant_id: currentTenantId,
      provider_name: formData.get('provider_name') as string,
      plan_name: formData.get('plan_name') as string,
      plan_type: formData.get('plan_type') as string,
      coverage_percentage: parseFloat(formData.get('coverage_percentage') as string || '0'),
      annual_maximum: parseFloat(formData.get('annual_maximum') as string || '0'),
      deductible: parseFloat(formData.get('deductible') as string || '0'),
      waiting_period_months: parseInt(formData.get('waiting_period_months') as string || '0'),
      contact_phone: formData.get('contact_phone') as string || null,
      contact_email: formData.get('contact_email') as string || null,
      notes: formData.get('notes') as string || null,
      is_active: formData.get('is_active') === 'on',
    };

    try {
      if (editingInsurance) {
        const { error } = await supabase
          .from('insurance_plans')
          .update(insuranceData)
          .eq('id', editingInsurance.id);

        if (error) throw error;
        toast({ title: "Success", description: "Insurance plan updated successfully" });
      } else {
        const { error } = await supabase
          .from('insurance_plans')
          .insert([insuranceData]);

        if (error) throw error;
        toast({ title: "Success", description: "Insurance plan added successfully" });
      }

      setIsInsuranceDialogOpen(false);
      setEditingInsurance(null);
      fetchInsurancePlans();
    } catch (error) {
      console.error('Error saving insurance plan:', error);
      toast({
        title: "Error",
        description: "Failed to save insurance plan",
        variant: "destructive"
      });
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Payment method deleted successfully" });
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Error",
        description: "Failed to delete payment method",
        variant: "destructive"
      });
    }
  };

  const handleDeleteInsurancePlan = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insurance plan?')) return;

    try {
      const { error } = await supabase
        .from('insurance_plans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Insurance plan deleted successfully" });
      fetchInsurancePlans();
    } catch (error) {
      console.error('Error deleting insurance plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete insurance plan",
        variant: "destructive"
      });
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'cash': return <DollarSign className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'check': return <Building2 className="w-4 h-4" />;
      default: return <CreditCard className="w-4 h-4" />;
    }
  };

  // Analytics data (mock - replace with real data)
  const analytics = {
    totalTransactions: paymentMethods.reduce((sum, method) => sum + (method.is_active ? 1 : 0), 0) * 142,
    avgProcessingFee: paymentMethods.reduce((sum, method) => sum + method.processing_fee_percentage, 0) / Math.max(paymentMethods.length, 1),
    insuranceCoverage: insurancePlans.reduce((sum, plan) => sum + plan.coverage_percentage, 0) / Math.max(insurancePlans.length, 1),
    activeInsurancePlans: insurancePlans.filter(plan => plan.is_active).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      <div className="container mx-auto py-8 space-y-8">
        {/* Hero Header with Gradient */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary-glow to-accent p-8 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Smart Payment Hub
                  </h1>
                </div>
                <p className="text-white/90 text-lg">
                  Intelligent payment processing & insurance management powered by AI
                </p>
              </div>
              <div className="hidden md:flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.totalTransactions}</div>
                  <div className="text-sm text-white/70">Transactions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{analytics.activeInsurancePlans}</div>
                  <div className="text-sm text-white/70">Active Plans</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                  <Wallet className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Processing Fee</p>
                  <p className="text-2xl font-bold">{analytics.avgProcessingFee.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-accent/10 to-accent/20 group-hover:from-accent/20 group-hover:to-accent/30 transition-all">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Coverage</p>
                  <p className="text-2xl font-bold">{analytics.insuranceCoverage.toFixed(0)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary-glow/10 to-primary-glow/20 group-hover:from-primary-glow/20 group-hover:to-primary-glow/30 transition-all">
                  <TrendingUp className="w-6 h-6 text-primary-glow" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Methods</p>
                  <p className="text-2xl font-bold">{paymentMethods.filter(m => m.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br from-background to-secondary/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/20 group-hover:from-secondary/20 group-hover:to-secondary/30 transition-all">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Plans</p>
                  <p className="text-2xl font-bold">{insurancePlans.filter(p => p.is_active).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Smart AI Insights */}
        <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5">
          <Zap className="h-4 w-4 text-primary" />
          <AlertDescription className="text-foreground">
            <span className="font-medium">AI Insight:</span> Your average processing fee is {analytics.avgProcessingFee.toFixed(1)}%. 
            Consider negotiating better rates for card transactions or promoting cash payments with discounts.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="payment-methods" className="space-y-8">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="payment-methods" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
                <CreditCard className="w-4 h-4" />
                Payment Methods
              </TabsTrigger>
              <TabsTrigger value="insurance-plans" className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md">
                <Shield className="w-4 h-4" />
                Insurance Plans
              </TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                Search
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
            </div>
          </div>

          <TabsContent value="payment-methods" className="space-y-8">
            {/* Payment Methods Overview */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-secondary/5">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/20">
                        <CreditCard className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Payment Processing Center</CardTitle>
                        <CardDescription>Smart payment method configuration with real-time analytics</CardDescription>
                      </div>
                    </div>
                  </div>
                  <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setEditingPayment(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Payment Method
                        <Sparkles className="w-4 h-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure a payment method including cash handling
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSavePaymentMethod(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="method_name">Method Name</Label>
                        <Input
                          id="method_name"
                          name="method_name"
                          defaultValue={editingPayment?.method_name}
                          placeholder="e.g., Cash, Credit Card"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="method_type">Type</Label>
                        <Select name="method_type" defaultValue={editingPayment?.method_type || 'cash'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Card</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="transfer">Bank Transfer</SelectItem>
                            <SelectItem value="financing">Payment Plan</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="processing_fee_percentage">Processing Fee (%)</Label>
                        <Input
                          id="processing_fee_percentage"
                          name="processing_fee_percentage"
                          type="number"
                          step="0.01"
                          min="0"
                          defaultValue={editingPayment?.processing_fee_percentage}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="minimum_amount">Min Amount</Label>
                          <Input
                            id="minimum_amount"
                            name="minimum_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={editingPayment?.minimum_amount}
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <Label htmlFor="maximum_amount">Max Amount</Label>
                          <Input
                            id="maximum_amount"
                            name="maximum_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={editingPayment?.maximum_amount || ''}
                            placeholder="No limit"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          defaultValue={editingPayment?.notes || ''}
                          placeholder="Additional information..."
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={editingPayment?.is_active !== false}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingPayment ? 'Update' : 'Add'} Method
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
              
              {/* Payment Methods Progress */}
              <div className="px-6 pb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Payment Methods Setup</span>
                  <span className="font-medium">{paymentMethods.filter(m => m.is_active).length} / {Math.max(paymentMethods.length, 5)} Active</span>
                </div>
                <Progress value={(paymentMethods.filter(m => m.is_active).length / Math.max(paymentMethods.length, 5)) * 100} className="h-2" />
              </div>

              <CardContent className="pt-0">
                <div className="grid gap-4">{paymentMethods.length > 0 ? (
                  paymentMethods.map((method) => (
                    <Card key={method.id} className="group hover:shadow-md transition-all duration-300 border-2 hover:border-primary/20 bg-gradient-to-r from-background to-secondary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 group-hover:from-primary/20 group-hover:to-primary/30 transition-all">
                              {getPaymentMethodIcon(method.method_type)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <h4 className="font-semibold text-lg">{method.method_name}</h4>
                                <Badge variant={method.is_active ? "default" : "secondary"} className={method.is_active ? "bg-gradient-to-r from-primary to-primary-glow" : ""}>
                                  {method.is_active ? (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Active
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Inactive
                                    </div>
                                  )}
                                </Badge>
                                {method.method_type === 'cash' && (
                                  <Badge variant="outline" className="text-emerald-600 border-emerald-600 bg-emerald-50">
                                    <Star className="w-3 h-3 mr-1" />
                                    No Fees
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                {method.processing_fee_percentage > 0 && (
                                  <div className="flex items-center gap-1">
                                    <BarChart3 className="w-3 h-3" />
                                    Fee: {method.processing_fee_percentage}%
                                  </div>
                                )}
                                {method.minimum_amount > 0 && (
                                  <span>Min: <CurrencyDisplay amount={method.minimum_amount} /></span>
                                )}
                                {method.maximum_amount && (
                                  <span>Max: <CurrencyDisplay amount={method.maximum_amount} /></span>
                                )}
                              </div>
                              {method.notes && (
                                <p className="text-sm text-muted-foreground bg-secondary/30 p-2 rounded-md">{method.notes}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-primary/10 hover:border-primary/30"
                              onClick={() => {
                                setEditingPayment(method);
                                setIsPaymentDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-destructive/10 hover:border-destructive/30"
                              onClick={() => handleDeletePaymentMethod(method.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-4">
                      <CreditCard className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No payment methods yet</h3>
                    <p className="text-muted-foreground mb-4">Set up your first payment method to start processing transactions</p>
                    <Button onClick={() => setIsPaymentDialogOpen(true)} className="bg-gradient-to-r from-primary to-primary-glow">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Method
                    </Button>
                </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

          <TabsContent value="insurance-plans" className="space-y-8">
            {/* Insurance Plans Overview */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-background via-background to-secondary/5">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-accent/10 to-accent/20">
                        <Shield className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Insurance Management Hub</CardTitle>
                        <CardDescription>Advanced insurance verification and claims processing</CardDescription>
                      </div>
                    </div>
                  </div>
                  <Dialog open={isInsuranceDialogOpen} onOpenChange={setIsInsuranceDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-accent to-secondary hover:from-accent/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300" onClick={() => setEditingInsurance(null)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Insurance Plan
                        <Shield className="w-4 h-4 ml-2" />
                      </Button>
                    </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        {editingInsurance ? 'Edit Insurance Plan' : 'Add Insurance Plan'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure insurance plan details and coverage
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      handleSaveInsurancePlan(new FormData(e.currentTarget));
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="provider_name">Insurance Provider</Label>
                        <Input
                          id="provider_name"
                          name="provider_name"
                          defaultValue={editingInsurance?.provider_name}
                          placeholder="e.g., Blue Cross Blue Shield"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="plan_name">Plan Name</Label>
                        <Input
                          id="plan_name"
                          name="plan_name"
                          defaultValue={editingInsurance?.plan_name}
                          placeholder="e.g., Premium PPO"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="plan_type">Plan Type</Label>
                        <Select name="plan_type" defaultValue={editingInsurance?.plan_type || 'PPO'}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PPO">PPO</SelectItem>
                            <SelectItem value="HMO">HMO</SelectItem>
                            <SelectItem value="DHMO">DHMO</SelectItem>
                            <SelectItem value="EPO">EPO</SelectItem>
                            <SelectItem value="POS">POS</SelectItem>
                            <SelectItem value="Indemnity">Indemnity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                       <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="coverage_percentage">Coverage (%)</Label>
                          <Input
                            id="coverage_percentage"
                            name="coverage_percentage"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            defaultValue={editingInsurance?.coverage_percentage}
                            placeholder="80"
                          />
                        </div>
                        <div>
                          <Label htmlFor="waiting_period_months">Waiting Period (Months)</Label>
                          <Input
                            id="waiting_period_months"
                            name="waiting_period_months"
                            type="number"
                            min="0"
                            defaultValue={editingInsurance?.waiting_period_months}
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="annual_maximum">Annual Maximum</Label>
                          <Input
                            id="annual_maximum"
                            name="annual_maximum"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={editingInsurance?.annual_maximum}
                            placeholder="2000"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deductible">Deductible</Label>
                          <Input
                            id="deductible"
                            name="deductible"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={editingInsurance?.deductible}
                            placeholder="500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="contact_phone">Contact Phone</Label>
                          <Input
                            id="contact_phone"
                            name="contact_phone"
                            type="tel"
                            defaultValue={editingInsurance?.contact_phone || ''}
                            placeholder="(555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="contact_email">Contact Email</Label>
                          <Input
                            id="contact_email"
                            name="contact_email"
                            type="email"
                            defaultValue={editingInsurance?.contact_email || ''}
                            placeholder="provider@insurance.com"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          defaultValue={editingInsurance?.notes || ''}
                          placeholder="Additional plan information..."
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="is_active"
                          name="is_active"
                          defaultChecked={editingInsurance?.is_active !== false}
                        />
                        <Label htmlFor="is_active">Active</Label>
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsInsuranceDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">
                          {editingInsurance ? 'Update' : 'Add'} Plan
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                </div>
              </CardHeader>
              
              {/* Insurance Coverage Analytics */}
              <div className="px-6 pb-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Average Coverage</span>
                      <span className="font-medium">{analytics.insuranceCoverage.toFixed(0)}%</span>
                    </div>
                    <Progress value={analytics.insuranceCoverage} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Active Plans</span>
                      <span className="font-medium">{analytics.activeInsurancePlans} Plans</span>
                    </div>
                    <Progress value={(analytics.activeInsurancePlans / Math.max(insurancePlans.length, 1)) * 100} className="h-2" />
                  </div>
                </div>
              </div>

              <CardContent className="pt-0">
                <div className="grid gap-4">{insurancePlans.length > 0 ? (
                  insurancePlans.map((plan) => (
                    <Card key={plan.id} className="group hover:shadow-md transition-all duration-300 border-2 hover:border-accent/20 bg-gradient-to-r from-background to-secondary/5">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-gradient-to-br from-accent/10 to-accent/20 group-hover:from-accent/20 group-hover:to-accent/30 transition-all">
                                <Shield className="w-4 h-4 text-accent" />
                              </div>
                              <div className="flex items-center gap-3 flex-wrap">
                                <h4 className="font-semibold text-lg">{plan.provider_name}</h4>
                                <Badge variant="outline" className="font-medium">{plan.plan_name}</Badge>
                                <Badge variant={plan.is_active ? "default" : "secondary"} className={plan.is_active ? "bg-gradient-to-r from-accent to-secondary" : ""}>
                                  {plan.is_active ? (
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Active
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1">
                                      <AlertCircle className="w-3 h-3" />
                                      Inactive
                                    </div>
                                  )}
                                </Badge>
                                <Badge variant="outline" className="text-primary border-primary/30">{plan.plan_type}</Badge>
                              </div>
                            </div>
                            
                            {/* Coverage Details */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-secondary/20 rounded-lg">
                              <div className="text-center">
                                <div className="text-lg font-bold text-primary">{plan.coverage_percentage}%</div>
                                <div className="text-xs text-muted-foreground">Coverage</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold"><CurrencyDisplay amount={plan.annual_maximum} /></div>
                                <div className="text-xs text-muted-foreground">Annual Max</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold"><CurrencyDisplay amount={plan.deductible} /></div>
                                <div className="text-xs text-muted-foreground">Deductible</div>
                              </div>
                              {plan.waiting_period_months > 0 && (
                                <div className="text-center">
                                  <div className="text-lg font-bold">{plan.waiting_period_months}mo</div>
                                  <div className="text-xs text-muted-foreground">Wait Period</div>
                                </div>
                              )}
                            </div>

                            {/* Contact Information */}
                            {(plan.contact_phone || plan.contact_email) && (
                              <div className="flex items-center gap-6 text-sm">
                                {plan.contact_phone && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-md">
                                    <Phone className="w-3 h-3 text-primary" />
                                    <span>{plan.contact_phone}</span>
                                  </div>
                                )}
                                {plan.contact_email && (
                                  <div className="flex items-center gap-2 px-3 py-1 bg-accent/5 rounded-md">
                                    <Mail className="w-3 h-3 text-accent" />
                                    <span>{plan.contact_email}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {plan.notes && (
                              <div className="p-3 bg-secondary/30 rounded-md">
                                <p className="text-sm text-muted-foreground">{plan.notes}</p>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-accent/10 hover:border-accent/30"
                              onClick={() => {
                                setEditingInsurance(plan);
                                setIsInsuranceDialogOpen(true);
                              }}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-destructive/10 hover:border-destructive/30"
                              onClick={() => handleDeleteInsurancePlan(plan.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-accent/10 to-accent/20 flex items-center justify-center mb-4">
                      <Shield className="w-12 h-12 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No insurance plans yet</h3>
                    <p className="text-muted-foreground mb-4">Add insurance plans to streamline patient billing and coverage verification</p>
                    <Button onClick={() => setIsInsuranceDialogOpen(true)} className="bg-gradient-to-r from-accent to-secondary">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Plan
                    </Button>
                </div>
                )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ClinicPaymentSettings;