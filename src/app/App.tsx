import { useEffect, useState } from "react";

import "@/styles/index.css";
import "@/styles/App.css";

import SplashScreen from "@/components/UI/auth/SplashScreen";
import LoginScreen from "@/components/UI/auth/LoginScreen";
import BooksLanding from "@/components/UI/auth/BooksLanding";
import LegacyDashboard from "@/app/LegacyDashboard";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PreviewProvider } from "@/contexts/PreviewContext";
import { useBooks } from "@/hooks/useBooks";
import { collection, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { db, isLocalMode } from "@/firebase";
import * as local from "@/utils/localDb";

const ACTIVE_BOOK_STORAGE_KEY = "myBills.activeBook";

const loadStoredActiveBook = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_BOOK_STORAGE_KEY);
};

function AppShell() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [splashFading, setSplashFading] = useState(false);
  const { books, loading: booksLoading, createBook, removeBook } = useBooks();
  const [activeBookId, setActiveBookId] = useState<string | null>(() => loadStoredActiveBook());

  const purgeBookData = async (bookId: string) => {
    if (!bookId) return;
    if (isLocalMode) {
      local.removeWhere('bills', (row) => row.bookId === bookId);
      local.removeWhere('incomes', (row) => row.bookId === bookId);
      local.removeWhere('purchases', (row) => row.bookId === bookId);
      return;
    }
    const collectionNames = ['bills', 'incomes', 'purchases'];
    for (const name of collectionNames) {
      const snapshot = await getDocs(query(collection(db, name), where('bookId', '==', bookId)));
      await Promise.all(snapshot.docs.map((docSnap) => deleteDoc(docSnap.ref)));
    }
  };

  useEffect(() => {
    if (loading) return;
    const fadeTimer = window.setTimeout(() => setSplashFading(true), 350);
    const hideTimer = window.setTimeout(() => setShowSplash(false), 950);
    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [loading]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeBookId) {
      localStorage.removeItem(ACTIVE_BOOK_STORAGE_KEY);
    } else {
      localStorage.setItem(ACTIVE_BOOK_STORAGE_KEY, activeBookId);
    }
  }, [activeBookId]);

  useEffect(() => {
    if (!user) {
      setActiveBookId(null);
      return;
    }
    if (!books.length) {
      setActiveBookId(null);
      return;
    }
    if (activeBookId && books.some((book) => book.id === activeBookId)) return;
    setActiveBookId(books[0]?.id ?? null);
  }, [user, books, activeBookId]);

  const handleSelectBook = (bookId: string) => {
    setActiveBookId(bookId);
  };

  const handleCreateBook = async (name?: string) => {
    try {
      const created = await createBook({ name });
      if (created) {
        setActiveBookId(created.id);
      }
    } catch (error) {
      console.error('[App] createBook error', error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (books.length <= 1) {
      alert('Mantenha pelo menos um book ativo.');
      return;
    }
    const fallback = books.find((book) => book.id !== bookId);
    try {
      await removeBook(bookId);
      await purgeBookData(bookId);
      if (activeBookId === bookId) {
        setActiveBookId(fallback ? fallback.id : null);
      }
    } catch (error) {
      console.error('[App] removeBook error', error);
    }
  };

  if (showSplash) {
    return <SplashScreen fadingOut={!loading && splashFading} />;
  }

  if (loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginScreen />;
  }

  if (booksLoading && showSplash) {
    return <SplashScreen />;
  }

  if (!activeBookId) {
    return (
      <BooksLanding
        userName={user.displayName || user.email}
        books={books}
        loading={booksLoading}
        onSelect={handleSelectBook}
        onCreate={handleCreateBook}
        onDelete={handleDeleteBook}
      />
    );
  }

  return (
    <LegacyDashboard
      activeBookId={activeBookId}
      books={books}
      onSelectBook={handleSelectBook}
      onCreateBook={handleCreateBook}
      onDeleteBook={handleDeleteBook}
    />
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <TranslationProvider>
        <AuthProvider>
          <PreviewProvider>
            <AppShell />
          </PreviewProvider>
        </AuthProvider>
      </TranslationProvider>
    </NotificationProvider>
  );
}
