interface TranslationResult {
  translatedText: string;
  confidence: number;
  detectedLanguage: string;
  medicalTermsPreserved: boolean;
}

export class TranslationService {
  private supportedLanguages = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'zh': 'Chinese',
    'ja': 'Japanese',
    'ar': 'Arabic'
  };

  private medicalTerms = {
    'en': {
      'tooth': ['diente', 'dent', 'Zahn', 'dente', 'зуб'],
      'cavity': ['caries', 'carie', 'Karies', 'carie', 'кариес'],
      'filling': ['empaste', 'plombage', 'Füllung', 'otturazione', 'пломба'],
      'crown': ['corona', 'couronne', 'Krone', 'corona', 'коронка'],
      'root canal': ['endodoncia', 'traitement de canal', 'Wurzelbehandlung', 'canalare', 'корневой канал'],
      'extraction': ['extracción', 'extraction', 'Extraktion', 'estrazione', 'удаление'],
      'cleaning': ['limpieza', 'nettoyage', 'Reinigung', 'pulizia', 'чистка'],
      'examination': ['examen', 'examen', 'Untersuchung', 'esame', 'обследование']
    }
  };

  async translateText(text: string, targetLanguage: string, sourceLanguage?: string): Promise<TranslationResult> {
    try {
      // For demo purposes, we'll use a simple translation approach
      // In a real implementation, you'd use Google Translate API or similar
      
      const detectedLang = sourceLanguage || await this.detectLanguage(text);
      
      if (detectedLang === targetLanguage) {
        return {
          translatedText: text,
          confidence: 1.0,
          detectedLanguage: detectedLang,
          medicalTermsPreserved: true
        };
      }

      // Simulate translation with medical term preservation
      let translatedText = await this.performTranslation(text, detectedLang, targetLanguage);
      const medicalTermsPreserved = this.preserveMedicalTerms(translatedText, targetLanguage);

      return {
        translatedText,
        confidence: 0.85,
        detectedLanguage: detectedLang,
        medicalTermsPreserved
      };
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  private async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on common words
    const patterns = {
      'es': /\b(el|la|de|que|y|en|un|es|se|no|te|lo|le|da|su|por|son|con|para|al|del|los|las)\b/gi,
      'fr': /\b(le|de|et|à|un|il|être|et|en|avoir|que|pour|dans|ce|son|une|sur|avec|ne|se|pas)\b/gi,
      'de': /\b(der|die|und|in|den|von|zu|das|mit|sich|des|auf|für|ist|im|dem|nicht|ein|eine)\b/gi,
      'it': /\b(il|di|che|e|la|per|un|in|con|da|su|del|al|le|si|dei|come|lo|questo|tutto)\b/gi,
      'pt': /\b(de|a|o|que|e|do|da|em|um|para|é|com|não|uma|os|no|se|na|por|mais)\b/gi
    };

    for (const [lang, pattern] of Object.entries(patterns)) {
      const matches = text.match(pattern);
      if (matches && matches.length > 3) {
        return lang;
      }
    }

    return 'en'; // Default to English
  }

  private async performTranslation(text: string, sourceLang: string, targetLang: string): Promise<string> {
    // In a real implementation, this would call a translation API
    // For demo, we'll return a simulated translation
    
    const translations: Record<string, Record<string, string>> = {
      'en': {
        'es': text.replace(/tooth/gi, 'diente').replace(/cavity/gi, 'caries').replace(/filling/gi, 'empaste'),
        'fr': text.replace(/tooth/gi, 'dent').replace(/cavity/gi, 'carie').replace(/filling/gi, 'plombage'),
        'de': text.replace(/tooth/gi, 'Zahn').replace(/cavity/gi, 'Karies').replace(/filling/gi, 'Füllung')
      }
    };

    return translations[sourceLang]?.[targetLang] || text;
  }

  private preserveMedicalTerms(text: string, language: string): boolean {
    // Check if medical terms are properly preserved in translation
    const medicalTermsCount = Object.keys(this.medicalTerms.en).length;
    let preservedCount = 0;

    for (const [englishTerm, translations] of Object.entries(this.medicalTerms.en)) {
      if (language === 'en') {
        if (text.toLowerCase().includes(englishTerm)) {
          preservedCount++;
        }
      } else {
        const translatedTerm = translations[0]; // First translation
        if (text.toLowerCase().includes(translatedTerm)) {
          preservedCount++;
        }
      }
    }

    return preservedCount > 0;
  }

  getSupportedLanguages(): Record<string, string> {
    return this.supportedLanguages;
  }

  async translateMedicalDocument(text: string, targetLanguage: string): Promise<TranslationResult> {
    // Enhanced translation for medical documents with term preservation
    const result = await this.translateText(text, targetLanguage);
    
    // Add medical context and cultural considerations
    if (targetLanguage === 'es') {
      result.translatedText = this.addSpanishMedicalContext(result.translatedText);
    }
    
    return result;
  }

  private addSpanishMedicalContext(text: string): string {
    // Add cultural context for Spanish-speaking patients
    const contextualPhrases = {
      'Please': 'Por favor',
      'Thank you': 'Gracias',
      'Do you understand?': '¿Entiende usted?',
      'Any questions?': '¿Tiene alguna pregunta?'
    };

    let contextualText = text;
    for (const [english, spanish] of Object.entries(contextualPhrases)) {
      contextualText = contextualText.replace(new RegExp(english, 'gi'), spanish);
    }

    return contextualText;
  }
}