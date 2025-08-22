// Importa hooks React para estado e efeito
import { useState, useEffect, useRef, useCallback } from "react";

// Importa componente Select para dropdowns
import Select from '../Select';

// Importa tipos
import * as Types from '../../../types';

// Modal de configurações (tema, idioma) - acessibilidade aprimorada

// Interface para as props do componente
interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  prefs: Types.UserPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<Types.UserPreferences>>;
  t: Record<string, string>; // Traduções
}

export default function SettingsModal({ open, onClose, prefs, setPrefs, t }: SettingsModalProps) {
  // Estado local apenas para idioma (tema é aplicado automaticamente)
  const [language, setLanguage] = useState<"pt" | "en" | "es">(prefs.language || "pt");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Funções otimizadas com useCallback
  const handleThemeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrefs((p) => ({ ...p, theme: e.target.value as "light" | "dark" | "system" }));
  }, [setPrefs]);

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "pt" | "en" | "es");
  }, []);

  const handleSave = useCallback(() => {
    setPrefs((p) => ({
      ...p,
      language,
    }));
    onClose();
  }, [language, setPrefs, onClose]);

  // Reseta idioma ao abrir/fechar modal
  useEffect(() => {
    if (!open) setLanguage(prefs.language || "pt");
  }, [open, prefs]);

  // Gerencia foco e tecla ESC
  useEffect(() => {
    if (open) {
      // Foca no botão fechar quando o modal abre
      closeButtonRef.current?.focus();
      
      // Calcula a largura da scrollbar antes de escondê-la
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Previne scroll do body e compensa a scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Handler para tecla ESC
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'unset';
        document.body.style.paddingRight = '0px';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [open, onClose]);

  // JSX do modal
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-[#AABBCC]/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-[#AABBCC]/20 rounded-2xl p-6 w-full max-w-lg shadow-xl border border-slate-200 dark:border-[#AABBCC]/40 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="settings-title" className="text-lg font-semibold mb-4">{t.settings}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tema */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
              {t.appearance}
            </div>
            <Select
              label={t.theme}
              value={prefs.theme}
              onChange={handleThemeChange}
            >
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
              <option value="system">{t.system}</option>
            </Select>
          </div>

          {/* Idioma */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              {t.general}
            </div>
            <Select
              label={t.language}
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700/50 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-200 min-w-[80px] text-center border border-slate-300 dark:border-slate-600/50"
            aria-label={`${t.close} ${t.settings}`}
          >
            {t.close}
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white dark:bg-[#AABBCC] dark:text-white hover:bg-blue-700 dark:hover:bg-[#AABBCC]/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#AABBCC]/20 transition-all duration-200 min-w-[80px] text-center shadow-sm hover:shadow-md"
            aria-label={`${t.save} ${t.settings}`}
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}