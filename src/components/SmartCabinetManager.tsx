import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SmartCabinet, useIoTHardware } from '@/hooks/useIoTHardware';
import { Lock, Unlock, Smartphone, CreditCard, Fingerprint, Clock, Users, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const SmartCabinetManager: React.FC = () => {
  const { smartCabinets, unlockCabinet } = useIoTHardware();
  const { toast } = useToast();
  const [selectedCabinet, setSelectedCabinet] = useState<string | null>(null);

  const getStatusColor = (status: SmartCabinet['status']) => {
    switch (status) {
      case 'unlocked': return 'bg-green-500 text-white';
      case 'error': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: SmartCabinet['status']) => {
    switch (status) {
      case 'unlocked': return <Unlock className="h-4 w-4" />;
      case 'error': return <Lock className="h-4 w-4 text-destructive" />;
      default: return <Lock className="h-4 w-4" />;
    }
  };

  const getAccessMethodIcon = (method: SmartCabinet['access_method']) => {
    switch (method) {
      case 'RFID': return <CreditCard className="h-4 w-4" />;
      case 'NFC': return <Smartphone className="h-4 w-4" />;
      case 'Biometric': return <Fingerprint className="h-4 w-4" />;
    }
  };

  const handleUnlock = async (cabinetId: string, method: string) => {
    try {
      await unlockCabinet(cabinetId, 'current-user', method);
    } catch (error) {
      toast({
        title: "Access Denied",
        description: "You are not authorized to access this cabinet.",
        variant: "destructive",
      });
    }
  };

  const simulateRFIDScan = (cabinetId: string) => {
    toast({
      title: "RFID Detected",
      description: "Scanning RFID badge...",
    });
    setTimeout(() => handleUnlock(cabinetId, 'RFID'), 1000);
  };

  const simulateNFCTap = (cabinetId: string) => {
    toast({
      title: "NFC Detected",
      description: "Processing NFC tap...",
    });
    setTimeout(() => handleUnlock(cabinetId, 'NFC'), 800);
  };

  const simulateBiometric = (cabinetId: string) => {
    toast({
      title: "Biometric Scan",
      description: "Scanning fingerprint...",
    });
    setTimeout(() => handleUnlock(cabinetId, 'Biometric'), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Lock className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Smart Cabinet Access Control</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {smartCabinets.map((cabinet) => (
          <Card key={cabinet.id} className="p-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{cabinet.name}</CardTitle>
                <Badge className={getStatusColor(cabinet.status)}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(cabinet.status)}
                    {cabinet.status}
                  </div>
                </Badge>
              </div>
              <CardDescription>
                Location: {cabinet.location}
                <br />
                Access Method: {cabinet.access_method}
                <br />
                Last Access: {new Date(cabinet.last_access).toLocaleString()}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Access Controls */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  {getAccessMethodIcon(cabinet.access_method)}
                  Access Controls
                </h4>
                
                <div className="grid gap-2">
                  {cabinet.access_method === 'RFID' && (
                    <Button
                      onClick={() => simulateRFIDScan(cabinet.id)}
                      disabled={cabinet.status === 'unlocked'}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Scan RFID Badge
                    </Button>
                  )}
                  
                  {cabinet.access_method === 'NFC' && (
                    <Button
                      onClick={() => simulateNFCTap(cabinet.id)}
                      disabled={cabinet.status === 'unlocked'}
                      className="w-full"
                    >
                      <Smartphone className="h-4 w-4 mr-2" />
                      NFC Tap
                    </Button>
                  )}
                  
                  {cabinet.access_method === 'Biometric' && (
                    <Button
                      onClick={() => simulateBiometric(cabinet.id)}
                      disabled={cabinet.status === 'unlocked'}
                      className="w-full"
                    >
                      <Fingerprint className="h-4 w-4 mr-2" />
                      Scan Fingerprint
                    </Button>
                  )}
                </div>
              </div>

              {/* Authorized Users */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Authorized Users ({cabinet.authorized_users.length})
                </h4>
                <div className="flex flex-wrap gap-1">
                  {cabinet.authorized_users.map((user, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {user}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Inventory Items */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Inventory Items ({cabinet.inventory_items.length})
                </h4>
                <div className="space-y-1">
                  {cabinet.inventory_items.map((item, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Access Log */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Access
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedCabinet(
                      selectedCabinet === cabinet.id ? null : cabinet.id
                    )}
                  >
                    {selectedCabinet === cabinet.id ? 'Hide' : 'Show'} Log
                  </Button>
                </h4>
                
                {selectedCabinet === cabinet.id && (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cabinet.access_log.length > 0 ? (
                          cabinet.access_log.map((log) => (
                            <TableRow key={log.id}>
                              <TableCell className="font-medium">{log.user_name}</TableCell>
                              <TableCell>
                                <Badge 
                                  variant={log.action === 'unlock' ? 'default' : 'destructive'}
                                  className="text-xs"
                                >
                                  {log.action}
                                </Badge>
                              </TableCell>
                              <TableCell>{log.method}</TableCell>
                              <TableCell className="text-xs">
                                {new Date(log.timestamp).toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              No access records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};