import { useMemo } from "react";
import { parseDate } from '../utils/utils';

export default function useTotals(bills) {
  return useMemo(() => {
    // Função auxiliar para somar valores de um array de contas
    const sum = arr => arr.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

    // Filtra contas ainda não pagas
    const dueAll = bills.filter(b => !b.paid);

    // Data atual
    const now = new Date();

    // Filtra contas não pagas do mês atual
    const dueMonth = bills.filter(b => {
      const d = parseDate(b.dueDate);
      return !b.paid && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    // Retorna totais e quantidade de contas abertas
    return {
      allOpen: sum(dueAll),       // soma de todas as contas abertas
      monthOpen: sum(dueMonth),   // soma das contas abertas do mês atual
      countOpen: dueAll.length,   // quantidade de contas abertas
    };
  }, [bills]); // recalcula apenas quando "bills" mudar
}
