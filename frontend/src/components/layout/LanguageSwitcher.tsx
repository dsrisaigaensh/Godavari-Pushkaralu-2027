import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Language } from '../../i18n/translations';

interface LanguageSwitcherProps {
  variant?: 'header' | 'drawer' | 'compact';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { language, setLanguage, languages, currentLanguageOption } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    return (
      <div className={`space-y-2 p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-stone-700">
          <Globe className="w-4 h-4 text-brand" />
          <span>Language / భాష / भाषा</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`px-2 py-1.5 text-xs font-semibold rounded-lg transition-all text-center flex flex-col items-center justify-center ${
                language === l.code
                  ? 'bg-brand text-white shadow-sm ring-1 ring-amber-300'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-amber-50'
              }`}
            >
              <span className="text-[11px] font-bold">{l.badge}</span>
              <span className="text-[10px] leading-tight opacity-90 truncate max-w-full">
                {l.nativeLabel}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1 text-xs font-semibold text-stone-800 bg-amber-50/80 hover:bg-amber-100/80 border border-amber-200/80 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand/30"
        title="Select Language / భాషను ఎంచుకోండి"
        aria-label="Language selection"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-brand shrink-0" />
        <span className="hidden sm:inline font-bold text-brand">
          {currentLanguageOption.badge}
        </span>
        <span className="hidden md:inline text-stone-700 text-[11px]">
          {currentLanguageOption.nativeLabel}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-stone-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white border border-amber-300 rounded-xl shadow-2xl z-[100] overflow-hidden py-1 animate-fadeIn ring-1 ring-black/10">
          <div className="px-3.5 py-2 border-b border-amber-100 bg-amber-50/70 text-[10px] font-bold uppercase tracking-wider text-stone-600 flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-[10px] font-bold text-brand">భాష / भाषा</span>
          </div>
          {languages.map((l) => (
            <button
              key={l.code}
              onClick={() => handleSelect(l.code)}
              className={`w-full px-3.5 py-2.5 text-xs flex items-center justify-between text-left transition-colors ${
                language === l.code
                  ? 'bg-amber-100/60 font-bold text-brand'
                  : 'text-stone-700 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-6 text-center font-bold text-[11px] px-1.5 py-0.5 rounded bg-amber-200/60 text-stone-900 border border-amber-300/60">
                  {l.badge}
                </span>
                <div>
                  <div className="font-bold text-stone-900 text-xs">{l.nativeLabel}</div>
                  <div className="text-[10px] text-stone-500 font-medium">{l.label}</div>
                </div>
              </div>
              {language === l.code && <Check className="w-4 h-4 text-brand stroke-[2.5]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
