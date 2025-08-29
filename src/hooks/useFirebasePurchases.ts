// React
import { useEffect, useState } from 'react';

// Firebase
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebase';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';

// Types
import * as Types from '@/types';

export default function useFirebasePurchases() {
  const [purchases, setPurchases] = useState<Types.Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    const ref = collection(db, 'purchases');
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
  }, [showNotification, t]);

  const addPurchase = async (purchase: Omit<Types.Purchase, 'id'>) => {
    try {
      const ref = collection(db, 'purchases');
      await addDoc(ref, {
        title: purchase.title,
        amount: purchase.amount,
        date: purchase.date,
        category: purchase.category || null,
        notes: purchase.notes || null,
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
      const ref = doc(db, 'purchases', purchase.id);
      await updateDoc(ref, {
        title: purchase.title,
        amount: purchase.amount,
        date: purchase.date,
        ...(purchase.category && { category: purchase.category }),
        ...(purchase.notes && { notes: purchase.notes }),
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

