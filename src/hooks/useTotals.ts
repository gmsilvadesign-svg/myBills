import { useMemo } from "react";
import { parseDate, isBefore, ymd } from '../utils/utils';
import * as Types from '../types';

export default function useTotals(bills: Types.Bill[]) {
  return useMemo(() => {
    // Função auxiliar para somar valores de um array de contas
    const sum = (arr: Types.Bill[]) => arr.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

    // Data atual em formato ISO
    const todayISO = ymd(new Date());
    const now = new Date();

    // Filtra contas ainda não pagas
    const dueAll = bills.filter(b => !b.paid);

    // Filtra contas não pagas do mês atual
    const dueMonth = bills.filter(b => {
      const d = parseDate(b.dueDate);
      return !b.paid && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Filtra contas atrasadas (não pagas e com data de vencimento anterior a hoje)
    const overdue = bills.filter(b => !b.paid && isBefore(b.dueDate, todayISO));

    // Retorna totais e quantidade de contas abertas
    return {
      allOpen: sum(dueAll),       // soma de todas as contas abertas
      monthOpen: sum(dueMonth),   // soma das contas abertas do mês atual
      overdue: sum(overdue),      // soma das contas atrasadas
      countOpen: dueAll.length,   // quantidade de contas abertas
    } as const;
  }, [bills]); // recalcula apenas quando "bills" mudar
}
