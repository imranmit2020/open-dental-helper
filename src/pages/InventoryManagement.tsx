import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, AlertTriangle, ShoppingCart, BarChart3, Truck, Users, Archive, Brain, Microscope, Mic, Shield } from 'lucide-react';
import { InventoryDashboard } from '@/components/inventory/InventoryDashboard';
import { InventoryItems } from '@/components/inventory/InventoryItems';
import { PurchaseOrders } from '@/components/inventory/PurchaseOrders';
import { Suppliers } from '@/components/inventory/Suppliers';
import { InventoryAnalytics } from '@/components/inventory/InventoryAnalytics';
import { AIInventoryOracle } from '@/components/inventory/AIInventoryOracle';
import { SmartLabOrders } from '@/components/inventory/SmartLabOrders';
import { VoiceInventoryAssistant } from '@/components/inventory/VoiceInventoryAssistant';
import { BlockchainSupplyChain } from '@/components/inventory/BlockchainSupplyChain';
import { InventoryAlerts } from '@/components/inventory/InventoryAlerts';
import { useTenant } from '@/contexts/TenantContext';

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const { currentTenant } = useTenant();

  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: BarChart3,
      component: <InventoryDashboard searchTerm={searchTerm} categoryFilter={categoryFilter} />
    },
    {
      id: 'items',
      label: 'Items',
      icon: Package,
      component: <InventoryItems searchTerm={searchTerm} categoryFilter={categoryFilter} />
    },
    {
      id: 'orders',
      label: 'Purchase Orders',
      icon: ShoppingCart,
      component: <PurchaseOrders searchTerm={searchTerm} />
    },
    {
      id: 'suppliers',
      label: 'Suppliers',
      icon: Truck,
      component: <Suppliers searchTerm={searchTerm} />
    },
    {
      id: 'alerts',
      label: 'Alerts',
      icon: AlertTriangle,
      component: <InventoryAlerts />
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      component: <InventoryAnalytics />
    },
    {
      id: 'ai-oracle',
      label: 'AI Oracle',
      icon: Brain,
      component: <AIInventoryOracle />
    },
    {
      id: 'lab-orders',
      label: 'Lab Orders',
      icon: Microscope,
      component: <SmartLabOrders />
    },
    {
      id: 'voice-assistant',
      label: 'Voice Assistant',
      icon: Mic,
      component: <VoiceInventoryAssistant />
    },
    {
      id: 'blockchain',
      label: 'Blockchain',
      icon: Shield,
      component: <BlockchainSupplyChain />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-text bg-clip-text text-transparent">
              Inventory Management
            </h1>
            <p className="text-muted-foreground mt-1">
              AI-powered inventory tracking for {currentTenant?.name || 'your practice'}
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-gradient-primary text-primary-foreground shadow-elegant hover:shadow-glow transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Quick Add Item
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search inventory items, suppliers, or orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="dental-instruments">Dental Instruments</SelectItem>
                  <SelectItem value="consumables">Consumables</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="office-supplies">Office Supplies</SelectItem>
                  <SelectItem value="pharmaceuticals">Pharmaceuticals</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 w-full h-auto p-1 bg-card/50 backdrop-blur-sm border-primary/10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col gap-1 py-3 px-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="space-y-6">
              {tab.component}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}