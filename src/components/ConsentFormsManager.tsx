import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PatientConsentForm } from "./PatientConsentForm";
import { 
  FileText, 
  Search, 
  Calendar, 
  User, 
  Download,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

interface ConsentRecord {
  id: string;
  patientName: string;
  treatmentType: string;
  submittedAt: string;
  status: 'completed' | 'pending' | 'expired';
  signature: string;
  date: string;
}

export const ConsentFormsManager: React.FC = () => {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([
    {
      id: "1",
      patientName: "John Doe",
      treatmentType: "Root Canal Treatment",
      submittedAt: "2024-01-15T10:30:00Z",
      status: "completed",
      signature: "John Doe",
      date: "2024-01-15"
    },
    {
      id: "2",
      patientName: "Jane Smith",
      treatmentType: "Dental Cleaning",
      submittedAt: "2024-01-14T14:20:00Z",
      status: "completed",
      signature: "Jane Smith",
      date: "2024-01-14"
    },
    {
      id: "3",
      patientName: "Mike Johnson",
      treatmentType: "Crown Placement",
      submittedAt: "2024-01-13T09:15:00Z",
      status: "pending",
      signature: "",
      date: ""
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");

  const handleConsentSubmitted = (consentData: any) => {
    const newRecord: ConsentRecord = {
      id: Date.now().toString(),
      patientName: consentData.patientName,
      treatmentType: consentData.treatmentType,
      submittedAt: new Date().toISOString(),
      status: "completed",
      signature: consentData.signature,
      date: consentData.date
    };
    
    setConsentRecords(prev => [newRecord, ...prev]);
  };

  const filteredRecords = consentRecords.filter(record =>
    record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.treatmentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Consent Forms</h2>
          <p className="text-muted-foreground">
            Manage patient consent forms and treatment agreements
          </p>
        </div>
        <PatientConsentForm onConsentSubmitted={handleConsentSubmitted} />
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Forms</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="expired">Expired</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name or treatment type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          <ConsentRecordsList records={filteredRecords} />
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <ConsentRecordsList 
            records={filteredRecords.filter(r => r.status === 'completed')} 
          />
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <ConsentRecordsList 
            records={filteredRecords.filter(r => r.status === 'pending')} 
          />
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <ConsentRecordsList 
            records={filteredRecords.filter(r => r.status === 'expired')} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ConsentRecordsListProps {
  records: ConsentRecord[];
}

const ConsentRecordsList: React.FC<ConsentRecordsListProps> = ({ records }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'expired':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-medium">No consent forms found</p>
            <p className="text-muted-foreground">No consent forms match your current filter.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(record.status)}
                  <Badge variant={getStatusVariant(record.status)}>
                    {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{record.patientName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span>{record.treatmentType}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(record.submittedAt).toLocaleDateString()} at{' '}
                      {new Date(record.submittedAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};