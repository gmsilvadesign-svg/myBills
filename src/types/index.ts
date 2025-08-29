// Definição dos tipos comuns usados em toda a aplicação

// Tipo para uma conta
export interface Bill {
  id?: string;
  title: string;
  amount: number;
  dueDate: string; // formato ISO YYYY-MM-DD
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  paid: boolean;
  paidOn: string | null; // formato ISO YYYY-MM-DD ou null
  category?: string | null;
  notes?: string | null;
  tags?: string[];
}

// Tipo para uma fonte de renda
export interface Income {
  id?: string;
  title: string;
  amount: number;
  dueDate: string; // data base/prevista (ISO YYYY-MM-DD)
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  category: string; // obrigatório para listagem
  notes?: string | null;
}

// Tipo para as preferências do usuário
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  currency: string;
}

// Tipo para os filtros disponíveis
export type FilterType = 'all' | 'today' | 'overdue' | 'next7' | 'next30';

// Tipo para as visualizações disponíveis
export type ViewType = 'general' | 'list' | 'calendar' | 'purchases';

// Tipo para uma compra
export interface Purchase {
  id?: string;
  title: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  category?: string | null;
  notes?: string | null;
}

// (sem tipo extra: ViewType já inclui 'purchases')

// Tipo para os totais calculados
export interface Totals {
  allOpen: number;
  monthOpen: number;
  overdue: number;
  countOpen: number;
}

// Tipo para o estado de confirmação de exclusão
export interface ConfirmState {
  open: boolean;
  id: string | null;
}

// Tipo para notificações
export type NotificationType = 'success' | 'error' | 'info';

// Utility types for common props
export interface WithError {
  error?: string;
}

export interface WithAriaLabel {
  ariaLabel?: string;
}

export interface WithOptionalTitle {
  title?: string;
}

export interface WithOptionalDuration {
  duration?: number;
}

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}
