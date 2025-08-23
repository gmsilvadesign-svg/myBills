import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Firebase para testes
const mockFirebase = {
  initializeApp: vi.fn(),
  getFirestore: vi.fn(() => ({})),
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
}

vi.mock('firebase/app', () => mockFirebase)
vi.mock('firebase/firestore', () => mockFirebase)

// Mock do contexto de notificação
vi.mock('@/contexts/NotificationContext', () => ({
  useNotification: () => ({
    showNotification: vi.fn(),
  }),
  NotificationContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}))

// Mock do contexto de tradução
vi.mock('@/contexts/TranslationContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    locale: 'pt-BR',
    currency: 'BRL',
  }),
  TranslationContext: {
    Provider: ({ children }: { children: React.ReactNode }) => children,
  },
}))