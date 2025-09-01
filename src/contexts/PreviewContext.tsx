import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

type PreviewMode = 'browser' | 'mobile-s' | 'mobile-m' | 'mobile-l' | 'tablet';

interface PreviewContextType {
  mode: PreviewMode;
  width: number | null; // px max-width used to constrain layout
  setMode: (m: PreviewMode) => void;
}

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

const MODE_TO_WIDTH: Record<Exclude<PreviewMode, 'browser'>, number> = {
  'mobile-s': 360,
  'mobile-m': 390,
  'mobile-l': 414,
  'tablet': 768,
};

export function PreviewProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PreviewMode>(() => (localStorage.getItem('previewMode') as PreviewMode) || 'browser');
  useEffect(() => { localStorage.setItem('previewMode', mode); }, [mode]);
  const width = mode === 'browser' ? null : MODE_TO_WIDTH[mode];
  const value = useMemo(() => ({ mode, width, setMode }), [mode, width]);
  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreview() {
  const ctx = useContext(PreviewContext);
  if (!ctx) throw new Error('usePreview must be used within PreviewProvider');
  return ctx;
}

