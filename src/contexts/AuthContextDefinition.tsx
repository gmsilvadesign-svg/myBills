import { createContext } from 'react';
import type { ApplicationVerifier } from 'firebase/auth';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isProcessing: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  startPhoneSignIn: (phone: string, verifier: ApplicationVerifier) => Promise<string>;
  confirmPhoneCode: (code: string) => Promise<void>;
  cancelPhoneSignIn: () => void;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutApp: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
