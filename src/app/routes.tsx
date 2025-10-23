import { useEffect, useState } from "react";

import SplashScreen from "@/components/UI/auth/SplashScreen";
import LoginScreen from "@/components/UI/auth/LoginScreen";
import BooksLanding from "@/components/UI/auth/BooksLanding";
import { useAuth } from "@/contexts/AuthContext";
import { useBooks } from "@/hooks/useBooks";
import { purgeBookData } from "@/services/data/bookDataService";
import { DashboardPage } from "@/features/dashboard";

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
  const [activeBookId, setActiveBookId] = useState<string | null>(() =>
    loadStoredActiveBook(),
  );

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
      console.error("[App] createBook error", error);
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    if (books.length <= 1) {
      alert("Mantenha pelo menos um book ativo.");
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
      console.error("[App] removeBook error", error);
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
    <DashboardPage
      activeBookId={activeBookId}
      books={books}
      onSelectBook={handleSelectBook}
      onCreateBook={handleCreateBook}
      onDeleteBook={handleDeleteBook}
    />
  );
}

export function AppRoutes() {
  return <AppShell />;
}
