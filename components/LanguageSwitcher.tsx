'use client';

import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'nl', flag: '🇳🇱', name: 'Nederlands' },
  { code: 'pl', flag: '🇵🇱', name: 'Polski' },
  { code: 'tr', flag: '🇹🇷', name: 'Türkçe' },
  { code: 'ro', flag: '🇷🇴', name: 'Română' },
  { code: 'uk', flag: '🇺🇦', name: 'Українська' },
  { code: 'bg', flag: '🇧🇬', name: 'Български' },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code as any)}
          className={`px-3 py-2 text-xl transition-all duration-200 ${
            language === lang.code 
              ? 'bg-blue-600 scale-110' 
              : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
          }`}
          title={lang.name}
        >
          {lang.flag}
        </button>
      ))}
    </div>
  );
}
