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
import * as Types from "@/types";

export interface SubscribeIncomesParams {
  userId: string;
  bookId: string;
  onData: (incomes: Types.Income[]) => void;
  onError: (error: Error) => void;
}

export function subscribeToIncomes({
  userId,
  bookId,
  onData,
  onError,
}: SubscribeIncomesParams) {
  if (!userId || !bookId) {
    onData([]);
    return () => {};
  }
  if (isLocalMode) {
    onData(listLocalIncomes(userId, bookId));
    return () => {};
  }

  const ref = query(
    collection(db, "incomes"),
    where("userId", "==", userId),
    where("bookId", "==", bookId),
  );
  const unsubscribe = onSnapshot(
    ref,
    (snapshot) => {
      const data: Types.Income[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Types.Income, "id">),
      }));
      onData(data);
    },
    (error) => {
      console.error("[incomesRepository] snapshot error", error);
      onError(error);
    },
  );
  return unsubscribe;
}

export function listLocalIncomes(userId: string, bookId: string) {
  const rows = (local.list("incomes", userId) as Types.Income[]).filter(
    (income) => income.bookId === bookId,
  );
  return rows;
}

interface IncomeBase {
  title: string;
  amount: number;
  dueDate: string;
  recurrence: Types.Income["recurrence"];
  category: string;
  notes?: string | null;
  bookId: string;
}

export async function addIncome(userId: string, income: IncomeBase) {
  if (!userId) throw new Error("not-authenticated");
  if (!income.bookId) throw new Error("book-not-selected");
  if (isLocalMode) {
    local.add("incomes", {
      ...income,
      userId,
    });
    return;
  }
  const ref = collection(db, "incomes");
  await addDoc(ref, {
    title: income.title,
    amount: income.amount,
    dueDate: income.dueDate,
    recurrence: income.recurrence,
    category: income.category,
    notes: income.notes || null,
    userId,
    bookId: income.bookId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateIncome(income: Types.Income) {
  if (!income.id) throw new Error("Income ID is required to update");
  if (isLocalMode) {
    local.update("incomes", income.id, income as any);
    return;
  }
  const ref = doc(db, "incomes", income.id);
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
}

export async function deleteIncome(id: string) {
  if (!id) throw new Error("Income ID is required to delete");
  if (isLocalMode) {
    local.remove("incomes", id);
    return;
  }
  const ref = doc(db, "incomes", id);
  await deleteDoc(ref);
}

