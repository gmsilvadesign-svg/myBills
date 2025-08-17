import { ymd, nextOccurrenceISO } from '../utils/utils';

export default function useBillsActions(setBills) {
  // Adiciona ou atualiza uma conta
  const upsertBill = (bill) => {
    setBills(prev => {
      // Procura índice da conta pelo ID
      const idx = prev.findIndex(x => x.id === bill.id);
      if (idx >= 0) {
        // Atualiza a conta existente mantendo ordem
        const next = prev.slice();
        next[idx] = bill;
        return next;
      }
      // Adiciona conta nova
      return [...prev, bill];
    });
  };

  // Remove uma conta pelo ID
  const removeBill = (id) => 
    setBills(prev => prev.filter(b => b.id !== id));

  // Marca conta como paga ou avança recorrência
  const markPaid = (id, advance = false) => {
    setBills(prev => prev.map(b => {
      if (b.id !== id) return b;

      // Avança data de vencimento se recorrente e advance=true
      if (advance && b.recurrence && b.recurrence !== "NONE") {
        return { 
          ...b, 
          dueDate: nextOccurrenceISO(b.dueDate, b.recurrence), 
          paid: false, 
          paidOn: undefined 
        };
      }

      // Marca como paga com data de hoje
      return { 
        ...b, 
        paid: true, 
        paidOn: ymd(new Date()) 
      };
    }));
  };

  // Retorna as funções para uso em componentes
  return { upsertBill, removeBill, markPaid };
}