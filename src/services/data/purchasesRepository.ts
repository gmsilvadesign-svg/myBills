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

export interface SubscribePurchasesParams {
  userId: string;
  bookId: string;
  onData: (purchases: Types.Purchase[]) => void;
  onError: (error: Error) => void;
}

export function subscribeToPurchases({
  userId,
  bookId,
  onData,
  onError,
}: SubscribePurchasesParams) {
  if (!userId || !bookId) {
    onData([]);
    return () => {};
  }
  if (isLocalMode) {
    onData(listLocalPurchases(userId, bookId));
    return () => {};
  }

  const ref = query(
    collection(db, "purchases"),
    where("userId", "==", userId),
    where("bookId", "==", bookId),
  );
  const unsubscribe = onSnapshot(
    ref,
    (snapshot) => {
      const data: Types.Purchase[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<Types.Purchase, "id">),
      }));
      onData(data);
    },
    (error) => {
      console.error("[purchasesRepository] snapshot error", error);
      onError(error);
    },
  );
  return unsubscribe;
}

export function listLocalPurchases(userId: string, bookId: string) {
  const rows = (local.list("purchases", userId) as Types.Purchase[]).filter(
    (purchase) => purchase.bookId === bookId,
  );
  return rows;
}

interface PurchaseBase {
  title: string;
  amount: number;
  date: string;
  category?: string | null;
  notes?: string | null;
  bookId: string;
}

export async function addPurchase(userId: string, purchase: PurchaseBase) {
  if (!userId) throw new Error("not-authenticated");
  if (!purchase.bookId) throw new Error("book-not-selected");
  if (isLocalMode) {
    local.add("purchases", {
      ...purchase,
      userId,
    });
    return;
  }
  const ref = collection(db, "purchases");
  await addDoc(ref, {
    title: purchase.title,
    amount: purchase.amount,
    date: purchase.date,
    category: purchase.category || null,
    notes: purchase.notes || null,
    userId,
    bookId: purchase.bookId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updatePurchase(purchase: Types.Purchase) {
  if (!purchase.id) throw new Error("Purchase ID is required to update");
  if (isLocalMode) {
    local.update("purchases", purchase.id, purchase as any);
    return;
  }
  const ref = doc(db, "purchases", purchase.id);
  await updateDoc(ref, {
    title: purchase.title,
    amount: purchase.amount,
    date: purchase.date,
    ...(purchase.category ? { category: purchase.category } : { category: null }),
    ...(purchase.notes ? { notes: purchase.notes } : { notes: null }),
    ...(purchase.bookId ? { bookId: purchase.bookId } : {}),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePurchase(id: string) {
  if (!id) throw new Error("Purchase ID is required to delete");
  if (isLocalMode) {
    local.remove("purchases", id);
    return;
  }
  const ref = doc(db, "purchases", id);
  await deleteDoc(ref);
}

