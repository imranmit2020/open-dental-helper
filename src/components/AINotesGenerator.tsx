import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Sparkles, 
  Copy, 
  RefreshCw, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AINotesGeneratorProps {
  procedure: string;
  toothNumber: number;
  priority: string;
  notes: string;
  onNotesChange: (notes: string) => void;
  patientId?: string;
  chartingHistory?: any[];
}

export function AINotesGenerator({
  procedure,
  toothNumber,
  priority,
  notes,
  onNotesChange,
  patientId,
  chartingHistory
}: AINotesGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateNotes = async () => {
    if (!procedure || !toothNumber) {
      toast.error("Please select a procedure and tooth number first");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-treatment-notes', {
        body: {
          procedure,
          toothNumber,
          priority,
          patientContext: `Patient ID: ${patientId}`,
          chartingHistory: chartingHistory?.slice(0, 3).map(entry => 
            `${entry.toothNumber}: ${entry.condition} - ${entry.treatment || 'No treatment'}`
          ).join('; ')
        }
      });

      if (error) throw error;

      if (data?.notes) {
        onNotesChange(data.notes);
        toast.success("AI notes generated successfully!");
        
        // Generate quick suggestions
        generateQuickSuggestions();
      }
    } catch (error) {
      console.error('Error generating notes:', error);
      toast.error("Failed to generate AI notes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuickSuggestions = () => {
    const suggestions = [
      `Consider pre-operative radiographs for tooth ${toothNumber}`,
      `Monitor for signs of infection or complications`,
      `Schedule follow-up appointment in 1-2 weeks`,
      `Patient education on post-procedure care`,
      `Document any allergies or medical contraindications`
    ];
    
    setAiSuggestions(suggestions);
    setShowSuggestions(true);
  };

  const applySuggestion = (suggestion: string) => {
    const currentNotes = notes || "";
    const newNotes = currentNotes ? `${currentNotes}\n\n• ${suggestion}` : `• ${suggestion}`;
    onNotesChange(newNotes);
    toast.success("Suggestion added to notes");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      toast.success("Notes copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy notes");
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "high":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-success" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Generation Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Treatment Notes</span>
          {procedure && (
            <Badge variant="outline" className="text-xs">
              {getPriorityIcon()}
              <span className="ml-1">{procedure}</span>
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateNotes}
            disabled={isGenerating || !procedure}
            className="btn-gradient-outline"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1" />
                Generate Notes
              </>
            )}
          </Button>
          {notes && (
            <Button
              variant="ghost"
              size="sm"
              onClick={copyToClipboard}
              className="h-8"
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Notes Textarea */}
      <Textarea
        placeholder="Treatment notes will appear here... Or click 'Generate Notes' for AI assistance"
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        rows={4}
        className="min-h-24"
      />

      {/* AI Suggestions */}
      {showSuggestions && aiSuggestions.length > 0 && (
        <Card className="border-dashed border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">AI Suggestions</span>
            </div>
            <div className="space-y-1">
              {aiSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xs">{suggestion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => applySuggestion(suggestion)}
                    className="h-6 px-2 text-xs"
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(false)}
              className="w-full mt-2 h-6 text-xs"
            >
              Hide Suggestions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Smart Templates */}
      <div className="flex gap-1 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => generateQuickSuggestions()}
          className="h-6 px-2 text-xs"
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Quick Suggestions
        </Button>
      </div>
    </div>
  );
}