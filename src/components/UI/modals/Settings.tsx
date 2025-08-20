// Importa hooks React para estado e efeito
import { useState, useEffect } from "react";

// Importa componente Select para dropdowns
import Select from '../Select';

// Modal de configurações (tema, idioma)

export default function SettingsModal({ open, onClose, prefs, setPrefs, t }) {
  // Estado local apenas para idioma (tema é aplicado automaticamente)
  const [language, setLanguage] = useState(prefs.language || "pt");

  // Reseta idioma ao abrir/fechar modal
  useEffect(() => {
    if (!open) setLanguage(prefs.language || "pt");
  }, [open, prefs]);

  // JSX do modal
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl">
        <div className="text-lg font-semibold mb-4">{t.settings}</div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tema */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 mb-2">
              {t.appearance}
            </div>
            <Select
              label={t.theme}
              value={prefs.theme}
              onChange={(e) => setPrefs((p) => ({ ...p, theme: e.target.value }))}
            >
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
            </Select>
          </div>

          {/* Idioma */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 mb-2">
              {t.general}
            </div>
            <Select
              label={t.language}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800"
          >
            {t.close}
          </button>

          <button
            onClick={() => {
              setPrefs((p) => ({
                ...p,
                language,
              }));
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {t.save}
          </button>
        </div>
      </div>
    </div>
  );
}