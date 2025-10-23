import { collection, deleteDoc, getDocs, query, where } from "firebase/firestore";

import { db, isLocalMode } from "@/firebase";
import * as local from "@/utils/localDb";

const COLLECTIONS = ["bills", "incomes", "purchases"] as const;

export async function purgeBookData(bookId: string) {
  if (!bookId) return;
  if (isLocalMode) {
    COLLECTIONS.forEach((name) => {
      local.removeWhere(name, (row) => row.bookId === bookId);
    });
    return;
  }

  for (const name of COLLECTIONS) {
    const snapshot = await getDocs(
      query(collection(db, name), where("bookId", "==", bookId)),
    );
    await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
  }
}

