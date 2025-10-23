import { useCallback, useEffect, useState } from "react";

import { isLocalMode } from "@/firebase";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addPurchase as addPurchaseService,
  deletePurchase as deletePurchaseService,
  listLocalPurchases,
  subscribeToPurchases,
  updatePurchase as updatePurchaseService,
} from "@/services/data/purchasesRepository";
import * as Types from "@/types";

export default function useFirebasePurchases(activeBookId?: string | null) {
  const [purchases, setPurchases] = useState<Types.Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  const syncLocal = useCallback(() => {
    if (!user || !activeBookId) {
      setPurchases([]);
      return;
    }
    setPurchases(listLocalPurchases(user.uid, activeBookId));
  }, [activeBookId, user]);

  useEffect(() => {
    if (!user || !activeBookId) {
      setPurchases([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToPurchases({
      userId: user.uid,
      bookId: activeBookId,
      onData: (data) => {
        setPurchases(data);
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        console.error("[useFirebasePurchases] snapshot error", error);
        showNotification(t.error_load, "error");
      },
    });

    if (isLocalMode) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, [activeBookId, showNotification, t, user]);

  const addPurchase = async (purchase: Omit<Types.Purchase, "id">) => {
    try {
      if (!user) throw new Error("not-authenticated");
      const resolvedBookId = purchase.bookId ?? activeBookId;
      if (!resolvedBookId) throw new Error("book-not-selected");
      await addPurchaseService(user.uid, { ...purchase, bookId: resolvedBookId });
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao adicionar compra:", error);
      showNotification(t.error_add, "error");
      throw error;
    }
  };

  const updatePurchase = async (purchase: Types.Purchase) => {
    try {
      await updatePurchaseService(purchase);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao atualizar compra:", error);
      showNotification(t.error_update, "error");
      throw error;
    }
  };

  const upsertPurchase = async (
    purchase: Types.Purchase | Omit<Types.Purchase, "id">,
  ) => {
    if ("id" in purchase && purchase.id) {
      await updatePurchase(purchase as Types.Purchase);
    } else {
      await addPurchase(purchase as Omit<Types.Purchase, "id">);
    }
  };

  const removePurchase = async (id: string) => {
    try {
      await deletePurchaseService(id);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao remover compra:", error);
      showNotification(t.error_delete, "error");
      throw error;
    }
  };

  return { purchases, loading, addPurchase, updatePurchase, upsertPurchase, removePurchase } as const;
}

