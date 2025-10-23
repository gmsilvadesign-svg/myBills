import { useRef, useEffect } from 'react';
import { TranslationDictionary } from '@/constants/translation';

interface NotificationsModalProps {
  open: boolean;
  onClose: () => void;
  t: TranslationDictionary;
}

export default function NotificationsModal({ open, onClose, t }: NotificationsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

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

  // Obtém as notificações do localStorage
  const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');

  // JSX do modal
  if (!open) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div id="notifications-title" className="text-lg font-semibold mb-4">{t.notifications}</div>

        {/* Conteúdo das notificações */}
        <div className="flex-1 overflow-y-auto mb-6">
          {notifications.length > 0 ? (
            <ul className="space-y-3">
              {notifications.map((notification: string, index: number) => (
                <li 
                  key={index}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <p className="text-sm text-slate-700">
                    {notification}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-slate-600">
                {t.no_notifications}
              </p>
            </div>
          )}
        </div>

        {/* Botão de fechar */}
        <div className="flex justify-end">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 min-w-[80px] text-center border border-slate-300"
            aria-label={`${t.close} ${t.notifications}`}
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

