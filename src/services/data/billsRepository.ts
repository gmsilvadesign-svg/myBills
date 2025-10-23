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
} from "firebase/firestore";

import { db, isLocalMode } from "@/firebase";
import * as local from "@/utils/localDb";
import { nextOccurrenceISO, prevOccurrenceISO, ymd } from "@/utils/utils";
import * as Types from "@/types";

export interface SubscribeBillsParams {
  userId: string;
  bookId: string;
  onData: (bills: Types.Bill[]) => void;
  onError: (error: Error) => void;
}

export function subscribeToBills({
  userId,
  bookId,
  onData,
  onError,
}: SubscribeBillsParams) {
  if (!userId || !bookId) {
    onData([]);
    return () => {};
  }
  if (isLocalMode) {
    onData(listLocalBills(userId, bookId));
    return () => {};
  }

  const billsRef = query(
    collection(db, "bills"),
    where("userId", "==", userId),
    where("bookId", "==", bookId),
  );
  const unsubscribe = onSnapshot(
    billsRef,
    (snapshot) => {
      const data: Types.Bill[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Types.Bill, "id">),
      }));
      onData(data);
    },
    (error) => {
      console.error("[billsRepository] snapshot error", error);
      onError(error);
    },
  );
  return unsubscribe;
}

export function listLocalBills(userId: string, bookId: string) {
  const rows = (local.list("bills", userId) as Types.Bill[]).filter(
    (bill) => bill.bookId === bookId,
  );
  return rows;
}

interface BillBase {
  title: string;
  amount: number;
  dueDate: string;
  recurrence: Types.Bill["recurrence"];
  paid?: boolean;
  paidOn?: string | null;
  category?: string | null;
  notes?: string | null;
  tags?: string[];
  bookId: string;
}

export async function addBill(userId: string, bill: BillBase) {
  if (!userId) throw new Error("not-authenticated");
  if (!bill.bookId) throw new Error("book-not-selected");
  if (isLocalMode) {
    local.add("bills", {
      ...bill,
      userId,
      paid: bill.paid ?? false,
      paidOn: bill.paidOn ?? null,
    });
    return;
  }
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
    userId,
    bookId: bill.bookId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBill(bill: Types.Bill) {
  if (!bill.id) throw new Error("Bill ID is required to update");
  if (isLocalMode) {
    local.update("bills", bill.id, bill as any);
    return;
  }
  const ref = doc(db, "bills", bill.id);
  await updateDoc(ref, {
    title: bill.title,
    amount: bill.amount,
    dueDate: bill.dueDate,
    recurrence: bill.recurrence,
    paid: bill.paid || false,
    paidOn: bill.paidOn || null,
    ...(bill.category ? { category: bill.category } : { category: null }),
    ...(bill.notes ? { notes: bill.notes } : { notes: null }),
    ...(bill.tags ? { tags: bill.tags } : {}),
    ...(bill.bookId ? { bookId: bill.bookId } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBill(id: string) {
  if (!id) throw new Error("Bill ID is required to delete");
  if (isLocalMode) {
    local.remove("bills", id);
    return;
  }
  const ref = doc(db, "bills", id);
  await deleteDoc(ref);
}

export async function markBillPaid(bill: Types.Bill, advance = false) {
  if (!bill.id) throw new Error("Bill ID is required to mark as paid");
  const isRecurring = !!bill.recurrence && bill.recurrence !== "NONE";
  const shouldAdvance = advance && isRecurring;
  const paidOn = ymd(new Date());
  if (isLocalMode) {
    const patch: Partial<Types.Bill> = shouldAdvance
      ? {
          paid: false,
          paidOn,
          dueDate: nextOccurrenceISO(bill.dueDate, bill.recurrence),
        }
      : { paid: true, paidOn };
    local.update("bills", bill.id, patch as any);
    return;
  }
  const billRef = doc(db, "bills", bill.id);
  if (shouldAdvance) {
    await updateDoc(billRef, {
      paid: false,
      paidOn,
      dueDate: nextOccurrenceISO(bill.dueDate, bill.recurrence),
      updatedAt: serverTimestamp(),
    });
  } else {
    await updateDoc(billRef, {
      paid: true,
      paidOn,
      updatedAt: serverTimestamp(),
    });
  }
}

export async function unmarkBillPaid(bill: Types.Bill) {
  if (!bill.id) throw new Error("Bill ID is required to unmark as paid");
  const shouldRevertDue =
    !!bill.recurrence && bill.recurrence !== "NONE" && !!bill.paidOn;
  const revertedDue = shouldRevertDue
    ? prevOccurrenceISO(bill.dueDate, bill.recurrence)
    : bill.dueDate;
  if (isLocalMode) {
    local.update(
      "bills",
      bill.id,
      { paid: false, paidOn: null, dueDate: revertedDue } as any,
    );
    return;
  }
  const billRef = doc(db, "bills", bill.id);
  await updateDoc(billRef, {
    paid: false,
    paidOn: null,
    ...(shouldRevertDue ? { dueDate: revertedDue } : {}),
    updatedAt: serverTimestamp(),
  });
}
