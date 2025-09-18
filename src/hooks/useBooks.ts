import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db, isLocalMode } from '@/firebase';
import { useAuth } from '@/contexts/AuthContext';
import * as Types from '@/types';
import { useNotification } from '@/hooks/useNotification';
import { useTranslation } from '@/hooks/useTranslation';
import * as local from '@/utils/localDb';

const COLLECTION = 'books';

interface CreateBookOptions {
  name?: string;
}

const toBook = (id: string, data: Record<string, unknown>): Types.Book => {
  const createdAt = (() => {
    const raw = data.createdAt as { toDate?: () => Date } | undefined;
    if (raw && typeof raw.toDate === 'function') {
      return raw.toDate().toISOString();
    }
    if (typeof data.createdAt === 'string') return data.createdAt;
    return new Date().toISOString();
  })();
  return {
    id,
    name: String(data.name ?? 'Book Financeiro'),
    ownerId: String(data.ownerId ?? ''),
    createdAt,
    order: Number(data.order ?? 0),
  };
};

export function useBooks() {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const [books, setBooks] = useState<Types.Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setBooks([]);
      setLoading(false);
      return;
    }

    if (isLocalMode) {
      const entries = (local.list(COLLECTION, user.uid) as Types.Book[]) || [];
      setBooks(entries.sort((a, b) => b.order - a.order || (b.createdAt.localeCompare(a.createdAt))));
      setLoading(false);
      return;
    }

    const q = query(collection(db, COLLECTION), where('ownerId', '==', user.uid), orderBy('order', 'desc'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => toBook(docSnap.id, docSnap.data()));
        setBooks(data);
        setLoading(false);
      },
      (error) => {
        console.error('[useBooks] snapshot error', error);
        setLoading(false);
        showNotification(t.error_load ?? 'Não foi possível carregar os books.', 'error');
      },
    );

    return () => unsub();
  }, [showNotification, t, user]);

  const nextBookName = useCallback(
    (existing: Types.Book[]) => {
      const highest = existing.reduce((max, entry) => {
        const match = /Book Financeiro #(\d+)/i.exec(entry.name ?? '');
        if (!match) return max;
        const value = Number(match[1]);
        return Number.isFinite(value) && value > max ? value : max;
      }, 0);
      return `Book Financeiro #${highest + 1}`;
    },
    [],
  );

  const createBook = useCallback(
    async ({ name }: CreateBookOptions = {}) => {
      if (!user) throw new Error('not-authenticated');
      const finalName = name && name.trim().length > 0 ? name.trim() : nextBookName(books);
      const order = books.length ? Math.max(...books.map((b) => b.order ?? 0)) + 1 : 1;

      if (isLocalMode) {
        const id = local.add(COLLECTION, {
          name: finalName,
          ownerId: user.uid,
          userId: user.uid,
          createdAt: new Date().toISOString(),
          order,
        });
        const updated = (local.list(COLLECTION, user.uid) as Types.Book[]) || [];
        setBooks(updated.sort((a, b) => b.order - a.order || b.createdAt.localeCompare(a.createdAt)));
        return updated.find((book) => book.id === id) ?? null;
      }

      const ref = await addDoc(collection(db, COLLECTION), {
        name: finalName,
        ownerId: user.uid,
        createdAt: serverTimestamp(),
        order,
      });
      return { id: ref.id, name: finalName, ownerId: user.uid, createdAt: new Date().toISOString(), order } satisfies Types.Book;
    },
    [books, nextBookName, user],
  );

  const removeBook = useCallback(
    async (bookId: string) => {
      if (!user) throw new Error('not-authenticated');
      if (isLocalMode) {
        local.remove(COLLECTION, bookId);
        setBooks((prev) => prev.filter((book) => book.id !== bookId));
        return;
      }
      await deleteDoc(doc(db, COLLECTION, bookId));
    },
    [user],
  );

  return useMemo(
    () => ({ books, loading, createBook, removeBook }),
    [books, loading, createBook, removeBook],
  );
}

export type UseBooksReturn = ReturnType<typeof useBooks>;
