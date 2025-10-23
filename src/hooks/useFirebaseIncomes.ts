import { useCallback, useEffect, useState } from "react";

import { isLocalMode } from "@/firebase";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addIncome as addIncomeService,
  deleteIncome as deleteIncomeService,
  listLocalIncomes,
  subscribeToIncomes,
  updateIncome as updateIncomeService,
} from "@/services/data/incomesRepository";
import * as Types from "@/types";

export default function useFirebaseIncomes(activeBookId?: string | null) {
  const [incomes, setIncomes] = useState<Types.Income[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  const syncLocal = useCallback(() => {
    if (!user || !activeBookId) {
      setIncomes([]);
      return;
    }
    setIncomes(listLocalIncomes(user.uid, activeBookId));
  }, [activeBookId, user]);

  useEffect(() => {
    if (!user || !activeBookId) {
      setIncomes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToIncomes({
      userId: user.uid,
      bookId: activeBookId,
      onData: (data) => {
        setIncomes(data);
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        console.error("[useFirebaseIncomes] snapshot error", error);
        showNotification(t.error_load, "error");
      },
    });

    if (isLocalMode) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, [activeBookId, showNotification, t, user]);

  const addIncome = async (income: Omit<Types.Income, "id">) => {
    try {
      if (!user) throw new Error("not-authenticated");
      const resolvedBookId = income.bookId ?? activeBookId;
      if (!resolvedBookId) throw new Error("book-not-selected");
      await addIncomeService(user.uid, { ...income, bookId: resolvedBookId });
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao adicionar renda:", error);
      showNotification(t.error_add, "error");
      throw error;
    }
  };

  const updateIncome = async (income: Types.Income) => {
    try {
      await updateIncomeService(income);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao atualizar renda:", error);
      showNotification(t.error_update, "error");
      throw error;
    }
  };

  const upsertIncome = async (income: Types.Income | Omit<Types.Income, "id">) => {
    if ("id" in income && income.id) {
      await updateIncome(income as Types.Income);
    } else {
      await addIncome(income as Omit<Types.Income, "id">);
    }
  };

  const removeIncome = async (id: string) => {
    try {
      await deleteIncomeService(id);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao remover renda:", error);
      showNotification(t.error_delete, "error");
      throw error;
    }
  };

  return { incomes, loading, addIncome, updateIncome, upsertIncome, removeIncome } as const;
}

