import { ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  GoogleAuthProvider,
  ConfirmationResult,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithPhoneNumber,

  type ApplicationVerifier,
} from 'firebase/auth';
import { auth, isLocalMode } from '@/firebase';
import { AuthContext, AuthUser } from '@/contexts/AuthContextDefinition';

interface AuthProviderProps {
  children: ReactNode;
}

const LOCAL_STORAGE_KEY = 'myBills.auth.user';
const DEFAULT_ADMIN_USERNAME = (import.meta.env.VITE_DEFAULT_ADMIN_USERNAME || 'Admin').toString();
const DEFAULT_ADMIN_EMAIL = (import.meta.env.VITE_DEFAULT_ADMIN_EMAIL || 'admin@mybills.app').toString();
const DEFAULT_ADMIN_PASSWORD = (import.meta.env.VITE_DEFAULT_ADMIN_PASSWORD || '0000').toString();
const LOCAL_PHONE_CODE = (import.meta.env.VITE_DEFAULT_PHONE_CODE || '000000').toString();

type LocalPhoneSession = {
  phone: string;
};

const buildLocalAdmin = (): AuthUser => ({
  uid: 'local-admin',
  displayName: DEFAULT_ADMIN_USERNAME,
  photoURL: null,
  email: DEFAULT_ADMIN_EMAIL,
});

const normalizeLoginIdentifier = (identifier: string): string => {
  const trimmed = identifier.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  if (!trimmed.includes('@') && lower === DEFAULT_ADMIN_USERNAME.toLowerCase()) {
    return DEFAULT_ADMIN_EMAIL.toLowerCase();
  }
  return lower;
};

const persistLocalUser = (u: AuthUser | null) => {
  if (typeof window === 'undefined') return;
  if (u) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(u));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const phoneConfirmationRef = useRef<ConfirmationResult | null>(null);
  const localPhoneSessionRef = useRef<LocalPhoneSession | null>(null);

  useEffect(() => {
    if (isLocalMode) {
      try {
        const stored = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_KEY) : null;
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (error) {
        console.warn('[AuthProvider] Falha ao carregar usuario local', error);
      } finally {
        setLoading(false);
      }
      return () => {};
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          email: firebaseUser.email,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLocalSignIn = useCallback((nextUser: AuthUser) => {
    setUser(nextUser);
    persistLocalUser(nextUser);
  }, []);

  const handleLocalSignOut = useCallback(() => {
    setUser(null);
    persistLocalUser(null);
    localPhoneSessionRef.current = null;
  }, []);

  const signInWithEmail = useCallback(
    async (rawEmail: string, password: string) => {
      setIsProcessing(true);
      try {
        if (isLocalMode) {
          const email = normalizeLoginIdentifier(rawEmail);
          const expectedEmail = DEFAULT_ADMIN_EMAIL.toLowerCase();
          const matches = email === expectedEmail && password === DEFAULT_ADMIN_PASSWORD;
          if (!matches) {
            throw new Error('Credenciais invalidas');
          }
          handleLocalSignIn(buildLocalAdmin());
          return;
        }
        await signInWithEmailAndPassword(auth, rawEmail, password);
      } finally {
        setIsProcessing(false);
      }
    },
    [handleLocalSignIn],
  );

  const signInWithGoogle = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (isLocalMode) {
        handleLocalSignIn(buildLocalAdmin());
        return;
      }
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } finally {
      setIsProcessing(false);
    }
  }, [handleLocalSignIn]);

  const startPhoneSignIn = useCallback(
    async (phone: string, verifier: ApplicationVerifier) => {
      setIsProcessing(true);
      try {
        if (isLocalMode) {
          localPhoneSessionRef.current = { phone };
          return 'local-phone-session';
        }
        const confirmation = await signInWithPhoneNumber(auth, phone, verifier);
        phoneConfirmationRef.current = confirmation;
        return confirmation.verificationId;
      } finally {
        setIsProcessing(false);
      }
    },
    [],
  );

  const confirmPhoneCode = useCallback(
    async (code: string) => {
      setIsProcessing(true);
      try {
        if (isLocalMode) {
          const pending = localPhoneSessionRef.current;
          if (!pending) throw new Error('Fluxo de telefone nao iniciado');
          if (code !== LOCAL_PHONE_CODE) throw new Error('Codigo incorreto');
          handleLocalSignIn(buildLocalAdmin());
          localPhoneSessionRef.current = null;
          return;
        }
        const confirmation = phoneConfirmationRef.current;
        if (!confirmation) {
          throw new Error('Fluxo de telefone nao iniciado');
        }
        await confirmation.confirm(code);
        phoneConfirmationRef.current = null;
      } finally {
        setIsProcessing(false);
      }
    },
    [handleLocalSignIn],
  );

  const cancelPhoneSignIn = useCallback(() => {
    phoneConfirmationRef.current = null;
    localPhoneSessionRef.current = null;
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    if (isLocalMode) return;
    await sendPasswordResetEmail(auth, email);
  }, []);

  const signOutApp = useCallback(async () => {
    setIsProcessing(true);
    try {
      if (isLocalMode) {
        handleLocalSignOut();
        return;
      }
      await signOut(auth);
    } finally {
      setIsProcessing(false);
    }
  }, [handleLocalSignOut]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isProcessing,
      signInWithEmail,
      signInWithGoogle,
      startPhoneSignIn,
      confirmPhoneCode,
      cancelPhoneSignIn,
      sendPasswordReset,
      signOutApp,
    }),
    [
      user,
      loading,
      isProcessing,
      signInWithEmail,
      signInWithGoogle,
      startPhoneSignIn,
      confirmPhoneCode,
      cancelPhoneSignIn,
      sendPasswordReset,
      signOutApp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
