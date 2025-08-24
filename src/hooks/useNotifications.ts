import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/firebase';
import { useNotification } from '@/hooks/useNotification';

export interface NotificationPermission {
  granted: boolean;
  denied: boolean;
  default: boolean;
}

export interface UseNotificationsReturn {
  permission: NotificationPermission;
  token: string | null;
  requestPermission: () => Promise<boolean>;
  isSupported: boolean;
  loading: boolean;
}

export const useNotifications = (): UseNotificationsReturn => {
  const [permission, setPermission] = useState<NotificationPermission>({
    granted: false,
    denied: false,
    default: true
  });
  const [token, setToken] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  // Verifica suporte e permissões iniciais
  useEffect(() => {
    const checkSupport = async () => {
      try {
        const messagingInstance = await messaging();
        setIsSupported(!!messagingInstance);
        
        if (messagingInstance && 'Notification' in window) {
          const currentPermission = Notification.permission;
          setPermission({
            granted: currentPermission === 'granted',
            denied: currentPermission === 'denied',
            default: currentPermission === 'default'
          });
          
          // Se já tem permissão, obtém o token
          if (currentPermission === 'granted') {
            await getNotificationToken(messagingInstance);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar suporte a notificações:', error);
        setIsSupported(false);
      } finally {
        setLoading(false);
      }
    };

    checkSupport();
  }, []);

  // Obtém token de notificação
  const getNotificationToken = async (messagingInstance: any) => {
    try {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const currentToken = await getToken(messagingInstance, {
        vapidKey: vapidKey
      });
      
      if (currentToken) {
        setToken(currentToken);
        console.log('Token de notificação obtido:', currentToken);
        return currentToken;
      } else {
        console.log('Nenhum token de registro disponível.');
        return null;
      }
    } catch (error) {
      console.error('Erro ao obter token de notificação:', error);
      return null;
    }
  };

  // Solicita permissão para notificações
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      showNotification('Notificações não são suportadas neste navegador', 'error');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      
      const newPermissionState = {
        granted: permission === 'granted',
        denied: permission === 'denied',
        default: permission === 'default'
      };
      
      setPermission(newPermissionState);
      
      if (permission === 'granted') {
        const messagingInstance = await messaging();
        if (messagingInstance) {
          await getNotificationToken(messagingInstance);
        }
        showNotification('Notificações ativadas com sucesso!', 'success');
        return true;
      } else if (permission === 'denied') {
        showNotification('Permissão para notificações negada', 'error');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      showNotification('Erro ao solicitar permissão para notificações', 'error');
      return false;
    }
  }, [isSupported, showNotification]);

  // Configura listener para mensagens em foreground
  useEffect(() => {
    if (!isSupported || !permission.granted) return;

    const setupForegroundListener = async () => {
      const messagingInstance = await messaging();
      if (!messagingInstance) return;

      const unsubscribe = onMessage(messagingInstance, (payload) => {
        console.log('Mensagem recebida em foreground:', payload);
        
        const title = payload.notification?.title || 'Conta Vencendo';
        const body = payload.notification?.body || 'Você tem contas próximas do vencimento';
        
        // Mostra notificação no sistema de notificação interno
        showNotification(body, 'warning');
        
        // Também mostra notificação nativa se possível
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'bill-notification'
          });
        }
      });

      return unsubscribe;
    };

    setupForegroundListener();
  }, [isSupported, permission.granted, showNotification]);

  return {
    permission,
    token,
    requestPermission,
    isSupported,
    loading
  };
};