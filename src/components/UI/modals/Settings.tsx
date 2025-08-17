// Importa hooks React para estado e efeito
import { useState, useEffect } from "react";

// Importa componente Select para dropdowns
import Select from '../Select';

// Modal de configurações (tema, idioma)
export default function SettingsModal({ open, onClose, prefs, setPrefs, t }) {

  // Estado local para tema e idioma
  const [theme, setTheme] = useState(prefs.theme || 'system');
  const [language, setLanguage] = useState(prefs.language || 'pt');

  // Reseta valores ao abrir/fechar o modal
  useEffect(() => {
    if (!open) {
      setTheme(prefs.theme || 'system');
      setLanguage(prefs.language || 'pt');
    }
  }, [open]);

  // Não renderiza nada se o modal estiver fechado
  if (!open) return null;

  // JSX do modal
  return (
    // Fundo semitransparente e centralização
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      {/* Caixa do modal com fundo, cantos arredondados e sombra */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg shadow-xl">

        {/* Título do modal */}
        <div className="text-lg font-semibold mb-4">{t.settings}</div>

        {/* Grid para seleções de tema e idioma */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Seção de seleção de tema */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 mb-2">{t.appearance}</div>
            <Select label={t.theme} value={theme} onChange={(e) => setTheme(e.target.value)}>
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
              <option value="system">{t.system}</option>
            </Select>
          </div>

          {/* Seção de seleção de idioma */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 mb-2">{t.general}</div>
            <Select label={t.language} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="pt">Português</option>
              <option value="en">English</option>
              <option value="es">Español</option>
            </Select>
          </div>

        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 justify-end mt-6">
          
          {/* Botão de fechar sem salvar */}
          <button 
            onClick={onClose} 
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800"
          >
            {t.close}
          </button>

          {/* Botão de salvar: atualiza preferências e fecha modal */}
          <button 
            onClick={() => { setPrefs((p)=>({ ...p, theme, language })); onClose(); }} 
            className="px-4 py-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {t.save}
          </button>

        </div>

      </div>
    </div>
  );
}
