import Modal from './modals/Modal';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function NotificationModal({ isOpen, onClose, message, type }: NotificationModalProps) {
  // Cores e ícones baseados no tipo de notificação
  const config = {
    success: {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-800 dark:text-green-200',
      iconColor: 'text-green-500',
      borderColor: 'border-green-200 dark:border-green-800',
      title: 'Sucesso',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-500',
      borderColor: 'border-red-200 dark:border-red-800',
      title: 'Erro',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
      title: 'Informação',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const currentConfig = config[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className={`rounded-lg border p-4 ${currentConfig.bgColor} ${currentConfig.borderColor}`}>
        <div className="flex items-start">
          <div className={`flex-shrink-0 ${currentConfig.iconColor}`}>
            {currentConfig.icon}
          </div>
          <div className="ml-3 flex-1">
            <h3 className={`text-sm font-medium ${currentConfig.textColor}`}>
              {currentConfig.title}
            </h3>
            <div className={`mt-2 text-sm ${currentConfig.textColor}`}>
              <p>{message}</p>
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${currentConfig.textColor} ${currentConfig.bgColor} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${type}-500 transition-opacity`}
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