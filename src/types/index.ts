// Tipos principais

export interface Bill {
  id?: string;
  title: string;
  amount: number;
  dueDate: string; // ISO YYYY-MM-DD
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  paid: boolean;
  paidOn: string | null; // ISO YYYY-MM-DD ou null
  category?: string | null;
  notes?: string | null;
  tags?: string[];
  userId?: string;
  bookId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Income {
  id?: string;
  title: string;
  amount: number;
  dueDate: string; // ISO YYYY-MM-DD (data base/prevista)
  recurrence: 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  category: string;
  notes?: string | null;
  userId?: string;
  bookId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Purchase {
  id?: string;
  title: string;
  amount: number;
  date: string; // ISO YYYY-MM-DD
  category?: string | null;
  notes?: string | null;
  userId?: string;
  bookId?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface UserGoals {
  incomeTarget?: number | null;
  savingsTarget?: number | null;
  expensesLimit?: number | null;
  purchasesLimit?: number | null;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'pt' | 'en' | 'es';
  currency: string;
  hideValues?: boolean;
  goals?: UserGoals;
}

export interface Book {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  order: number;
}

export type FilterType = 'all' | 'today' | 'month' | 'overdue' | 'next7' | 'next30';
export type ViewType = 'general' | 'list' | 'purchases' | 'incomes';

export interface Totals {
  allOpen: number;
  monthOpen: number;
  overdue: number;
  countOpen: number;
}

export interface ConfirmState {
  open: boolean;
  id: string | null;
}

export type NotificationType = 'success' | 'error' | 'info';

export interface WithError { error?: string }
export interface WithAriaLabel { ariaLabel?: string }
export interface WithOptionalTitle { title?: string }
export interface WithOptionalDuration { duration?: number }

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}
