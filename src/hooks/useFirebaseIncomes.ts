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

export default function useFirebaseIncomes() {
  const [incomes, setIncomes] = useState<Types.Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIncomes([]);
      setLoading(false);
      return;
    }
    if (isLocalMode) {
      setIncomes(local.list('incomes', user.uid) as Types.Income[]);
      setLoading(false);
      return;
    }
    const ref = query(collection(db, 'incomes'), where('userId','==', user.uid));
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data: Types.Income[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Types.Income, 'id'>) }));
        setIncomes(data);
        setLoading(false);
      },
      (error) => {
        console.error('Erro no listener do Firestore (incomes):', error);
        setLoading(false);
        showNotification(t.error_load, 'error');
      }
    );
    return () => unsubscribe();
  }, [showNotification, t, user]);

  const addIncome = async (income: Omit<Types.Income, 'id'>) => {
    try {
      if (!user) throw new Error('not-authenticated');
      if (isLocalMode) {
        local.add('incomes', { ...income, userId: user.uid });
        setIncomes(local.list('incomes', user.uid) as Types.Income[]);
        return;
      }
      const ref = collection(db, 'incomes');
      await addDoc(ref, {
        title: income.title,
        amount: income.amount,
        dueDate: income.dueDate,
        recurrence: income.recurrence,
        category: income.category,
        notes: income.notes || null,
        userId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao adicionar renda:', error);
      showNotification(t.error_add, 'error');
      throw error;
    }
  };

  const updateIncome = async (income: Types.Income) => {
    try {
      if (!income.id) throw new Error('Income ID is required to update');
      if (isLocalMode) {
        local.update('incomes', income.id, income as any); setIncomes(local.list('incomes', user?.uid) as Types.Income[]); return;
      }
      const ref = doc(db, 'incomes', income.id);
      await updateDoc(ref, {
        title: income.title,
        amount: income.amount,
        dueDate: income.dueDate,
        recurrence: income.recurrence,
        category: income.category,
        ...(income.notes && { notes: income.notes }),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erro ao atualizar renda:', error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  const upsertIncome = async (income: Types.Income | Omit<Types.Income, 'id'>) => {
    if ('id' in income && income.id) {
      await updateIncome(income as Types.Income);
    } else {
      await addIncome(income as Omit<Types.Income, 'id'>);
    }
  };

  const removeIncome = async (id: string) => {
    try {
      const ref = doc(db, 'incomes', id);
      await deleteDoc(ref);
    } catch (error) {
      console.error('Erro ao remover renda:', error);
      showNotification(t.error_delete, 'error');
      throw error;
    }
  };

  return { incomes, loading, addIncome, updateIncome, upsertIncome, removeIncome } as const;
}
