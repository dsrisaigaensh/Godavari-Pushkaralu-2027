import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations, type Language, type LanguageOption } from './translations';
import { UNIVERSAL_DICTIONARY } from './universalDictionary';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
  currentLanguageOption: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'civicproof_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language;
    if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
      return saved;
    }
    return 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultText?: string): string => {
    if (language === 'en') {
      return translations.en[key] || defaultText || key;
    }
    const langDict = translations[language] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    if (UNIVERSAL_DICTIONARY[language]?.[key]) {
      return UNIVERSAL_DICTIONARY[language][key];
    }
    if (defaultText) {
      if (langDict[defaultText]) {
        return langDict[defaultText];
      }
      if (UNIVERSAL_DICTIONARY[language]?.[defaultText]) {
        return UNIVERSAL_DICTIONARY[language][defaultText];
      }
    }
    const enDict = translations.en;
    if (enDict[key]) {
      return enDict[key];
    }
    return defaultText || key;
  };

  const currentLanguageOption =
    LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption,
        languages: LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
