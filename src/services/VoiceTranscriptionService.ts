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
  private lastProcessedTime = 0;
  private medicalTermsDict = [
    'cavity', 'filling', 'crown', 'root canal', 'extraction', 'periodontal',
    'gingivitis', 'plaque', 'tartar', 'orthodontics', 'braces', 'implant',
    'veneer', 'whitening', 'fluoride', 'anesthesia', 'novocaine', 'wisdom teeth',
    'molar', 'incisor', 'canine', 'premolar', 'enamel', 'dentine', 'pulp',
    'gums', 'bite', 'occlusion', 'x-ray', 'cleaning', 'checkup', 'appointment'
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
    this.recognition.maxAlternatives = 1;
    
    // Optimize for faster processing
    if ('webkitSpeechRecognition' in window) {
      this.recognition.serviceURI = 'wss://www.google.com/speech-api/v2/recognize';
    }
  }

  async startListening(onResult: (result: VoiceRecognitionResult) => void): Promise<void> {
    if (!this.recognition || this.isListening) return;

    this.isListening = true;
    this.lastProcessedTime = Date.now();
    
    this.recognition.onresult = (event) => {
      const now = Date.now();
      
      // Throttle processing to avoid excessive calls
      if (now - this.lastProcessedTime < 100) return;
      this.lastProcessedTime = now;

      let finalTranscript = '';
      let interimTranscript = '';
      let bestConfidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const confidence = event.results[i][0].confidence || 0.8;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
          bestConfidence = Math.max(bestConfidence, confidence);
        } else {
          interimTranscript += transcript;
          bestConfidence = Math.max(bestConfidence, confidence * 0.7); // Lower confidence for interim
        }
      }

      const fullTranscript = finalTranscript || interimTranscript;
      if (fullTranscript.trim().length > 2) { // Only process meaningful content
        const result = this.analyzeTranscript(fullTranscript, bestConfidence);
        onResult(result);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      
      // Auto-restart on network errors
      if (event.error === 'network' && this.isListening) {
        setTimeout(() => {
          if (this.isListening) {
            this.recognition.start();
          }
        }, 1000);
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      
      // Auto-restart if still supposed to be listening
      if (this.isListening) {
        setTimeout(() => {
          if (this.isListening) {
            this.recognition.start();
          }
        }, 100);
      }
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
    
    // Optimized medical terms detection using regex for better performance
    const medicalTerms = this.medicalTermsDict.filter(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      return regex.test(transcript);
    });

    // Enhanced anxiety analysis with more keywords
    const anxietyKeywords = [
      'nervous', 'scared', 'worried', 'anxious', 'afraid', 'uncomfortable',
      'panic', 'stress', 'tense', 'uneasy', 'concerned', 'apprehensive'
    ];
    
    let anxietyScore = 0;
    const words = lowerTranscript.split(/\s+/);
    
    anxietyKeywords.forEach(keyword => {
      const matches = words.filter(word => word.includes(keyword)).length;
      anxietyScore += matches * 0.15; // Reduced multiplier for better balance
    });

    // Enhanced pain detection with severity indicators
    const painKeywords = [
      'hurt', 'pain', 'ache', 'sore', 'sensitive', 'throb', 'sharp', 'dull',
      'burning', 'stabbing', 'tender', 'inflamed', 'swollen', 'uncomfortable'
    ];
    
    const painIndicators = painKeywords.filter(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(transcript);
    });

    return {
      transcript: transcript.trim(),
      confidence: Math.max(0.1, Math.min(1, confidence)), // Ensure valid range
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