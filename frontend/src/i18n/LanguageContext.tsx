import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations, type Language, type LanguageOption } from './translations';
import { UNIVERSAL_DICTIONARY, REVERSE_TO_EN } from './universalDictionary';

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

  // Universal DOM Auto-Translator for all pages, modals, and dynamic components
  useEffect(() => {
    let isTranslating = false;

    const translateText = (raw: string, targetLang: Language): string | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;

      if (targetLang === 'en') {
        const enVal = REVERSE_TO_EN[trimmed];
        if (enVal && enVal !== trimmed) {
          return raw.replace(trimmed, enVal);
        }
        return null;
      }

      // If target is Hindi or Telugu
      const dict = UNIVERSAL_DICTIONARY[targetLang];
      if (dict) {
        // Direct match from English
        if (dict[trimmed]) {
          return raw.replace(trimmed, dict[trimmed]);
        }
        // If current text is in the other regional language (e.g. was Hindi, now Telugu)
        const enBase = REVERSE_TO_EN[trimmed];
        if (enBase && dict[enBase]) {
          return raw.replace(trimmed, dict[enBase]);
        }
      }

      return null;
    };

    const processNode = (node: Node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        const tag = el.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE' || tag === 'PRE') {
          return;
        }

        // Translate placeholders
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          const inputEl = el as HTMLInputElement;
          const ph = inputEl.getAttribute('placeholder');
          if (ph) {
            const translatedPh = translateText(ph, language);
            if (translatedPh && inputEl.getAttribute('placeholder') !== translatedPh) {
              inputEl.setAttribute('placeholder', translatedPh);
            }
          }
        }

        // Translate title tooltips
        if (el.title) {
          const translatedTitle = translateText(el.title, language);
          if (translatedTitle && el.title !== translatedTitle) {
            el.title = translatedTitle;
          }
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.nodeValue;
        if (!text || !text.trim()) return;

        const translated = translateText(text, language);
        if (translated && node.nodeValue !== translated) {
          node.nodeValue = translated;
        }
      }
    };

    const walk = (root: Node) => {
      if (!root) return;
      const treeWalker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT,
        null
      );
      let current: Node | null = treeWalker.currentNode;
      while (current) {
        processNode(current);
        current = treeWalker.nextNode();
      }
    };

    const runTranslation = () => {
      if (isTranslating || !document.body) return;
      isTranslating = true;
      try {
        walk(document.body);
      } finally {
        isTranslating = false;
      }
    };

    // Run initially for currently rendered tree
    runTranslation();

    // Observe subtree mutations so as user navigates to any new page, it translates automatically
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      isTranslating = true;
      try {
        for (const m of mutations) {
          if (m.type === 'childList') {
            m.addedNodes.forEach((added) => walk(added));
          } else if (m.type === 'characterData') {
            processNode(m.target);
          }
        }
      } finally {
        isTranslating = false;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      observer.disconnect();
    };
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
