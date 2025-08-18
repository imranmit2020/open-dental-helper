import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Search, 
  Filter, 
  Edit, 
  Eye, 
  User,
  Clock,
  FileText,
  Target
} from "lucide-react";
import { format } from "date-fns";
import type { ChartingEntry } from "@/types/dental";

interface ChartingHistoryProps {
  entries: ChartingEntry[];
  onEditEntry: (entry: ChartingEntry) => void;
}

export function ChartingHistory({ entries, onEditEntry }: ChartingHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.toothNumber.toString().includes(searchTerm) ||
      entry.condition.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.treatment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.notes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || entry.severity === severityFilter;
    const matchesCondition = conditionFilter === "all" || entry.condition === conditionFilter;
    
    return matchesSearch && matchesSeverity && matchesCondition;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  const uniqueConditions = Array.from(new Set(entries.map(entry => entry.condition)));

  return (
    <Card className="professional-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Charting History
        </CardTitle>
        <CardDescription>
          Complete history of dental charting entries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severity</SelectItem>
              <SelectItem value="mild">Mild</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="severe">Severe</SelectItem>
            </SelectContent>
          </Select>

          <Select value={conditionFilter} onValueChange={setConditionFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Conditions</SelectItem>
              {uniqueConditions.map(condition => (
                <SelectItem key={condition} value={condition}>
                  {condition.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Entries List */}
        <div className="space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No charting entries found matching your criteria.</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover-lift border border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-primary" />
                          <span className="font-medium">Tooth {entry.toothNumber}</span>
                        </div>
                        <Badge variant="outline" className={getSeverityColor(entry.severity)}>
                          {entry.severity}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(entry.date, "MMM d, yyyy")}
                        </div>
                      </div>

                      {/* Condition & Treatment */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-xs text-muted-foreground">Condition:</span>
                          <p className="text-sm font-medium">{entry.condition.replace("_", " ")}</p>
                        </div>
                        {entry.treatment && (
                          <div>
                            <span className="text-xs text-muted-foreground">Treatment:</span>
                            <p className="text-sm font-medium">{entry.treatment.replace("_", " ")}</p>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {entry.notes && (
                        <div>
                          <span className="text-xs text-muted-foreground">Notes:</span>
                          <p className="text-sm text-muted-foreground">{entry.notes}</p>
                        </div>
                      )}

                      {/* Dentist */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>by {entry.dentistName}</span>
                        <Clock className="h-3 w-3 ml-2" />
                        <span>{format(entry.date, "HH:mm")}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditEntry(entry)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center pt-4 border-t text-sm text-muted-foreground">
          <span>Showing {filteredEntries.length} of {entries.length} entries</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-destructive"></div>
              Severe: {entries.filter(e => e.severity === "severe").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning"></div>
              Moderate: {entries.filter(e => e.severity === "moderate").length}
            </span>
            <span className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              Mild: {entries.filter(e => e.severity === "mild").length}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}