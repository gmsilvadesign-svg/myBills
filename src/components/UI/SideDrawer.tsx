import { useEffect } from 'react';
import { cn, CSS_CLASSES } from '@/styles/constants';

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export default function SideDrawer({ open, onClose, title = 'Mais opções', children }: SideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={cn(CSS_CLASSES.container.modal)} aria-modal="true" role="dialog">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      <aside
        className="relative z-10 ml-auto h-full w-[85%] sm:w-[380px] max-w-full bg-white text-slate-900 shadow-2xl border-l border-slate-200 p-4 flex flex-col gap-3 rounded-l-2xl animate-[slideIn_.2s_ease-out]"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-semibold">{title}</h3>
          <button onClick={onClose} className={CSS_CLASSES.button.secondary}>
            Fechar
          </button>
        </div>
        <div className="flex flex-col gap-2 overflow-y-auto">{children}</div>
      </aside>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0.5; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
