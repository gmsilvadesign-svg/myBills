import { Bill } from '@/types';
import { messaging } from '@/firebase';
import { getToken } from 'firebase/messaging';

export interface BillNotificationConfig {
  daysBeforeExpiry: number;
  enabledCategories: string[];
  enabledTypes: ('income' | 'expense')[];
  notificationTime: string; // HH:MM format
}

export interface ExpiringBill extends Bill {
  daysUntilExpiry: number;
}

// Configuração padrão de notificações
export const DEFAULT_NOTIFICATION_CONFIG: BillNotificationConfig = {
  daysBeforeExpiry: 3,
  enabledCategories: [],
  enabledTypes: ['expense'],
  notificationTime: '09:00'
};

/**
 * Verifica quais contas estão próximas do vencimento
 */
export const getExpiringBills = (
  bills: Bill[],
  config: BillNotificationConfig = DEFAULT_NOTIFICATION_CONFIG
): ExpiringBill[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const targetDate = new Date(today);
  targetDate.setDate(today.getDate() + config.daysBeforeExpiry);

  return bills
    .filter(bill => {
      // Filtra por tipo se especificado
      if (config.enabledTypes.length > 0 && !config.enabledTypes.includes(bill.type)) {
        return false;
      }
      
      // Filtra por categoria se especificado
      if (config.enabledCategories.length > 0 && !config.enabledCategories.includes(bill.category)) {
        return false;
      }
      
      // Verifica se a conta não foi paga
      if (bill.paid) {
        return false;
      }
      
      const billDate = new Date(bill.date);
      billDate.setHours(0, 0, 0, 0);
      
      // Verifica se está dentro do período de notificação
      return billDate >= today && billDate <= targetDate;
    })
    .map(bill => {
      const billDate = new Date(bill.date);
      billDate.setHours(0, 0, 0, 0);
      const daysUntilExpiry = Math.ceil((billDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...bill,
        daysUntilExpiry
      };
    })
    .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
};

/**
 * Formata mensagem de notificação para uma conta
 */
export const formatBillNotificationMessage = (bill: ExpiringBill): { title: string; body: string } => {
  const daysText = bill.daysUntilExpiry === 0 
    ? 'hoje' 
    : bill.daysUntilExpiry === 1 
      ? 'amanhã' 
      : `em ${bill.daysUntilExpiry} dias`;
  
  const typeText = bill.type === 'income' ? 'receber' : 'pagar';
  
  return {
    title: `Conta ${bill.daysUntilExpiry === 0 ? 'vence hoje!' : 'vencendo'}`,
    body: `${bill.description} - R$ ${bill.amount.toFixed(2)} para ${typeText} ${daysText}`
  };
};

/**
 * Formata mensagem para múltiplas contas
 */
export const formatMultipleBillsNotification = (bills: ExpiringBill[]): { title: string; body: string } => {
  const todayBills = bills.filter(b => b.daysUntilExpiry === 0);
  const upcomingBills = bills.filter(b => b.daysUntilExpiry > 0);
  
  let title = '';
  let body = '';
  
  if (todayBills.length > 0 && upcomingBills.length > 0) {
    title = `${todayBills.length} conta(s) vencem hoje`;
    body = `E mais ${upcomingBills.length} conta(s) vencendo nos próximos dias`;
  } else if (todayBills.length > 0) {
    title = `${todayBills.length} conta(s) vencem hoje`;
    const total = todayBills.reduce((sum, bill) => sum + bill.amount, 0);
    body = `Total: R$ ${total.toFixed(2)}`;
  } else {
    title = `${upcomingBills.length} conta(s) vencendo`;
    const nextBill = upcomingBills[0];
    body = `Próxima: ${nextBill.description} em ${nextBill.daysUntilExpiry} dia(s)`;
  }
  
  return { title, body };
};

/**
 * Envia notificação local (para teste)
 */
export const sendLocalNotification = (title: string, body: string): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'bill-notification',
      requireInteraction: true
    });
  }
};

/**
 * Verifica se é hora de enviar notificações
 */
export const isNotificationTime = (configTime: string): boolean => {
  const now = new Date();
  const [hours, minutes] = configTime.split(':').map(Number);
  
  return now.getHours() === hours && now.getMinutes() === minutes;
};

/**
 * Obtém configuração de notificações do localStorage
 */
export const getNotificationConfig = (): BillNotificationConfig => {
  try {
    const stored = localStorage.getItem('notificationConfig');
    if (stored) {
      return { ...DEFAULT_NOTIFICATION_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Erro ao carregar configuração de notificações:', error);
  }
  
  return DEFAULT_NOTIFICATION_CONFIG;
};

/**
 * Salva configuração de notificações no localStorage
 */
export const saveNotificationConfig = (config: Partial<BillNotificationConfig>): void => {
  try {
    const currentConfig = getNotificationConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('notificationConfig', JSON.stringify(newConfig));
  } catch (error) {
    console.error('Erro ao salvar configuração de notificações:', error);
  }
};

/**
 * Registra token de notificação (para uso futuro com backend)
 */
export const registerNotificationToken = async (): Promise<string | null> => {
  try {
    const messagingInstance = await messaging();
    if (!messagingInstance) return null;
    
    const token = await getToken(messagingInstance, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
    });
    
    if (token) {
      // Aqui você poderia enviar o token para seu backend
      console.log('Token registrado:', token);
      localStorage.setItem('fcmToken', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao registrar token:', error);
    return null;
  }
};