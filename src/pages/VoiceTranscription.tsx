import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Brain, Activity, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { VoiceTranscriptionService } from '@/services/VoiceTranscriptionService';

interface TranscriptionResult {
  transcript: string;
  confidence: number;
  medicalTerms: string[];
  anxietyLevel: number;
  painIndicators: string[];
}

export const VoiceTranscription: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcriptionService] = useState(() => new VoiceTranscriptionService());
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [results, setResults] = useState<TranscriptionResult[]>([]);
  const [isSupported, setIsSupported] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setIsSupported(transcriptionService.isSupported());
  }, []);

  const handleStartListening = async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsListening(true);
      await transcriptionService.startListening((result) => {
        setCurrentTranscript(result.transcript);
        if (result.transcript.trim()) {
          setResults(prev => {
            const newResults = [...prev, result];
            return newResults.slice(-10); // Keep last 10 results
          });
        }
      });
    } catch (error) {
      console.error('Error starting voice recognition:', error);
      toast({
        title: "Error",
        description: "Failed to start voice recognition",
        variant: "destructive"
      });
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    transcriptionService.stopListening();
    setIsListening(false);
    setCurrentTranscript('');
  };

  const getAnxietyColor = (level: number) => {
    if (level < 0.3) return 'text-success';
    if (level < 0.6) return 'text-warning';
    return 'text-destructive';
  };

  const getAnxietyText = (level: number) => {
    if (level < 0.3) return 'Calm';
    if (level < 0.6) return 'Moderate Anxiety';
    return 'High Anxiety';
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">AI Voice Transcription</h1>
        <p className="text-lg text-muted-foreground">
          Revolutionary hands-free documentation with medical terminology recognition
        </p>
      </div>

      {/* Control Panel */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Voice Recognition Control
          </CardTitle>
          <CardDescription>
            Click to start real-time voice transcription with medical analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={isListening ? handleStopListening : handleStartListening}
              disabled={!isSupported}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              className={isListening ? "animate-pulse" : ""}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5 mr-2" />
                  Start Listening
                </>
              )}
            </Button>
          </div>

          {!isSupported && (
            <div className="text-center p-4 bg-warning/10 rounded-lg border border-warning/20">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-warning" />
              <p className="text-warning">
                Speech recognition is not supported in your browser. 
                Please use Chrome, Edge, or Safari for the best experience.
              </p>
            </div>
          )}

          {/* Current Transcript */}
          {isListening && (
            <Card className="bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <CardTitle className="text-lg">Live Transcription</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-medium min-h-[60px] p-3 bg-background/50 rounded border">
                  {currentTranscript || "Listening..."}
                </p>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-6">
        <h2 className="text-2xl font-bold">Transcription Results</h2>
        
        {results.length === 0 ? (
          <Card className="professional-card">
            <CardContent className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Transcriptions Yet</h3>
              <p className="text-muted-foreground">
                Start voice recognition to see real-time medical transcription with AI analysis
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {results.map((result, index) => (
              <Card key={index} className="professional-card hover-lift">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Transcription #{results.length - index}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Confidence: {Math.round(result.confidence * 100)}%
                      </Badge>
                      <Badge className={getAnxietyColor(result.anxietyLevel)}>
                        {getAnxietyText(result.anxietyLevel)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Transcript */}
                  <div>
                    <h4 className="font-semibold mb-2">Transcript:</h4>
                    <p className="p-3 bg-muted/50 rounded border">
                      {result.transcript}
                    </p>
                  </div>

                  {/* Analysis Grid */}
                  <div className="grid md:grid-cols-3 gap-4">
                    {/* Medical Terms */}
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Brain className="w-4 h-4" />
                        Medical Terms
                      </h4>
                      <div className="space-y-1">
                        {result.medicalTerms.length > 0 ? (
                          result.medicalTerms.map((term, i) => (
                            <Badge key={i} variant="secondary" className="mr-1">
                              {term}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">None detected</p>
                        )}
                      </div>
                    </div>

                    {/* Anxiety Level */}
                    <div>
                      <h4 className="font-semibold mb-2">Anxiety Level</h4>
                      <div className="space-y-2">
                        <Progress value={result.anxietyLevel * 100} className="h-2" />
                        <p className={`text-sm ${getAnxietyColor(result.anxietyLevel)}`}>
                          {Math.round(result.anxietyLevel * 100)}% - {getAnxietyText(result.anxietyLevel)}
                        </p>
                      </div>
                    </div>

                    {/* Pain Indicators */}
                    <div>
                      <h4 className="font-semibold mb-2">Pain Indicators</h4>
                      <div className="space-y-1">
                        {result.painIndicators.length > 0 ? (
                          result.painIndicators.map((indicator, i) => (
                            <Badge key={i} variant="destructive" className="mr-1">
                              {indicator}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">None detected</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};