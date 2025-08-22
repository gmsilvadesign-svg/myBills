import { createContext } from 'react';
import * as Types from '../types';

interface NotificationContextType {
  showNotification: (message: string, type: Types.NotificationType, duration?: number) => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);