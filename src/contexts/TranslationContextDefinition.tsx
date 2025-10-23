import { createContext } from 'react';
import { TranslationDictionary } from '@/constants/translation';

interface TranslationContextType {
  t: TranslationDictionary;
  locale: string;
  currency: string;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);
