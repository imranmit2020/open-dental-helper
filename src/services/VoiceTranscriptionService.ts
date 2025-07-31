interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  medicalTerms: string[];
  anxietyLevel: number;
  painIndicators: string[];
}

export class VoiceTranscriptionService {
  private recognition: any | null = null;
  private isListening = false;
  private medicalTermsDict = [
    'cavity', 'filling', 'crown', 'root canal', 'extraction', 'periodontal',
    'gingivitis', 'plaque', 'tartar', 'orthodontics', 'braces', 'implant',
    'veneer', 'whitening', 'fluoride', 'anesthesia', 'novocaine', 'wisdom teeth'
  ];

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';
  }

  async startListening(onResult: (result: VoiceRecognitionResult) => void): Promise<void> {
    if (!this.recognition || this.isListening) return;

    this.isListening = true;
    
    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      const result = this.analyzeTranscript(fullTranscript, event.results[0][0].confidence || 0.8);
      onResult(result);
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.start();
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  private analyzeTranscript(transcript: string, confidence: number): VoiceRecognitionResult {
    const lowerTranscript = transcript.toLowerCase();
    
    // Detect medical terms
    const medicalTerms = this.medicalTermsDict.filter(term => 
      lowerTranscript.includes(term)
    );

    // Analyze anxiety level based on speech patterns
    const anxietyKeywords = ['nervous', 'scared', 'worried', 'anxious', 'afraid', 'uncomfortable'];
    const anxietyScore = anxietyKeywords.reduce((score, keyword) => {
      return score + (lowerTranscript.includes(keyword) ? 0.2 : 0);
    }, 0);

    // Detect pain indicators
    const painKeywords = ['hurt', 'pain', 'ache', 'sore', 'sensitive', 'throb', 'sharp', 'dull'];
    const painIndicators = painKeywords.filter(keyword => 
      lowerTranscript.includes(keyword)
    );

    return {
      transcript,
      confidence,
      medicalTerms,
      anxietyLevel: Math.min(anxietyScore, 1),
      painIndicators
    };
  }

  isSupported(): boolean {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}