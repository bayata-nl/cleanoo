'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center">
      <Select value={language} onValueChange={(value: 'en' | 'nl') => setLanguage(value)}>
        <SelectTrigger className="w-24 h-9 bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200 font-medium">
          <Globe className="h-4 w-4 mr-2 text-gray-600" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">🇬🇧 EN</SelectItem>
          <SelectItem value="nl">🇳🇱 NL</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
