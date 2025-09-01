import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, isSupported } from 'firebase/messaging';
import { getAuth } from 'firebase/auth';

// Modo local: roda sem configurar Firebase (para dev/avaliação)
export const isLocalMode = Boolean(import.meta.env.VITE_LOCAL_MODE) || !import.meta.env.VITE_FIREBASE_PROJECT_ID;

let app: any = null;
if (!isLocalMode) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  } as const;
  app = initializeApp(firebaseConfig);
}

export const db = isLocalMode ? ({} as any) : getFirestore(app);
export const auth = isLocalMode ? ({} as any) : getAuth(app);

export const messaging = async () => {
  if (isLocalMode) return null;
  const supported = await isSupported();
  return supported ? getMessaging(app) : null;
};
