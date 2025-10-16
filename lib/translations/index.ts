// Translations Index
// Import all language files

import { en } from './en';
import { nl } from './nl';
import { tr } from './tr';
import { pl } from './pl';
import { bg } from './bg';
import { uk } from './uk';
import { ro } from './ro';

export const translations = {
  en,
  nl,
  tr,
  pl,
  bg,
  uk,
  ro,
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof en;

