// React
import { useEffect, useState } from 'react';

// Firebase
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isLocalMode } from '@/firebase';
import * as local from '@/utils/localDb';

// Utils
import { ymd, nextOccurrenceISO } from '@/utils/utils';

// Hooks
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/contexts/AuthContext';

// Types
import * as Types from '@/types';

export default function useFirebaseBills() {
  const [bills, setBills] = useState<Types.Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) { setBills([]); setLoading(false); return; }
    if (isLocalMode) {
      setBills(local.list('bills', user.uid) as Types.Bill[]);
      setLoading(false);
      return;
    }
    const billsRef = query(collection(db, 'bills'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      billsRef,
      (snapshot) => {
        const data: Types.Bill[] = snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Types.Bill, 'id'>) }));
        setBills(data); setLoading(false);
      },
      (error) => { console.error('Erro no listener do Firestore:', error); setLoading(false); showNotification(t.error_load, 'error'); }
    );
    return () => unsubscribe();
  }, [showNotification, t, user]);

  const addBill = async (bill: Omit<Types.Bill, 'id'>) => {
    try {
      if (!user) throw new Error('not-authenticated');
      if (isLocalMode) {
        local.add('bills', { ...bill, userId: user.uid });
        setBills(local.list('bills', user.uid) as Types.Bill[]);
        return;
      }
      const ref = collection(db, 'bills');
      await addDoc(ref, { title: bill.title, amount: bill.amount, dueDate: bill.dueDate, recurrence: bill.recurrence, paid: bill.paid || false, paidOn: bill.paidOn || null, category: bill.category || null, notes: bill.notes || null, tags: bill.tags || [], userId: user.uid, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Erro ao adicionar conta:', error);
      showNotification(t.error_add, 'error');
      throw error;
    }
  };

  const updateBill = async (bill: Types.Bill) => {
    try {
      if (!bill.id) throw new Error('Bill ID is required to update');
      if (isLocalMode) {
        local.update('bills', bill.id, bill as any); setBills(local.list('bills', user?.uid) as Types.Bill[]); return;
      }
      const ref = doc(db, 'bills', bill.id);
      await updateDoc(ref, { title: bill.title, amount: bill.amount, dueDate: bill.dueDate, recurrence: bill.recurrence, paid: bill.paid || false, paidOn: bill.paidOn || null, ...(bill.category && { category: bill.category }), ...(bill.notes && { notes: bill.notes }), ...(bill.tags && { tags: bill.tags }), updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Erro ao atualizar conta:', error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  const upsertBill = async (bill: Types.Bill | Omit<Types.Bill, 'id'>) => {
    if ('id' in bill && bill.id) {
      await updateBill(bill as Types.Bill);
    } else {
      await addBill(bill as Omit<Types.Bill, 'id'>);
    }
  };

  const removeBill = async (id: string) => {
    try {
      if (isLocalMode) { local.remove('bills', id); setBills(local.list('bills', user?.uid) as Types.Bill[]); return; }
      const ref = doc(db, 'bills', id);
      await deleteDoc(ref);
    } catch (error) {
      console.error('Erro ao remover conta:', error);
      showNotification(t.error_delete, 'error');
      throw error;
    }
  };

  const markPaid = async (bill: Types.Bill, advance = false) => {
    try {
      if (!bill.id) throw new Error('Bill ID is required to mark as paid');
      const isRecurring = !!bill.recurrence && bill.recurrence !== 'NONE';
      const shouldAdvance = isRecurring || advance;
      if (isLocalMode) {
        const patch: Partial<Types.Bill> = shouldAdvance 
          ? { paid: false, paidOn: ymd(new Date()), dueDate: nextOccurrenceISO(bill.dueDate, bill.recurrence) }
          : { paid: true, paidOn: ymd(new Date()) };
        local.update('bills', bill.id, patch as any); setBills(local.list('bills', user?.uid) as Types.Bill[]); return;
      }
      const billRef = doc(db, 'bills', bill.id);
      if (shouldAdvance) await updateDoc(billRef, { paid: false, paidOn: ymd(new Date()), dueDate: nextOccurrenceISO(bill.dueDate, bill.recurrence), updatedAt: serverTimestamp() });
      else await updateDoc(billRef, { paid: true, paidOn: ymd(new Date()), updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  const unmarkPaid = async (bill: Types.Bill) => {
    try {
      if (!bill.id) throw new Error('Bill ID is required to unmark as paid');
      if (isLocalMode) {
        local.update('bills', bill.id, { paid: false, paidOn: null } as any);
        setBills(local.list('bills', user?.uid) as Types.Bill[]);
        return;
      }
      const billRef = doc(db, 'bills', bill.id);
      await updateDoc(billRef, { paid: false, paidOn: null, updatedAt: serverTimestamp() });
    } catch (error) {
      console.error('Erro ao desmarcar como pago:', error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  return { bills, loading, addBill, updateBill, upsertBill, removeBill, markPaid, unmarkPaid } as const;
}
