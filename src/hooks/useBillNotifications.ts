import { useState, useEffect, useCallback } from 'react';
import { Bill } from '@/types';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotification } from '@/hooks/useNotification';
import {
  getExpiringBills,
  formatBillNotificationMessage,
  formatMultipleBillsNotification,
  sendLocalNotification,
  isNotificationTime,
  getNotificationConfig,
  BillNotificationConfig,
  ExpiringBill
} from '@/utils/notificationUtils';

export interface UseBillNotificationsReturn {
  expiringBills: ExpiringBill[];
  config: BillNotificationConfig;
  updateConfig: (newConfig: Partial<BillNotificationConfig>) => void;
  checkAndNotify: () => void;
  sendTestNotification: () => void;
  isEnabled: boolean;
  lastCheck: Date | null;
}

export const useBillNotifications = (bills: Bill[]): UseBillNotificationsReturn => {
  const [config, setConfig] = useState<BillNotificationConfig>(getNotificationConfig());
  const [expiringBills, setExpiringBills] = useState<ExpiringBill[]>([]);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  
  const { permission, isSupported } = useNotifications();
  const { showNotification } = useNotification();
  
  const isEnabled = isSupported && permission.granted;

  // Atualiza lista de contas vencendo quando bills ou config mudam
  useEffect(() => {
    const expiring = getExpiringBills(bills, config);
    setExpiringBills(expiring);
  }, [bills, config]);

  // Função para verificar e notificar
  const checkAndNotify = useCallback(() => {
    if (!isEnabled) return;
    
    const expiring = getExpiringBills(bills, config);
    setExpiringBills(expiring);
    setLastCheck(new Date());
    
    if (expiring.length === 0) return;
    
    // Se há apenas uma conta, envia notificação específica
    if (expiring.length === 1) {
      const { title, body } = formatBillNotificationMessage(expiring[0]);
      sendLocalNotification(title, body);
      showNotification(body, 'warning');
    } 
    // Se há múltiplas contas, envia notificação resumida
    else {
      const { title, body } = formatMultipleBillsNotification(expiring);
      sendLocalNotification(title, body);
      showNotification(`${title}: ${body}`, 'warning');
    }
  }, [bills, config, isEnabled, showNotification]);

  // Função para enviar notificação de teste
  const sendTestNotification = useCallback(() => {
    if (!isEnabled) {
      showNotification('Notificações não estão habilitadas', 'error');
      return;
    }
    
    const testTitle = 'Teste de Notificação';
    const testBody = 'Sistema de notificações funcionando corretamente!';
    
    sendLocalNotification(testTitle, testBody);
    showNotification('Notificação de teste enviada!', 'success');
  }, [isEnabled, showNotification]);

  // Atualiza configuração
  const updateConfig = useCallback((newConfig: Partial<BillNotificationConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Salva no localStorage
    try {
      localStorage.setItem('notificationConfig', JSON.stringify(updatedConfig));
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
    }
  }, [config]);

  // Configura verificação automática
  useEffect(() => {
    if (!isEnabled) {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
      return;
    }

    // Verifica a cada minuto se é hora de notificar
    const id = setInterval(() => {
      if (isNotificationTime(config.notificationTime)) {
        checkAndNotify();
      }
    }, 60000); // 1 minuto

    setIntervalId(id);

    return () => {
      if (id) clearInterval(id);
    };
  }, [isEnabled, config.notificationTime, checkAndNotify]);

  // Verifica imediatamente quando o componente monta (se habilitado)
  useEffect(() => {
    if (isEnabled && bills.length > 0) {
      // Pequeno delay para evitar notificação imediata no carregamento
      const timeout = setTimeout(() => {
        const expiring = getExpiringBills(bills, config);
        setExpiringBills(expiring);
        
        // Só notifica se há contas vencendo hoje
        const todayBills = expiring.filter(bill => bill.daysUntilExpiry === 0);
        if (todayBills.length > 0) {
          checkAndNotify();
        }
      }, 2000);
      
      return () => clearTimeout(timeout);
    }
  }, [isEnabled, bills.length]); // Removido checkAndNotify das dependências para evitar loop

  // Cleanup do interval quando o componente desmonta
  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  return {
    expiringBills,
    config,
    updateConfig,
    checkAndNotify,
    sendTestNotification,
    isEnabled,
    lastCheck
  };
};