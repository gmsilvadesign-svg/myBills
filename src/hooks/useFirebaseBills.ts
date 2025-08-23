// React
import { useEffect, useState } from "react";

// Firebase
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc 
} from "firebase/firestore";
import { db } from "@/firebase";

// Utils
import { ymd, nextOccurrenceISO } from "@/utils/utils";

// Hooks
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/hooks/useTranslation";

// Types
import * as Types from "@/types";

export default function useFirebaseBills() {
  const [bills, setBills] = useState<Types.Bill[]>([]);
  const [loading, setLoading] = useState(true); // começa carregando
  const { showNotification } = useNotification();
  const { t } = useTranslation();

  useEffect(() => {
    const billsRef = collection(db, "bills");

    const unsubscribe = onSnapshot(
      billsRef,
      (snapshot) => {
        // Tipar explicitamente os documentos do Firestore como Types.Bill
        const data: Types.Bill[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Types.Bill, "id">),
        }));
        setBills(data);
        setLoading(false); // primeira resposta chegou → para de carregar
      },
      (error) => {
        console.error("Erro no listener do Firestore:", error);
        setLoading(false);
        // t é um objeto de traduções, não uma função
        showNotification(t.error_load, "error");
      }
    );

    return () => unsubscribe();
  }, [showNotification, t]);

  const addBill = async (bill: Omit<Types.Bill, 'id'>) => {
    try {
      const ref = collection(db, "bills");
      await addDoc(ref, {
        title: bill.title,
        amount: bill.amount,
        dueDate: bill.dueDate,
        recurrence: bill.recurrence,
        paid: bill.paid || false,
        paidOn: bill.paidOn || null,
        category: bill.category || null,
        notes: bill.notes || null,
        tags: bill.tags || [],
      });
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      showNotification(t.error_add, 'error');
      throw error;
    }
  };

  const updateBill = async (bill: Types.Bill) => {
    try {
      if (!bill.id) throw new Error("Bill ID is required to update");
      const ref = doc(db, "bills", bill.id);
      await updateDoc(ref, {
        title: bill.title,
        amount: bill.amount,
        dueDate: bill.dueDate,
        recurrence: bill.recurrence,
        paid: bill.paid || false,
        paidOn: bill.paidOn || null,
        ...(bill.category && { category: bill.category }),
        ...(bill.notes && { notes: bill.notes }),
        ...(bill.tags && { tags: bill.tags }),
      });
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  const upsertBill = async (bill: Types.Bill | Omit<Types.Bill, 'id'>) => {
    // Narrowing por presença da propriedade "id" no objeto
    if ("id" in bill && bill.id) {
      await updateBill(bill as Types.Bill);
    } else {
      await addBill(bill as Omit<Types.Bill, 'id'>);
    }
  };

  const removeBill = async (id: string) => {
    try {
      const ref = doc(db, "bills", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Erro ao remover conta:", error);
      showNotification(t.error_delete, 'error');
      throw error;
    }
  };

  const markPaid = async (bill: Types.Bill, advance = false) => {
    try {
      if (!bill.id) throw new Error("Bill ID is required to mark as paid");
      const billRef = doc(db, "bills", bill.id);

      if (advance && bill.recurrence && bill.recurrence !== "NONE") {
        await updateDoc(billRef, {
          paid: false,
          paidOn: null,
          dueDate: nextOccurrenceISO(bill.dueDate, bill.recurrence),
        });
      } else {
        await updateDoc(billRef, {
          paid: true,
          paidOn: ymd(new Date()),
        });
      }
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      showNotification(t.error_update, 'error');
      throw error;
    }
  };

  return { bills, loading, addBill, updateBill, upsertBill, removeBill, markPaid } as const;
}
