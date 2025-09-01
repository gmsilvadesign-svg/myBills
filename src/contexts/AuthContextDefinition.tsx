import { createContext } from 'react';

export interface AuthUser {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutApp: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

