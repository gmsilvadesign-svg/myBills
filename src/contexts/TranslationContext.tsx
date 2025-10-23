import { ReactNode } from 'react';
import { useI18n } from '@/constants/translation';
import { usePrefs } from '@/hooks/usePrefs';
import { TranslationContext } from '@/contexts/TranslationContextDefinition';

interface TranslationProviderProps {
  children: ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  const [prefs] = usePrefs();
  const t = useI18n(prefs.language);
  const locale = prefs.language === 'pt' ? 'pt-BR' : prefs.language === 'es' ? 'es-ES' : 'en-US';
  const currency = prefs.currency || 'BRL';

  return (
    <TranslationContext.Provider value={{ t, locale, currency }}>
      {children}
    </TranslationContext.Provider>
  );
}
