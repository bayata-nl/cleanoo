'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-2 text-xl transition-all duration-200 ${
          language === 'en' 
            ? 'bg-blue-600 scale-110' 
            : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
        }`}
        title="English"
      >
        🇬🇧
      </button>
      <button
        onClick={() => setLanguage('nl')}
        className={`px-3 py-2 text-xl transition-all duration-200 ${
          language === 'nl' 
            ? 'bg-blue-600 scale-110' 
            : 'hover:bg-gray-200 opacity-60 hover:opacity-100'
        }`}
        title="Nederlands"
      >
        🇳🇱
      </button>
    </div>
  );
}
