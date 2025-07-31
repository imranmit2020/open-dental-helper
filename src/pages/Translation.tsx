import React, { useState } from 'react';
import { Languages, FileText, Mic, Volume2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { TranslationService } from '@/services/TranslationService';

interface TranslationResult {
  translatedText: string;
  confidence: number;
  detectedLanguage: string;
  medicalTermsPreserved: boolean;
}

export const Translation: React.FC = () => {
  const [sourceText, setSourceText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationService] = useState(() => new TranslationService());
  const { toast } = useToast();

  const supportedLanguages = translationService.getSupportedLanguages();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translationService.translateText(
        sourceText,
        targetLanguage,
        sourceLanguage === 'auto' ? undefined : sourceLanguage
      );
      
      setTranslationResult(result);
      toast({
        title: "Translation Complete",
        description: `Text translated to ${supportedLanguages[targetLanguage]}`,
      });
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleMedicalDocumentTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate",
        variant: "destructive",
      });
      return;
    }

    setIsTranslating(true);
    try {
      const result = await translationService.translateMedicalDocument(
        sourceText,
        targetLanguage
      );
      
      setTranslationResult(result);
      toast({
        title: "Medical Translation Complete",
        description: "Medical document translated with term preservation",
      });
    } catch (error) {
      console.error('Medical translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Unable to translate medical document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranslating(false);
    }
  };

  const speakText = (text: string, language: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : `${language}-${language.toUpperCase()}`;
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Not Supported",
        description: "Text-to-speech is not supported in your browser",
        variant: "destructive",
      });
    }
  };

  const sampleTexts = {
    'appointment': "Your appointment is scheduled for tomorrow at 2 PM. Please arrive 15 minutes early and bring your insurance card.",
    'treatment': "The root canal procedure will take about 90 minutes. You may experience some sensitivity for a few days after treatment.",
    'instructions': "Brush your teeth twice daily with fluoride toothpaste. Floss regularly and avoid hard or sticky foods for the next week.",
    'emergency': "If you experience severe pain or swelling, please contact our office immediately. We have 24-hour emergency support available."
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold gradient-text">Real-Time Translation</h1>
        <p className="text-lg text-muted-foreground">
          Professional medical translation with cultural context and terminology preservation
        </p>
      </div>

      {/* Translation Controls */}
      <Card className="professional-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Translation Setup
          </CardTitle>
          <CardDescription>
            Configure source and target languages for medical translation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From Language</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto-detect</SelectItem>
                  {Object.entries(supportedLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">To Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(supportedLanguages).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input and Output */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Source Text */}
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Source Text
            </CardTitle>
            <CardDescription>
              Enter the text you want to translate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-32"
            />
            
            <div className="flex gap-2">
              <Button
                onClick={handleTranslate}
                disabled={isTranslating}
                className="flex-1"
              >
                <Languages className="w-4 h-4 mr-2" />
                {isTranslating ? 'Translating...' : 'Translate'}
              </Button>
              <Button
                onClick={handleMedicalDocumentTranslate}
                disabled={isTranslating}
                variant="outline"
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                Medical Translation
              </Button>
            </div>

            {/* Sample Texts */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Samples:</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(sampleTexts).map(([key, text]) => (
                  <Button
                    key={key}
                    variant="ghost"
                    size="sm"
                    onClick={() => setSourceText(text)}
                    className="text-xs h-auto p-2 justify-start"
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Translation Result */}
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Translation Result
            </CardTitle>
            <CardDescription>
              Professional medical translation with quality metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {translationResult ? (
              <>
                <div className="space-y-4">
                  {/* Translation Text */}
                  <div className="p-4 bg-muted/50 rounded border min-h-32">
                    <p className="text-lg">{translationResult.translatedText}</p>
                  </div>

                  {/* Quality Metrics */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">
                      Confidence: {Math.round(translationResult.confidence * 100)}%
                    </Badge>
                    <Badge variant="outline">
                      Detected: {supportedLanguages[translationResult.detectedLanguage] || translationResult.detectedLanguage}
                    </Badge>
                    <Badge 
                      className={translationResult.medicalTermsPreserved ? 'bg-success text-success-foreground' : 'bg-warning text-warning-foreground'}
                    >
                      Medical Terms: {translationResult.medicalTermsPreserved ? 'Preserved' : 'Check Required'}
                    </Badge>
                  </div>

                  {/* Audio Controls */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => speakText(translationResult.translatedText, targetLanguage)}
                      variant="outline"
                      size="sm"
                    >
                      <Volume2 className="w-4 h-4 mr-1" />
                      Play Audio
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="min-h-32 flex items-center justify-center bg-muted/50 rounded border">
                <div className="text-center">
                  <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Translation will appear here
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="w-5 h-5 text-primary" />
              Medical Terminology
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preserves medical terms and ensures accurate translation of dental and healthcare terminology.
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-secondary" />
              Cultural Context
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Adds cultural considerations and appropriate phrasing for different regions and patient populations.
            </p>
          </CardContent>
        </Card>

        <Card className="professional-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="w-5 h-5 text-info" />
              Audio Playback
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Text-to-speech functionality helps with pronunciation and assists patients who prefer audio communication.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};