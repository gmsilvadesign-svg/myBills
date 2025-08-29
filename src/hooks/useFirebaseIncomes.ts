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

export default function useFirebaseIncomes() {
  const [incomes, setIncomes] = useState<Types.Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    const ref = collection(db, 'incomes');
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
  }, [showNotification, t]);

  const addIncome = async (income: Omit<Types.Income, 'id'>) => {
    try {
      const ref = collection(db, 'incomes');
      await addDoc(ref, {
        title: income.title,
        amount: income.amount,
        dueDate: income.dueDate,
        recurrence: income.recurrence,
        category: income.category,
        notes: income.notes || null,
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
      const ref = doc(db, 'incomes', income.id);
      await updateDoc(ref, {
        title: income.title,
        amount: income.amount,
        dueDate: income.dueDate,
        recurrence: income.recurrence,
        category: income.category,
        ...(income.notes && { notes: income.notes }),
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

