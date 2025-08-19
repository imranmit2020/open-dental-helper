import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, Link, Package, Truck, CheckCircle, AlertTriangle, 
  QrCode, Fingerprint, Globe, Clock, Award, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainTransaction {
  id: string;
  hash: string;
  timestamp: Date;
  type: 'manufacture' | 'quality_check' | 'shipment' | 'received' | 'verification';
  participant: string;
  location: string;
  data: any;
  verified: boolean;
  gas_fee: number;
}

interface SupplyChainItem {
  id: string;
  name: string;
  sku: string;
  blockchain_id: string;
  manufacturer: string;
  batch_number: string;
  manufacture_date: Date;
  expiry_date: Date;
  current_location: string;
  authenticity_score: number;
  sustainability_score: number;
  carbon_footprint: number;
  certifications: string[];
  transactions: BlockchainTransaction[];
  status: 'in_transit' | 'delivered' | 'verified' | 'disputed';
}

interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'quality_assurance' | 'authenticity' | 'sustainability' | 'compliance';
  status: 'active' | 'pending' | 'expired';
  conditions: string[];
  auto_execute: boolean;
}

export function BlockchainSupplyChain() {
  const [supplyChainItems, setSupplyChainItems] = useState<SupplyChainItem[]>([]);
  const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tracking');
  const [verificationInProgress, setVerificationInProgress] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplyChainData();
    fetchSmartContracts();
  }, []);

  const fetchSupplyChainData = async () => {
    try {
      setLoading(true);
      
      // Mock blockchain supply chain data
      const mockItems: SupplyChainItem[] = [
        {
          id: '1',
          name: 'Premium Composite Resin A2',
          sku: 'CR-A2-500',
          blockchain_id: '0x742d35Cc6634C0532925a3b8D402461e2f7b1c88',
          manufacturer: 'DentTech Solutions',
          batch_number: 'DTS-2024-001',
          manufacture_date: new Date('2024-01-15'),
          expiry_date: new Date('2026-01-15'),
          current_location: 'Warehouse B - Section 12',
          authenticity_score: 98.5,
          sustainability_score: 87.2,
          carbon_footprint: 2.4,
          certifications: ['FDA', 'CE', 'ISO 13485', 'GMP'],
          status: 'verified',
          transactions: [
            {
              id: 'tx1',
              hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef',
              timestamp: new Date('2024-01-15T08:00:00Z'),
              type: 'manufacture',
              participant: 'DentTech Solutions',
              location: 'Manufacturing Plant A, Germany',
              data: { batch_size: 1000, quality_grade: 'A+' },
              verified: true,
              gas_fee: 0.002
            },
            {
              id: 'tx2',
              hash: '0xb2c3d4e5f6789012345678901234567890abcdef1',
              timestamp: new Date('2024-01-16T10:30:00Z'),
              type: 'quality_check',
              participant: 'QualityLab International',
              location: 'Testing Facility, Switzerland',
              data: { test_results: 'Passed all tests', compliance: true },
              verified: true,
              gas_fee: 0.001
            },
            {
              id: 'tx3',
              hash: '0xc3d4e5f6789012345678901234567890abcdef12',
              timestamp: new Date('2024-01-20T14:15:00Z'),
              type: 'shipment',
              participant: 'GlobalLogistics Corp',
              location: 'Distribution Center, USA',
              data: { shipping_method: 'Express', temperature_controlled: true },
              verified: true,
              gas_fee: 0.001
            }
          ]
        },
        {
          id: '2',
          name: 'Titanium Dental Implant 4.1mm',
          sku: 'TI-4.1-STD',
          blockchain_id: '0x9f2e8d7c6b5a493827160f5e4d3c2b1a9f8e7d6c',
          manufacturer: 'PrecisionImplants Inc',
          batch_number: 'PI-2024-045',
          manufacture_date: new Date('2024-01-10'),
          expiry_date: new Date('2029-01-10'),
          current_location: 'In Transit - Carrier: FedEx',
          authenticity_score: 99.8,
          sustainability_score: 92.1,
          carbon_footprint: 1.8,
          certifications: ['FDA', 'CE', 'ISO 13485', 'ASTM F136'],
          status: 'in_transit',
          transactions: [
            {
              id: 'tx4',
              hash: '0xd4e5f6789012345678901234567890abcdef123',
              timestamp: new Date('2024-01-10T09:00:00Z'),
              type: 'manufacture',
              participant: 'PrecisionImplants Inc',
              location: 'Titanium Foundry, Sweden',
              data: { grade: 'Grade 4 Titanium', surface_treatment: 'SLA' },
              verified: true,
              gas_fee: 0.003
            },
            {
              id: 'tx5',
              hash: '0xe5f6789012345678901234567890abcdef1234',
              timestamp: new Date('2024-01-22T11:45:00Z'),
              type: 'shipment',
              participant: 'FedEx Medical',
              location: 'Memphis Hub, USA',
              data: { tracking: 'FX123456789', temperature_log: 'Maintained' },
              verified: true,
              gas_fee: 0.001
            }
          ]
        }
      ];

      setSupplyChainItems(mockItems);
    } catch (error) {
      console.error('Error fetching supply chain data:', error);
      toast.error('Failed to load supply chain data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartContracts = async () => {
    try {
      const mockContracts: SmartContract[] = [
        {
          id: '1',
          name: 'Quality Assurance Contract',
          address: '0x1234567890abcdef1234567890abcdef12345678',
          type: 'quality_assurance',
          status: 'active',
          conditions: [
            'All items must pass FDA quality standards',
            'Temperature must be maintained between 2-8°C during transport',
            'Batch documentation must be complete'
          ],
          auto_execute: true
        },
        {
          id: '2',
          name: 'Authenticity Verification',
          address: '0x234567890abcdef1234567890abcdef123456789',
          type: 'authenticity',
          status: 'active',
          conditions: [
            'Manufacturer digital signature required',
            'Holographic verification must pass',
            'Serial number must match blockchain record'
          ],
          auto_execute: true
        },
        {
          id: '3',
          name: 'Sustainability Compliance',
          address: '0x34567890abcdef1234567890abcdef1234567890',
          type: 'sustainability',
          status: 'active',
          conditions: [
            'Carbon footprint must be below 5kg CO2e',
            'Recycled content minimum 30%',
            'Sustainable packaging required'
          ],
          auto_execute: false
        }
      ];

      setSmartContracts(mockContracts);
    } catch (error) {
      console.error('Error fetching smart contracts:', error);
    }
  };

  const verifyAuthenticity = async (itemId: string) => {
    setVerificationInProgress(itemId);
    
    try {
      // Simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setSupplyChainItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, authenticity_score: Math.min(100, item.authenticity_score + 1) }
            : item
        )
      );
      
      toast.success('Authenticity verification completed successfully');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setVerificationInProgress(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'default';
      case 'in_transit': return 'secondary';
      case 'delivered': return 'outline';
      case 'disputed': return 'destructive';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'manufacture': return <Package className="w-4 h-4" />;
      case 'quality_check': return <CheckCircle className="w-4 h-4" />;
      case 'shipment': return <Truck className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      case 'verification': return <Shield className="w-4 h-4" />;
      default: return <Link className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <Shield className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Blockchain Supply Chain</h2>
          <p className="text-muted-foreground">Transparent, secure, and traceable inventory management</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Supply Chain Tracking</TabsTrigger>
          <TabsTrigger value="contracts">Smart Contracts</TabsTrigger>
          <TabsTrigger value="analytics">Blockchain Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="space-y-6">
          {/* Supply Chain Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Items Tracked', value: supplyChainItems.length, icon: Package, color: 'text-blue-600' },
              { label: 'Verified Items', value: supplyChainItems.filter(i => i.status === 'verified').length, icon: CheckCircle, color: 'text-green-600' },
              { label: 'In Transit', value: supplyChainItems.filter(i => i.status === 'in_transit').length, icon: Truck, color: 'text-amber-600' },
              { label: 'Total Transactions', value: supplyChainItems.reduce((sum, item) => sum + item.transactions.length, 0), icon: Link, color: 'text-purple-600' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Supply Chain Items */}
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Tracked Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Details</TableHead>
                    <TableHead>Blockchain ID</TableHead>
                    <TableHead>Authenticity</TableHead>
                    <TableHead>Sustainability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <TableRow key={i}>
                        {[...Array(6)].map((_, j) => (
                          <TableCell key={j} className="animate-pulse">
                            <div className="h-4 bg-muted rounded w-20"></div>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    supplyChainItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                            <p className="text-xs text-muted-foreground">Batch: {item.batch_number}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.certifications.slice(0, 3).map((cert, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-mono text-xs bg-accent/10 p-1 rounded">
                              {item.blockchain_id.slice(0, 10)}...{item.blockchain_id.slice(-8)}
                            </p>
                            <div className="flex items-center gap-1">
                              <Link className="w-3 h-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{item.transactions.length} tx</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Fingerprint className="w-4 h-4 text-accent" />
                              <span className={`font-semibold ${getScoreColor(item.authenticity_score)}`}>
                                {item.authenticity_score.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={item.authenticity_score} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Globe className="w-4 h-4 text-green-600" />
                              <span className={`font-semibold ${getScoreColor(item.sustainability_score)}`}>
                                {item.sustainability_score.toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {item.carbon_footprint}kg CO₂e
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(item.status) as any}>
                            {item.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => verifyAuthenticity(item.id)}
                              disabled={verificationInProgress === item.id}
                            >
                              {verificationInProgress === item.id ? (
                                <Zap className="w-3 h-3 animate-spin" />
                              ) : (
                                <Shield className="w-3 h-3" />
                              )}
                            </Button>
                            <Button size="sm" variant="outline">
                              <QrCode className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Transaction History */}
          {supplyChainItems.length > 0 && (
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Blockchain Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supplyChainItems[0].transactions.map((tx, index) => (
                    <div key={tx.id} className="flex items-start gap-4 p-4 bg-accent/10 rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {getTransactionIcon(tx.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{tx.type.replace('_', ' ').toUpperCase()}</p>
                          <Badge variant={tx.verified ? 'default' : 'secondary'}>
                            {tx.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tx.participant}</p>
                        <p className="text-sm text-muted-foreground">{tx.location}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <p className="text-xs font-mono bg-accent/20 px-2 py-1 rounded">
                            {tx.hash.slice(0, 16)}...
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Gas: {tx.gas_fee} ETH
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="contracts" className="space-y-6">
          <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Smart Contracts
              </CardTitle>
              <CardDescription>
                Automated compliance and quality assurance contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {smartContracts.map((contract) => (
                  <Card key={contract.id} className="border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{contract.name}</CardTitle>
                        <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                          {contract.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium mb-2">Contract Address:</p>
                        <p className="text-xs font-mono bg-accent/10 p-2 rounded break-all">
                          {contract.address}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Conditions:</p>
                        <ul className="space-y-1">
                          {contract.conditions.map((condition, index) => (
                            <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant={contract.auto_execute ? 'default' : 'outline'}>
                          {contract.auto_execute ? 'Auto-Execute' : 'Manual'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Blockchain Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Transaction Success Rate</span>
                    <span className="font-semibold text-green-600">99.7%</span>
                  </div>
                  <Progress value={99.7} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Average Gas Cost</span>
                    <span className="font-semibold">0.0015 ETH</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Network Utilization</span>
                    <span className="font-semibold text-amber-600">67%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Supply Chain Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">47</p>
                    <p className="text-sm text-muted-foreground">Verified Items</p>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">23</p>
                    <p className="text-sm text-muted-foreground">Suppliers</p>
                  </div>
                  <div className="text-center p-3 bg-accent/10 rounded-lg">
                    <p className="text-2xl font-bold text-amber-600">98.2%</p>
                    <p className="text-sm text-muted-foreground">Avg. Quality</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}