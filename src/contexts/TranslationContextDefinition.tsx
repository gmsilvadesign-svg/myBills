import { createContext } from 'react';

interface TranslationContextType {
  t: Record<string, string>;
  locale: string;
  currency: string;
}

export const TranslationContext = createContext<TranslationContextType | undefined>(undefined);