import Modal from '@/components/UI/modals/Modal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

const STYLES = {
  success: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    ring: 'focus:ring-emerald-400',
    title: 'Sucesso',
  },
  error: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-800',
    iconColor: 'text-rose-500',
    ring: 'focus:ring-rose-400',
    title: 'Erro',
  },
  info: {
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    text: 'text-sky-800',
    iconColor: 'text-sky-500',
    ring: 'focus:ring-sky-400',
    title: 'Informação',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
    iconColor: 'text-amber-500',
    ring: 'focus:ring-amber-400',
    title: 'Aviso',
  },
} as const;

const ICONS = {
  success: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  error: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.981l5.58-9.92zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" clipRule="evenodd" />
    </svg>
  ),
} as const;

export default function NotificationModal({ isOpen, onClose, message, type }: NotificationModalProps) {
  const style = STYLES[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className={`rounded-lg border p-4 ${style.bg} ${style.border}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${style.iconColor}`}>{ICONS[type]}</div>
          <div className="flex-1">
            <h3 className={`text-sm font-semibold ${style.text}`}>{style.title}</h3>
            <p className={`mt-2 text-sm ${style.text}`}>{message}</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md ${style.text} ${style.bg} hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.ring} transition-opacity`}
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
