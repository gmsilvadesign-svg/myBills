import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.ts";
import { ymd, nextOccurrenceISO } from "../utils/utils";

export default function useFirebaseBills() {
  const [bills, setBills] = useState([]);

  // Listener em tempo real do Firestore
  useEffect(() => {
    const billsRef = collection(db, "bills");

    const unsubscribe = onSnapshot(
      billsRef,
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setBills(data);
      },
      (error) => {
        console.error("Erro no listener do Firestore:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Cria uma nova bill
  const addBill = async (bill: any) => {
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
  };

  // Atualiza uma bill existente
  const updateBill = async (bill: any) => {
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
  };

  // Atalho para criar ou atualizar
  const upsertBill = async (bill: any) => {
    if (bill.id) {
      await updateBill(bill);
    } else {
      await addBill(bill);
    }
  };

  // Remove uma bill
  const removeBill = async (id: string) => {
    const ref = doc(db, "bills", id);
    await deleteDoc(ref);
  };

  // Marca como pago (ou avança recorrência)
  const markPaid = async (bill: any, advance = false) => {
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
  };

  return { bills, addBill, updateBill, upsertBill, removeBill, markPaid };
}
