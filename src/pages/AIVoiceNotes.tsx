import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, FileText, Brain } from "lucide-react";

export default function AIVoiceNotes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">AI Voice Notes</h1>
        <p className="text-muted-foreground">Hands-free clinical documentation with AI transcription</p>
      </div>

      <Card className="text-center p-8">
        <CardContent>
          <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6">
            <Mic className="h-12 w-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Start Voice Recording</h2>
          <p className="text-muted-foreground mb-6">Record your clinical notes hands-free. AI will transcribe and organize them automatically.</p>
          <Button size="lg" className="bg-gradient-to-r from-primary to-secondary text-white">
            <Mic className="h-5 w-5 mr-2" />
            Start Recording
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}