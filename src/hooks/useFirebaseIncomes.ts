// React
import { useCallback, useEffect, useState } from 'react';

// Firebase
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db, isLocalMode } from '@/firebase';
import * as local from '@/utils/localDb';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';

// Types
import * as Types from '@/types';

export default function useFirebaseIncomes(activeBookId?: string | null) {
  const [incomes, setIncomes] = useState<Types.Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  const syncLocal = useCallback(() => {
    if (!user || !activeBookId) {
      setIncomes([]);
      return;
    }
    const rows = (local.list('incomes', user.uid) as Types.Income[]).filter((income) => income.bookId === activeBookId);
    setIncomes(rows);
  }, [activeBookId, user]);

  useEffect(() => {
    if (!user || !activeBookId) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    if (isLocalMode) {
      syncLocal();
      setLoading(false);
      return;
    }

    const ref = query(
      collection(db, 'incomes'),
      where('userId', '==', user.uid),
      where('bookId', '==', activeBookId),
    );
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        const data: Types.Income[] = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...(docSnap.data() as Omit<Types.Income, 'id'>) }));
        setIncomes(data);
        setLoading(false);
      },
      (error) => {
        console.error('[useFirebaseIncomes] snapshot error', error);
        setLoading(false);
        showNotification(t.error_load, 'error');
      },
    );

    return () => unsubscribe();
  }, [activeBookId, showNotification, syncLocal, t, user]);

  const addIncome = async (income: Omit<Types.Income, 'id'>) => {
    try {
      if (!user) throw new Error('not-authenticated');
      const resolvedBookId = income.bookId ?? activeBookId;
      if (!resolvedBookId) throw new Error('book-not-selected');
      if (isLocalMode) {
        local.add('incomes', { ...income, userId: user.uid, bookId: resolvedBookId });
        syncLocal();
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
        bookId: resolvedBookId,
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
        local.update('incomes', income.id, income as any);
        syncLocal();
        return;
      }
      const ref = doc(db, 'incomes', income.id);
      await updateDoc(ref, {
        title: income.title,
        amount: income.amount,
        dueDate: income.dueDate,
        recurrence: income.recurrence,
        category: income.category,
        ...(income.notes ? { notes: income.notes } : { notes: null }),
        ...(income.bookId ? { bookId: income.bookId } : {}),
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
      if (isLocalMode) {
        local.remove('incomes', id);
        syncLocal();
        return;
      }
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
