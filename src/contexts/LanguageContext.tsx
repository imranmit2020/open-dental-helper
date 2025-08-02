import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
];

interface LanguageContextType {
  selectedLanguage: Language;
  setSelectedLanguage: (language: Language) => void;
  isRTL: boolean;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  getLocale: () => string;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>(SUPPORTED_LANGUAGES[0]);
  const [isLoading, setIsLoading] = useState(false);
  const { i18n, t } = useTranslation();

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) {
      const language = SUPPORTED_LANGUAGES.find(l => l.code === savedLanguage);
      if (language) {
        setSelectedLanguageState(language);
        i18n.changeLanguage(language.code);
      }
    }
  }, [i18n]);

  // Update document direction for RTL languages
  useEffect(() => {
    document.dir = selectedLanguage.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = selectedLanguage.code;
  }, [selectedLanguage]);

  const setSelectedLanguage = async (language: Language) => {
    setIsLoading(true);
    try {
      setSelectedLanguageState(language);
      localStorage.setItem('selectedLanguage', language.code);
      await i18n.changeLanguage(language.code);
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isRTL = selectedLanguage.rtl || false;

  const getLocale = (): string => {
    // Map language codes to full locales for better formatting
    const localeMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'ko': 'ko-KR',
      'tr': 'tr-TR',
      'nl': 'nl-NL',
      'sv': 'sv-SE',
      'no': 'no-NO',
      'da': 'da-DK',
      'fi': 'fi-FI',
      'pl': 'pl-PL',
      'th': 'th-TH',
    };
    
    return localeMap[selectedLanguage.code] || selectedLanguage.code;
  };

  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(getLocale(), {
        dateStyle: 'medium',
        timeStyle: 'short',
        ...options,
      }).format(date);
    } catch (error) {
      // Fallback to ISO string if formatting fails
      return date.toLocaleDateString();
    }
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(getLocale(), options).format(number);
    } catch (error) {
      // Fallback to string conversion
      return number.toString();
    }
  };

  return (
    <LanguageContext.Provider value={{
      selectedLanguage,
      setSelectedLanguage,
      isRTL,
      formatDate,
      formatNumber,
      getLocale,
      t,
      isLoading,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}