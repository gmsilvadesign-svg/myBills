import { useEffect, useState } from "react";
import { collection, onSnapshot, addDoc, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase.ts";
import { ymd, nextOccurrenceISO } from "../utils/utils";

export default function useFirebaseBills() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const billsRef = collection(db, "bills");

    // Listener em tempo real
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

  // Adiciona ou atualiza bill
  const upsertBill = async (bill: any) => {
    const billToSave: any = {
      title: bill.title,
      amount: bill.amount,
      dueDate: bill.dueDate,
      recurrence: bill.recurrence,
      paid: bill.paid || false,
      paidOn: bill.paidOn || null
    };

    if (bill.category) billToSave.category = bill.category;
    if (bill.notes) billToSave.notes = bill.notes;
    if (bill.tags?.length) billToSave.tags = bill.tags;

    if (bill.id) {
      const ref = doc(db, "bills", bill.id);
      await setDoc(ref, billToSave);
    } else {
      const ref = collection(db, "bills");
      await addDoc(ref, billToSave);
    }
  };

  // Remove bill
  const removeBill = async (id: string) => {
    const ref = doc(db, "bills", id);
    await deleteDoc(ref);
  };


  const markPaid = async (bill, advance = false) => {
    const billRef = doc(db, "bills", bill.id);

    if (advance && bill.recurrence && bill.recurrence !== "NONE") {
      await updateDoc(billRef, {
        paid: false,
        paidOn: null,
        dueDate: nextOccurrenceISO(bill.dueDate, bill.recurrence)
      });
    } else {
      await updateDoc(billRef, {
        paid: true,
        paidOn: ymd(new Date())
      });
    }
  };

  return { bills, upsertBill, removeBill, markPaid };
}