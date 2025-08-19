import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Blocks, Link, Shield, Cpu, Globe, CheckCircle, 
  AlertTriangle, Clock, Truck, Package, Award, 
  QrCode, FileText, Activity, Target, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface BlockchainTransaction {
  id: string;
  hash: string;
  timestamp: Date;
  type: 'manufacture' | 'quality_check' | 'shipment' | 'delivery' | 'verification';
  participant: string;
  location: string;
  data: any;
  verified: boolean;
  gasUsed: number;
}

interface LabCertificate {
  id: string;
  itemId: string;
  certificateType: 'quality' | 'authenticity' | 'biocompatibility' | 'durability';
  issuedBy: string;
  issuedDate: Date;
  expiryDate: Date;
  verificationStatus: 'pending' | 'verified' | 'failed';
  blockchainId: string;
  metadata: {
    testResults: any;
    standards: string[];
    certificationBody: string;
  };
}

interface SmartContract {
  id: string;
  name: string;
  address: string;
  type: 'quality_assurance' | 'delivery_guarantee' | 'payment_escrow' | 'warranty';
  status: 'active' | 'pending' | 'completed' | 'terminated';
  conditions: string[];
  autoExecute: boolean;
  executionHistory: Array<{
    timestamp: Date;
    action: string;
    result: string;
  }>;
}

export function LabBlockchainTracker() {
  const [labItems, setLabItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [certificates, setCertificates] = useState<LabCertificate[]>([]);
  const [smartContracts, setSmartContracts] = useState<SmartContract[]>([]);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState<string | null>(null);

  useEffect(() => {
    initializeBlockchainData();
  }, []);

  const initializeBlockchainData = () => {
    // Mock lab items with blockchain tracking
    const mockItems = [
      {
        id: 'item-001',
        name: 'Ceramic Crown - Upper Molar',
        orderId: 'ORD-2024-001',
        patient: 'John Smith',
        blockchainId: '0x742d35Cc6634C0532925a3b8D402461e2f7b1c88',
        status: 'in_production',
        manufacturer: 'PrecisionLab Pro',
        material: 'Lithium Disilicate',
        createdAt: new Date('2024-01-15'),
        estimatedCompletion: new Date('2024-02-20'),
        qualityScore: 96.5,
        certifications: ['ISO 13485', 'FDA 510(k)', 'CE Mark'],
        authenticity: 99.2
      },
      {
        id: 'item-002',
        name: 'Titanium Implant Bridge',
        orderId: 'ORD-2024-002',
        patient: 'Sarah Johnson',
        blockchainId: '0x9f2e8d7c6b5a493827160f5e4d3c2b1a9f8e7d6c',
        status: 'quality_testing',
        manufacturer: 'Elite Dental Solutions',
        material: 'Grade 4 Titanium',
        createdAt: new Date('2024-01-10'),
        estimatedCompletion: new Date('2024-02-25'),
        qualityScore: 98.7,
        certifications: ['ISO 13485', 'ASTM F136', 'FDA 510(k)'],
        authenticity: 99.8
      }
    ];

    const mockTransactions: BlockchainTransaction[] = [
      {
        id: 'tx-001',
        hash: '0xa1b2c3d4e5f6789012345678901234567890abcdef',
        timestamp: new Date('2024-01-15T08:00:00Z'),
        type: 'manufacture',
        participant: 'PrecisionLab Pro',
        location: 'Manufacturing Facility A',
        data: { batchNumber: 'PLP-2024-001', qualityGrade: 'A+' },
        verified: true,
        gasUsed: 21000
      },
      {
        id: 'tx-002',
        hash: '0xb2c3d4e5f6789012345678901234567890abcdef1',
        timestamp: new Date('2024-01-16T10:30:00Z'),
        type: 'quality_check',
        participant: 'QualityAssure International',
        location: 'Testing Laboratory B',
        data: { testResults: 'Passed all tests', compliance: 'ISO 13485' },
        verified: true,
        gasUsed: 18500
      },
      {
        id: 'tx-003',
        hash: '0xc3d4e5f6789012345678901234567890abcdef12',
        timestamp: new Date('2024-01-18T14:15:00Z'),
        type: 'shipment',
        participant: 'SecureLogistics Corp',
        location: 'Distribution Center',
        data: { trackingNumber: 'SLC-789456', temperature: '2-8°C' },
        verified: true,
        gasUsed: 19200
      }
    ];

    const mockCertificates: LabCertificate[] = [
      {
        id: 'cert-001',
        itemId: 'item-001',
        certificateType: 'quality',
        issuedBy: 'International Dental Quality Board',
        issuedDate: new Date('2024-01-16'),
        expiryDate: new Date('2026-01-16'),
        verificationStatus: 'verified',
        blockchainId: '0xd4e5f6789012345678901234567890abcdef123',
        metadata: {
          testResults: { strength: 450, durability: 95, biocompatibility: 99 },
          standards: ['ISO 13485', 'ISO 6872'],
          certificationBody: 'IDQB'
        }
      },
      {
        id: 'cert-002',
        itemId: 'item-002',
        certificateType: 'biocompatibility',
        issuedBy: 'Biomedical Testing Institute',
        issuedDate: new Date('2024-01-12'),
        expiryDate: new Date('2029-01-12'),
        verificationStatus: 'verified',
        blockchainId: '0xe5f6789012345678901234567890abcdef1234',
        metadata: {
          testResults: { cytotoxicity: 'Non-toxic', allergenicity: 'None detected' },
          standards: ['ISO 10993'],
          certificationBody: 'BTI'
        }
      }
    ];

    const mockContracts: SmartContract[] = [
      {
        id: 'contract-001',
        name: 'Quality Guarantee Contract',
        address: '0x1234567890abcdef1234567890abcdef12345678',
        type: 'quality_assurance',
        status: 'active',
        conditions: [
          'Quality score must be ≥ 95%',
          'All required certifications obtained',
          'Delivery within agreed timeframe'
        ],
        autoExecute: true,
        executionHistory: [
          {
            timestamp: new Date('2024-01-16T12:00:00Z'),
            action: 'Quality milestone reached',
            result: 'Automatic payment release triggered'
          }
        ]
      },
      {
        id: 'contract-002',
        name: 'Delivery Guarantee Contract',
        address: '0x234567890abcdef1234567890abcdef123456789',
        type: 'delivery_guarantee',
        status: 'active',
        conditions: [
          'Temperature maintained between 2-8°C',
          'Delivery within 48 hours',
          'Package integrity verified'
        ],
        autoExecute: true,
        executionHistory: []
      }
    ];

    setLabItems(mockItems);
    setTransactions(mockTransactions);
    setCertificates(mockCertificates);
    setSmartContracts(mockContracts);
  };

  const verifyAuthenticity = async (itemId: string) => {
    setVerificationInProgress(itemId);
    
    try {
      // Simulate blockchain verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setLabItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, authenticity: Math.min(100, item.authenticity + 0.1) }
            : item
        )
      );
      
      toast.success('Blockchain authenticity verification completed');
    } catch (error) {
      toast.error('Verification failed');
    } finally {
      setVerificationInProgress(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600';
      case 'in_production': return 'text-blue-600';
      case 'quality_testing': return 'text-amber-600';
      case 'shipped': return 'text-purple-600';
      case 'delivered': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'manufacture': return <Package className="w-4 h-4" />;
      case 'quality_check': return <CheckCircle className="w-4 h-4" />;
      case 'shipment': return <Truck className="w-4 h-4" />;
      case 'delivery': return <CheckCircle className="w-4 h-4" />;
      case 'verification': return <Shield className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-primary rounded-lg">
          <Blocks className="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold">Lab Blockchain Tracker</h2>
          <p className="text-muted-foreground">Immutable quality assurance and provenance tracking</p>
        </div>
      </div>

      {/* Blockchain Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Items Tracked', value: labItems.length, icon: Package, color: 'text-blue-600' },
          { label: 'Transactions', value: transactions.length, icon: Link, color: 'text-green-600' },
          { label: 'Certificates', value: certificates.length, icon: Award, color: 'text-purple-600' },
          { label: 'Smart Contracts', value: smartContracts.filter(c => c.status === 'active').length, icon: Cpu, color: 'text-amber-600' }
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tracked Lab Items */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Blockchain-Tracked Lab Items
          </CardTitle>
          <CardDescription>
            Real-time provenance and quality tracking for all lab work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {labItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">Order: {item.orderId} • Patient: {item.patient}</p>
                    <p className="text-xs text-muted-foreground">
                      Blockchain ID: {item.blockchainId.slice(0, 10)}...{item.blockchainId.slice(-8)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => verifyAuthenticity(item.id)}
                      disabled={verificationInProgress === item.id}
                    >
                      {verificationInProgress === item.id ? (
                        <Zap className="w-4 h-4 animate-spin" />
                      ) : (
                        <Shield className="w-4 h-4" />
                      )}
                      Verify
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium">Material</div>
                    <div className="text-sm text-muted-foreground">{item.material}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Manufacturer</div>
                    <div className="text-sm text-muted-foreground">{item.manufacturer}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Quality Score</div>
                    <div className="text-sm font-semibold text-green-600">{item.qualityScore}%</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Authenticity</div>
                    <div className="text-sm font-semibold text-blue-600">{item.authenticity.toFixed(1)}%</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {item.certifications.map((cert: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Created: {item.createdAt.toLocaleDateString()}</span>
                  <span>Est. Completion: {item.estimatedCompletion.toLocaleDateString()}</span>
                </div>

                {selectedItem === item.id && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-medium mb-3">Transaction History</h4>
                    <div className="space-y-3">
                      {transactions.slice(0, 3).map((tx) => (
                        <div key={tx.id} className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg">
                          <div className="p-2 bg-primary/10 rounded-full">
                            {getTransactionIcon(tx.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{tx.type.replace('_', ' ').toUpperCase()}</span>
                              <Badge variant={tx.verified ? 'default' : 'secondary'}>
                                {tx.verified ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{tx.participant}</p>
                            <p className="text-sm text-muted-foreground">{tx.location}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs font-mono bg-accent/20 px-2 py-1 rounded">
                                {tx.hash.slice(0, 16)}...
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Gas: {tx.gasUsed.toLocaleString()}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {tx.timestamp.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    {selectedItem === item.id ? 'Hide' : 'View'} History
                  </Button>
                  <Button size="sm" variant="outline">
                    <QrCode className="w-4 h-4 mr-1" />
                    QR Code
                  </Button>
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    Certificate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Smart Contracts */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="w-5 h-5" />
            Active Smart Contracts
          </CardTitle>
          <CardDescription>
            Automated quality assurance and delivery guarantees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {smartContracts.map((contract) => (
              <div key={contract.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">{contract.name}</h3>
                  <Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
                    {contract.status}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">Contract Address:</div>
                  <div className="text-xs font-mono bg-accent/10 p-2 rounded break-all">
                    {contract.address}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium">Conditions:</div>
                  <ul className="space-y-1">
                    {contract.conditions.map((condition, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 mt-0.5 text-green-500" />
                        {condition}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={contract.autoExecute ? 'default' : 'outline'}>
                    {contract.autoExecute ? 'Auto-Execute' : 'Manual'}
                  </Badge>
                  <Button size="sm" variant="outline">
                    View Contract
                  </Button>
                </div>

                {contract.executionHistory.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Recent Executions:</div>
                    {contract.executionHistory.slice(0, 2).map((execution, index) => (
                      <div key={index} className="text-xs text-muted-foreground">
                        {execution.timestamp.toLocaleString()}: {execution.action}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Digital Certificates */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Digital Certificates
          </CardTitle>
          <CardDescription>
            Blockchain-verified quality and compliance certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold capitalize">{cert.certificateType} Certificate</h3>
                  <Badge variant={cert.verificationStatus === 'verified' ? 'default' : 'secondary'}>
                    {cert.verificationStatus}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued by:</span>
                    <span>{cert.issuedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issue Date:</span>
                    <span>{cert.issuedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires:</span>
                    <span>{cert.expiryDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Standards:</span>
                    <span className="text-right">
                      {cert.metadata.standards.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-accent/10 rounded text-xs">
                  <div className="font-medium mb-1">Blockchain ID:</div>
                  <div className="font-mono break-all">{cert.blockchainId}</div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Shield className="w-4 h-4 mr-1" />
                    Verify
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}