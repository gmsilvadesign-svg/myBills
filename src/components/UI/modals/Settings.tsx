// React
import { useState, useEffect, useRef, useCallback } from "react";

// Components
import Select from '../Select';

// Types
import * as Types from '@/types';

// Hooks
import { useNotifications } from '@/hooks/useNotifications';
import { useBillNotifications } from '@/hooks/useBillNotifications';

// Utils
import { getNotificationConfig, saveNotificationConfig } from '@/utils/notificationUtils';

// Modal de configurações (tema, idioma) - acessibilidade aprimorada

// Interface para as props do componente
interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
  prefs: Types.UserPreferences;
  setPrefs: React.Dispatch<React.SetStateAction<Types.UserPreferences>>;
  t: Record<string, string>; // Traduções
  bills?: Types.Bill[]; // Contas para configuração de notificações
}

export default function SettingsModal({ open, onClose, prefs, setPrefs, t, bills = [] }: SettingsModalProps) {
  // Estado local apenas para idioma (tema é aplicado automaticamente)
  const [language, setLanguage] = useState<"pt" | "en" | "es">(prefs.language || "pt");
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  
  // Hooks de notificação
  const { permission, requestPermission, isSupported, loading: notificationLoading } = useNotifications();
  const { config: notificationConfig, updateConfig, sendTestNotification } = useBillNotifications(bills);
  
  // Estado local para configurações de notificação
  const [localNotificationConfig, setLocalNotificationConfig] = useState(notificationConfig);

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
    
    // Salva configurações de notificação
    updateConfig(localNotificationConfig);
    saveNotificationConfig(localNotificationConfig);
    
    onClose();
  }, [language, setPrefs, onClose, localNotificationConfig, updateConfig]);
  
  // Handlers para configurações de notificação
  const handleNotificationPermission = useCallback(async () => {
    await requestPermission();
  }, [requestPermission]);
  
  const handleNotificationConfigChange = useCallback((key: string, value: any) => {
    setLocalNotificationConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // Reseta idioma e configurações ao abrir/fechar modal
  useEffect(() => {
    if (!open) {
      setLanguage(prefs.language || "pt");
      setLocalNotificationConfig(notificationConfig);
    }
  }, [open, prefs, notificationConfig]);

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

        <div className="space-y-6">
          {/* Seção Aparência e Idioma */}
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
          
          {/* Seção Notificações */}
          <div>
            <div className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4">
              Notificações
            </div>
            
            {/* Status das notificações */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Status das Notificações</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  permission.granted 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : permission.denied
                    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}>
                  {permission.granted ? 'Ativadas' : permission.denied ? 'Negadas' : 'Pendente'}
                </span>
              </div>
              
              {!permission.granted && (
                <button
                  onClick={handleNotificationPermission}
                  disabled={notificationLoading || !isSupported}
                  className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {notificationLoading ? 'Carregando...' : 'Ativar Notificações'}
                </button>
              )}
              
              {permission.granted && (
                <button
                  onClick={sendTestNotification}
                  className="w-full px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Enviar Notificação de Teste
                </button>
              )}
            </div>
            
            {/* Configurações de notificação */}
            {permission.granted && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Dias antes do vencimento */}
                <div>
                  <label className="block text-sm font-medium mb-2">Avisar com antecedência</label>
                  <Select
                    label=""
                    value={localNotificationConfig.daysBeforeExpiry.toString()}
                    onChange={(e) => handleNotificationConfigChange('daysBeforeExpiry', parseInt(e.target.value))}
                  >
                    <option value="1">1 dia</option>
                    <option value="2">2 dias</option>
                    <option value="3">3 dias</option>
                    <option value="5">5 dias</option>
                    <option value="7">7 dias</option>
                  </Select>
                </div>
                
                {/* Horário das notificações */}
                <div>
                  <label className="block text-sm font-medium mb-2">Horário das notificações</label>
                  <input
                    type="time"
                    value={localNotificationConfig.notificationTime}
                    onChange={(e) => handleNotificationConfigChange('notificationTime', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* Tipos de conta */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tipos de conta para notificar</label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localNotificationConfig.enabledTypes.includes('expense')}
                        onChange={(e) => {
                          const types = e.target.checked 
                            ? [...localNotificationConfig.enabledTypes, 'expense']
                            : localNotificationConfig.enabledTypes.filter(t => t !== 'expense');
                          handleNotificationConfigChange('enabledTypes', types);
                        }}
                        className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Despesas
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={localNotificationConfig.enabledTypes.includes('income')}
                        onChange={(e) => {
                          const types = e.target.checked 
                            ? [...localNotificationConfig.enabledTypes, 'income']
                            : localNotificationConfig.enabledTypes.filter(t => t !== 'income');
                          handleNotificationConfigChange('enabledTypes', types);
                        }}
                        className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      Receitas
                    </label>
                  </div>
                </div>
              </div>
            )}
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