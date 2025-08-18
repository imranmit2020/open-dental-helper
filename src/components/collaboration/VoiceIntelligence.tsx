import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { 
  Mic, MicOff, Brain, Volume2, VolumeX, Zap, 
  Activity, MessageSquare, Sparkles, Bot, 
  Languages, Headphones, Waves, Radio
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VoiceAnalysis {
  emotion: 'calm' | 'excited' | 'stressed' | 'focused';
  confidence: number;
  clarity: number;
  speed: number;
  keywords: string[];
}

interface TranscriptionChunk {
  id: string;
  text: string;
  timestamp: number;
  speaker: string;
  analysis: VoiceAnalysis;
  aiSuggestion?: string;
}

export const VoiceIntelligence = () => {
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [realTimeMode, setRealTimeMode] = useState(true);
  const [emotionAnalysis, setEmotionAnalysis] = useState(true);
  const [multiLanguage, setMultiLanguage] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [spatialAudio, setSpatialAudio] = useState(false);
  
  const [currentAnalysis, setCurrentAnalysis] = useState<VoiceAnalysis>({
    emotion: 'calm',
    confidence: 85,
    clarity: 92,
    speed: 150, // words per minute
    keywords: ['dental', 'patient', 'treatment']
  });
  
  const [transcriptions, setTranscriptions] = useState<TranscriptionChunk[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  // Simulate real-time audio analysis
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setCurrentAnalysis(prev => ({
        ...prev,
        confidence: Math.max(70, Math.min(100, prev.confidence + (Math.random() - 0.5) * 10)),
        clarity: Math.max(80, Math.min(100, prev.clarity + (Math.random() - 0.5) * 5)),
        speed: Math.max(100, Math.min(200, prev.speed + (Math.random() - 0.5) * 20)),
        emotion: Math.random() > 0.8 ? 
          (['calm', 'excited', 'stressed', 'focused'] as const)[Math.floor(Math.random() * 4)] : 
          prev.emotion
      }));
      
      setAudioLevel(Math.random() * 100);
    }, 500);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          
          // Real-time transcription simulation
          if (realTimeMode) {
            simulateRealTimeTranscription();
          }
        }
      };

      mediaRecorder.onstop = () => {
        if (!realTimeMode) {
          processFullTranscription();
        }
      };

      mediaRecorder.start(1000); // Capture data every second
      setIsRecording(true);
      
      toast({
        title: "🎙️ Neural Voice Capture Started",
        description: "AI is analyzing your voice patterns in real-time",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Could not access microphone",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setAudioLevel(0);
      
      toast({
        title: "Recording Stopped",
        description: "Processing neural analysis...",
      });
    }
  };

  const simulateRealTimeTranscription = () => {
    const sampleTexts = [
      "Patient shows signs of mild anxiety about the procedure",
      "Treatment plan should include preventive care recommendations", 
      "Schedule follow-up appointment in two weeks",
      "X-ray results indicate normal tooth development",
      "Patient education about oral hygiene is recommended"
    ];
    
    const newTranscription: TranscriptionChunk = {
      id: Date.now().toString(),
      text: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
      timestamp: Date.now(),
      speaker: "Current User",
      analysis: { ...currentAnalysis },
      aiSuggestion: aiSuggestions ? generateAISuggestion() : undefined
    };
    
    setTranscriptions(prev => [...prev.slice(-4), newTranscription]);
  };

  const processFullTranscription = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    setIsTranscribing(true);
    
    try {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const base64Audio = await blobToBase64(audioBlob);
      
      // Call Supabase Edge Function for transcription
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });
      
      if (error) throw error;
      
      const newTranscription: TranscriptionChunk = {
        id: Date.now().toString(),
        text: data.text || "Transcription completed",
        timestamp: Date.now(),
        speaker: "Current User",
        analysis: { ...currentAnalysis },
        aiSuggestion: aiSuggestions ? generateAISuggestion() : undefined
      };
      
      setTranscriptions(prev => [...prev, newTranscription]);
      
      toast({
        title: "🧠 Transcription Complete",
        description: "Neural analysis processed successfully",
      });
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription Error", 
        description: "Failed to process audio",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateAISuggestion = (): string => {
    const suggestions = [
      "💡 Consider scheduling a follow-up discussion",
      "🎯 This indicates high patient engagement", 
      "⚡ Suggest adding this to patient notes",
      "🔍 May require additional investigation",
      "✨ Excellent communication detected"
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const playTextToSpeech = async (text: string) => {
    try {
      setIsPlaying(true);
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text: text,
          voice: 'alloy' // Neural voice
        }
      });
      
      if (error) throw error;
      
      // Play the audio
      const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
      audio.onended = () => setIsPlaying(false);
      await audio.play();
      
      toast({
        title: "🔊 Neural Voice Synthesis",
        description: "Playing AI-generated speech",
      });
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsPlaying(false);
      toast({
        title: "Speech Error",
        description: "Could not generate speech",
        variant: "destructive",
      });
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:audio/webm;base64, prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const clearTranscriptions = () => {
    setTranscriptions([]);
    toast({
      title: "Transcriptions Cleared",
      description: "Neural memory reset",
    });
  };

  return (
    <Card className="w-full bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 text-white border-green-500">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="h-6 w-6 text-green-400" />
            Neural Voice Intelligence
            <Brain className="h-5 w-5 text-blue-400 animate-pulse" />
          </div>
          <Badge variant="secondary" className="animate-pulse">
            <Activity className="h-3 w-3 mr-1" />
            AI Listening
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Voice Controls */}
        <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-green-600">
          <div className="flex gap-3">
            <Button
              variant={isRecording ? "destructive" : "default"}
              size="lg"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isTranscribing}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              {isRecording ? <MicOff className="h-5 w-5 mr-2" /> : <Mic className="h-5 w-5 mr-2" />}
              {isRecording ? "Stop Neural Capture" : "Start Neural Capture"}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearTranscriptions}
              disabled={isRecording}
            >
              Clear Memory
            </Button>
          </div>
          
          {/* Audio Level Indicator */}
          {isRecording && (
            <div className="flex items-center gap-2">
              <Waves className="h-4 w-4 text-green-400" />
              <Progress value={audioLevel} className="w-24 h-2" />
              <span className="text-xs text-green-300">{Math.round(audioLevel)}%</span>
            </div>
          )}
        </div>

        {/* AI Settings */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-600">
            <span className="text-sm">Real-time</span>
            <Switch checked={realTimeMode} onCheckedChange={setRealTimeMode} />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-600">
            <span className="text-sm">Emotions</span>
            <Switch checked={emotionAnalysis} onCheckedChange={setEmotionAnalysis} />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-600">
            <span className="text-sm">Multi-Lang</span>
            <Switch checked={multiLanguage} onCheckedChange={setMultiLanguage} />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded border border-slate-600">
            <span className="text-sm">AI Assist</span>
            <Switch checked={aiSuggestions} onCheckedChange={setAiSuggestions} />
          </div>
        </div>

        {/* Real-time Analysis */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-900/50 to-blue-800/50 p-3 rounded border border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-300">Confidence</span>
              <Activity className="h-4 w-4 text-blue-400" />
            </div>
            <div className="text-lg font-bold text-blue-400">{currentAnalysis.confidence}%</div>
            <Progress value={currentAnalysis.confidence} className="h-1 mt-1" />
          </div>
          
          <div className="bg-gradient-to-r from-green-900/50 to-green-800/50 p-3 rounded border border-green-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-green-300">Clarity</span>
              <Radio className="h-4 w-4 text-green-400" />
            </div>
            <div className="text-lg font-bold text-green-400">{currentAnalysis.clarity}%</div>
            <Progress value={currentAnalysis.clarity} className="h-1 mt-1" />
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/50 to-purple-800/50 p-3 rounded border border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-purple-300">Speed</span>
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-lg font-bold text-purple-400">{currentAnalysis.speed}</div>
            <div className="text-xs text-purple-300">WPM</div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 p-3 rounded border border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-yellow-300">Emotion</span>
              <Sparkles className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="text-lg font-bold text-yellow-400 capitalize">{currentAnalysis.emotion}</div>
            <div className="text-xs text-yellow-300">AI Detected</div>
          </div>
        </div>

        {/* Transcription Feed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-green-300">Neural Transcription Feed</h4>
            {isTranscribing && (
              <Badge variant="secondary" className="animate-pulse">
                <Brain className="h-3 w-3 mr-1" />
                Processing...
              </Badge>
            )}
          </div>
          
          <div className="max-h-64 overflow-y-auto space-y-3 p-3 bg-slate-800/30 rounded border border-slate-600">
            {transcriptions.length === 0 ? (
              <div className="text-center text-slate-400 py-8">
                <Headphones className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Start recording to see AI transcriptions</p>
              </div>
            ) : (
              transcriptions.map(transcript => (
                <div key={transcript.id} className="space-y-2 p-3 bg-slate-700/50 rounded border border-slate-500">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {transcript.speaker}
                        </Badge>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            transcript.analysis.emotion === 'excited' ? 'bg-yellow-900/50 text-yellow-300' :
                            transcript.analysis.emotion === 'stressed' ? 'bg-red-900/50 text-red-300' :
                            transcript.analysis.emotion === 'focused' ? 'bg-blue-900/50 text-blue-300' :
                            'bg-green-900/50 text-green-300'
                          }`}
                        >
                          {transcript.analysis.emotion}
                        </Badge>
                        <span className="text-xs text-slate-400">
                          {new Date(transcript.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white mb-2">{transcript.text}</p>
                      
                      {transcript.aiSuggestion && (
                        <div className="p-2 bg-blue-900/30 rounded border border-blue-700">
                          <div className="flex items-start gap-2">
                            <Bot className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-blue-300">{transcript.aiSuggestion}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => playTextToSpeech(transcript.text)}
                      disabled={isPlaying}
                      className="ml-2"
                    >
                      {isPlaying ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Keywords Analysis */}
        {currentAnalysis.keywords.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-green-300">AI Detected Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {currentAnalysis.keywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs border-green-500 text-green-300">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};