import { useCallback, useEffect, useState } from "react";

import { isLocalMode } from "@/firebase";
import { useNotification } from "@/hooks/useNotification";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import {
  addBill as addBillService,
  deleteBill as deleteBillService,
  listLocalBills,
  markBillPaid as markBillPaidService,
  subscribeToBills,
  unmarkBillPaid as unmarkBillPaidService,
  updateBill as updateBillService,
} from "@/services/data/billsRepository";
import * as Types from "@/types";

export default function useFirebaseBills(activeBookId?: string | null) {
  const [bills, setBills] = useState<Types.Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { t } = useTranslation();
  const { user } = useAuth();

  const syncLocal = useCallback(() => {
    if (!user || !activeBookId) {
      setBills([]);
      return;
    }
    setBills(listLocalBills(user.uid, activeBookId));
  }, [activeBookId, user]);

  useEffect(() => {
    if (!user || !activeBookId) {
      setBills([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToBills({
      userId: user.uid,
      bookId: activeBookId,
      onData: (data) => {
        setBills(data);
        setLoading(false);
      },
      onError: (error) => {
        setLoading(false);
        console.error("[useFirebaseBills] snapshot error", error);
        showNotification(t.error_load, "error");
      },
    });

    if (isLocalMode) {
      setLoading(false);
    }

    return () => unsubscribe();
  }, [activeBookId, showNotification, t, user]);

  const addBill = async (bill: Omit<Types.Bill, "id">) => {
    try {
      if (!user) throw new Error("not-authenticated");
      const resolvedBookId = bill.bookId ?? activeBookId;
      if (!resolvedBookId) throw new Error("book-not-selected");
      await addBillService(user.uid, { ...bill, bookId: resolvedBookId });
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao adicionar conta:", error);
      showNotification(t.error_add, "error");
      throw error;
    }
  };

  const updateBill = async (bill: Types.Bill) => {
    try {
      await updateBillService(bill);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao atualizar conta:", error);
      showNotification(t.error_update, "error");
      throw error;
    }
  };

  const upsertBill = async (bill: Types.Bill | Omit<Types.Bill, "id">) => {
    if ("id" in bill && bill.id) {
      await updateBill(bill as Types.Bill);
    } else {
      await addBill(bill as Omit<Types.Bill, "id">);
    }
  };

  const removeBill = async (id: string) => {
    try {
      await deleteBillService(id);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao remover conta:", error);
      showNotification(t.error_delete, "error");
      throw error;
    }
  };

  const markPaid = async (bill: Types.Bill, advance = false) => {
    try {
      await markBillPaidService(bill, advance);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao marcar como pago:", error);
      showNotification(t.error_update, "error");
      throw error;
    }
  };

  const unmarkPaid = async (bill: Types.Bill) => {
    try {
      await unmarkBillPaidService(bill);
      if (isLocalMode) syncLocal();
    } catch (error) {
      console.error("Erro ao desmarcar como pago:", error);
      showNotification(t.error_update, "error");
      throw error;
    }
  };

  return { bills, loading, addBill, updateBill, upsertBill, removeBill, markPaid, unmarkPaid } as const;
}

