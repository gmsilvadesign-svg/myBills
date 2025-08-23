import { useMemo } from 'react';
import { parseDate, isBefore, isSameDayISO, ymd } from '@/utils/utils';
import * as Types from '@/types';

export default function useFilteredBills(bills: Types.Bill[], filter: Types.FilterType, search: string) {
  // Data de hoje em formato ISO
  const todayISO = ymd(new Date());

  // Memoriza o resultado filtrado e ordenado
  return useMemo(() => {
    return bills
      // Cria uma cópia para não alterar o array original
      .slice()
      // Ordena pelas datas de vencimento
      .sort((a, b) => parseDate(a.dueDate).getTime() - parseDate(b.dueDate).getTime())
      // Filtra contas conforme busca e filtro selecionado
      .filter(bill => {
        // Verifica se o título, categoria, tags ou notas correspondem à pesquisa
        const matchesSearch = [bill.title, bill.category, (bill.tags||[]).join(","), bill.notes]
          .filter(Boolean) // remove valores nulos ou vazios
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
        if (!matchesSearch) return false;

        const due = parseDate(bill.dueDate);
        const diffDays = Math.floor((due.getTime() - Date.now()) / 86400000); // diferença em dias

        // Aplica filtros específicos
        switch (filter) {
          case "today": 
            // Somente contas com vencimento hoje
            return isSameDayISO(bill.dueDate, todayISO);
          case "overdue": 
            // Contas não pagas e vencidas
            return !bill.paid && isBefore(bill.dueDate, todayISO);
          case "next7": 
            // Contas não pagas nos próximos 7 dias
            return !bill.paid && diffDays >= 0 && diffDays <= 7;
          case "next30": 
            // Contas não pagas nos próximos 30 dias
            return !bill.paid && diffDays >= 0 && diffDays <= 30;
          default: 
            // Todos os casos (filtro "all")
            return true;
        }
      });
  }, [bills, filter, search, todayISO]); // recalcula se algum destes mudar
}
