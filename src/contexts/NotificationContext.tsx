import { useState, ReactNode } from 'react';
import NotificationModal from '@/components/UI/NotificationModal';
import * as Types from '@/types';
import { NotificationContext } from '@/contexts/NotificationContextDefinition';

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [currentNotification, setCurrentNotification] = useState<Types.Notification | null>(null);

  const showNotification = (message: string, type: Types.NotificationType, duration = 5000) => {
    const id = Date.now().toString();
    setCurrentNotification({ id, message, type, duration });
  };

  const closeNotification = () => {
    setCurrentNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {currentNotification && (
        <NotificationModal
          isOpen={true}
          onClose={closeNotification}
          message={currentNotification.message}
          type={currentNotification.type}
        />
      )}
    </NotificationContext.Provider>
  );
}