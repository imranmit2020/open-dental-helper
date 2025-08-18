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
import { Plus, Edit2, Trash2, CreditCard, DollarSign, Building2, Phone, Mail } from 'lucide-react';
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment & Insurance Settings</h1>
          <p className="text-muted-foreground">Manage accepted payment methods and insurance plans</p>
        </div>
      </div>

      <Tabs defaultValue="payment-methods" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="insurance-plans">Insurance Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Accepted Payment Methods</CardTitle>
                  <CardDescription>Configure how patients can pay for services</CardDescription>
                </div>
                <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPayment(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
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
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getPaymentMethodIcon(method.method_type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{method.method_name}</h4>
                          <Badge variant={method.is_active ? "default" : "secondary"}>
                            {method.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          {method.method_type === 'cash' && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              No Fees
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-x-4">
                          {method.processing_fee_percentage > 0 && (
                            <span>Fee: {method.processing_fee_percentage}%</span>
                          )}
                          {method.minimum_amount > 0 && (
                            <span>Min: <CurrencyDisplay amount={method.minimum_amount} /></span>
                          )}
                          {method.maximum_amount && (
                            <span>Max: <CurrencyDisplay amount={method.maximum_amount} /></span>
                          )}
                        </div>
                        {method.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{method.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
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
                        onClick={() => handleDeletePaymentMethod(method.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {paymentMethods.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No payment methods configured yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insurance-plans" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Accepted Insurance Plans</CardTitle>
                  <CardDescription>Manage insurance providers and plan details</CardDescription>
                </div>
                <Dialog open={isInsuranceDialogOpen} onOpenChange={setIsInsuranceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingInsurance(null)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Insurance Plan
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
                          <Label htmlFor="coverage_percentage">
                            Coverage (%)
                            <span className="text-xs text-muted-foreground ml-1">
                              - Percentage of treatment costs covered by insurance
                            </span>
                          </Label>
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
                          <div className="text-xs text-muted-foreground mt-1 space-y-1">
                            <p>Find this information from:</p>
                            <ul className="list-disc list-inside ml-2 space-y-0.5">
                              <li>Insurance verification calls</li>
                              <li>Insurance company portals</li>
                              <li>Patient's insurance card/benefits summary</li>
                              <li>Previous claims with this insurer</li>
                            </ul>
                          </div>
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
            <CardContent>
              <div className="space-y-4">
                {insurancePlans.map((plan) => (
                  <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{plan.provider_name} - {plan.plan_name}</h4>
                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge variant="outline">{plan.plan_type}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground grid grid-cols-2 md:grid-cols-4 gap-4">
                        <span>Coverage: {plan.coverage_percentage}%</span>
                        <span>Max: <CurrencyDisplay amount={plan.annual_maximum} /></span>
                        <span>Deductible: <CurrencyDisplay amount={plan.deductible} /></span>
                        {plan.waiting_period_months > 0 && (
                          <span>Wait: {plan.waiting_period_months}mo</span>
                        )}
                      </div>
                      {(plan.contact_phone || plan.contact_email) && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {plan.contact_phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {plan.contact_phone}
                            </div>
                          )}
                          {plan.contact_email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {plan.contact_email}
                            </div>
                          )}
                        </div>
                      )}
                      {plan.notes && (
                        <p className="text-sm text-muted-foreground">{plan.notes}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
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
                        onClick={() => handleDeleteInsurancePlan(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {insurancePlans.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No insurance plans configured yet
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClinicPaymentSettings;