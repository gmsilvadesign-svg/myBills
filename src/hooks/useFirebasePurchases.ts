// React
import { useEffect, useState } from 'react';

// Firebase
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db, isLocalMode } from '@/firebase';
import * as local from '@/utils/localDb';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';

// Types
import * as Types from '@/types';

export default function useFirebasePurchases() {
  const [purchases, setPurchases] = useState<Types.Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setPurchases([]);
      setLoading(false);
      return;
    }
    if (isLocalMode) {
      setPurchases(local.list('purchases', user.uid) as Types.Purchase[]);
      setLoading(false);
      return;
    }
    const ref = query(collection(db, 'purchases'), where('userId','==', user.uid));
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data: Types.Purchase[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Types.Purchase, 'id'>) }));
        setPurchases(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro no listener do Firestore (purchases):', error);
        setLoading(false);
        showNotification(t.error_load, 'error');
      }
    );
    return () => unsubscribe();
  }, [showNotification, t, user]);

  const addPurchase = async (purchase: Omit<Types.Purchase, 'id'>) => {
    try {
      if (!user) throw new Error('not-authenticated');
      if (isLocalMode) {
        local.add('purchases', { ...purchase, userId: user.uid });
        setPurchases(local.list('purchases', user.uid) as Types.Purchase[]);
        return;
      }
      const ref = collection(db, 'purchases');
      await addDoc(ref, {
        title: purchase.title,
        amount: purchase.amount,
        date: purchase.date,
        category: purchase.category || null,
        notes: purchase.notes || null,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      showNotification(t.error_add, 'error');
      throw error;
    }
  };

  const updatePurchase = async (purchase: Types.Purchase) => {
    try {
      if (!purchase.id) throw new Error('Purchase ID is required to update');
      if (isLocalMode) {
        local.update('purchases', purchase.id, purchase as any); setPurchases(local.list('purchases', user?.uid) as Types.Purchase[]); return;
      }
      const ref = doc(db, 'purchases', purchase.id);
      await updateDoc(ref, {
        title: purchase.title,
        amount: purchase.amount,
        date: purchase.date,
        ...(purchase.category && { category: purchase.category }),
        ...(purchase.notes && { notes: purchase.notes }),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar compra:', error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  const upsertPurchase = async (purchase: Types.Purchase | Omit<Types.Purchase, 'id'>) => {
    if ('id' in purchase && purchase.id) {
      await updatePurchase(purchase as Types.Purchase);
    } else {
      await addPurchase(purchase as Omit<Types.Purchase, 'id'>);
    }
  };

  const removePurchase = async (id: string) => {
    try {
      if (isLocalMode) { local.remove('purchases', id); setPurchases(local.list('purchases', user?.uid) as Types.Purchase[]); return; }
      const ref = doc(db, 'purchases', id);
      await deleteDoc(ref);
    } catch (error) {
      console.error('Erro ao remover compra:', error);
      showNotification(t.error_delete, 'error');
      throw error;
    }
  };

  return { purchases, loading, addPurchase, updatePurchase, upsertPurchase, removePurchase } as const;
}
