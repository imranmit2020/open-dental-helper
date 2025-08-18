import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Circle, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Edit
} from "lucide-react";
import { format } from "date-fns";
import type { ToothData } from "@/types/dental";

interface ToothDetailsProps {
  tooth?: ToothData;
  toothNumber: number;
}

export function ToothDetails({ tooth, toothNumber }: ToothDetailsProps) {
  if (!tooth) {
    return (
      <Card className="professional-card">
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="h-5 w-5" />
          Tooth {toothNumber}
        </CardTitle>
          <CardDescription>No records found for this tooth</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <Circle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>This tooth has no recorded conditions or treatments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (tooth.status) {
      case "treated":
        return <CheckCircle className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-info" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-warning" />;
    }
  };

  const getStatusColor = () => {
    switch (tooth.status) {
      case "treated":
        return "bg-success/10 text-success border-success/20";
      case "in_progress":
        return "bg-info/10 text-info border-info/20";
      default:
        return "bg-warning/10 text-warning border-warning/20";
    }
  };

  const getSeverityColor = () => {
    switch (tooth.severity) {
      case "severe":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "moderate":
        return "bg-warning/10 text-warning border-warning/20";
      case "mild":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Circle className="h-5 w-5" />
          Tooth {tooth.number}
        </CardTitle>
        <CardDescription>{tooth.name}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status</span>
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{tooth.status.replace("_", " ")}</span>
          </Badge>
        </div>

        {/* Severity */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Severity</span>
          <Badge variant="outline" className={getSeverityColor()}>
            <span className="capitalize">{tooth.severity}</span>
          </Badge>
        </div>

        {/* Conditions */}
        {tooth.conditions.length > 0 && (
          <div>
            <span className="text-sm font-medium">Conditions</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tooth.conditions.map((condition, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {condition.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Treatments */}
        {tooth.treatments.length > 0 && (
          <div>
            <span className="text-sm font-medium">Treatments</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {tooth.treatments.map((treatment, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {treatment.replace("_", " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {tooth.notes && (
          <div>
            <span className="text-sm font-medium flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Notes
            </span>
            <p className="text-sm text-muted-foreground mt-1 p-2 bg-muted/50 rounded-md">
              {tooth.notes}
            </p>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Last Updated
          </span>
          <span>{format(tooth.lastUpdated, "MMM d, yyyy")}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <FileText className="h-3 w-3 mr-1" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}