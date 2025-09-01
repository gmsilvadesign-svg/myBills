import { ReactNode, useEffect, useMemo, useState, useContext } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { auth, isLocalMode } from '@/firebase';
import { AuthContext, AuthUser } from '@/contexts/AuthContextDefinition';

interface AuthProviderProps { children: ReactNode }

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLocalMode) {
      // Usuário local simulado (sem login real)
      setUser({ uid: 'local-user', displayName: 'Usuário Local', photoURL: null, email: null });
      setLoading(false);
      return () => {};
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser({ uid: u.uid, displayName: u.displayName, photoURL: u.photoURL, email: u.email });
      else setUser(null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signInWithGoogle = async () => {
    if (isLocalMode) {
      setUser({ uid: 'local-user', displayName: 'Usuário Local', photoURL: null, email: null });
      return;
    }
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const signOutApp = async () => {
    if (isLocalMode) {
      setUser({ uid: 'local-user', displayName: 'Usuário Local', photoURL: null, email: null });
      return;
    }
    await signOut(auth);
  };

  const value = useMemo(() => ({ user, loading, signInWithGoogle, signOutApp }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
