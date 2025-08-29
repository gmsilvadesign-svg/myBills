import { addDoc, collection, getDocs, query, where, writeBatch, doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { ymd } from '@/utils/utils';

/**
 * Gera dados automáticos padrão por 12 meses para uma pessoa de classe média
 * com finanças equilibradas: contas recorrentes, renda mensal e compras do mês.
 * Todos os documentos inseridos recebem { auto: true, batchId } para permitir limpeza.
 */
export async function seedAutoData(months = 12) {
  const batchId = `auto-${Date.now()}`;

  const batch = writeBatch(db);

  // Incomes (recorrentes mensais)
  const incomes = [
    { title: 'Salário', amount: 5500, day: 5, category: 'Salário' },
    { title: 'Trabalho extra', amount: 400, day: 20, category: 'Trabalho extra' },
  ];
  for (const inc of incomes) {
    const baseDate = new Date();
    baseDate.setDate(inc.day);
    const ref = doc(collection(db, 'incomes'));
    batch.set(ref, {
      title: inc.title,
      amount: inc.amount,
      dueDate: ymd(baseDate),
      recurrence: 'MONTHLY',
      category: inc.category,
      notes: null,
      auto: true,
      batchId,
    } as any);
  }

  // Bills (contas recorrentes)
  const bills = [
    { title: 'Aluguel/Condomínio', amount: 2200, day: 8, category: 'Fixas' },
    { title: 'Energia elétrica', amount: 180, day: 12, category: 'Fixas' },
    { title: 'Água', amount: 90, day: 12, category: 'Fixas' },
    { title: 'Internet', amount: 120, day: 10, category: 'Fixas' },
    { title: 'Plano de saúde', amount: 450, day: 6, category: 'Fixas' },
    { title: 'Seguro auto', amount: 160, day: 18, category: 'Fixas' },
    { title: 'Streaming', amount: 55, day: 15, category: 'Variáveis' },
    { title: 'Academia', amount: 110, day: 4, category: 'Variáveis' },
  ];
  for (const b of bills) {
    const baseDate = new Date();
    baseDate.setDate(b.day);
    const ref = doc(collection(db, 'bills'));
    batch.set(ref, {
      title: b.title,
      amount: b.amount,
      dueDate: ymd(baseDate),
      recurrence: 'MONTHLY',
      paid: false,
      paidOn: null,
      category: b.category,
      notes: null,
      tags: [],
      auto: true,
      batchId,
    } as any);
  }

  // Purchases (lançamentos por mês)
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const y = now.getFullYear();
    const m = now.getMonth() - i;
    const d1 = new Date(y, m, 10);
    const d2 = new Date(y, m, 20);
    const d3 = new Date(y, m, 25);
    const monthPurchases = [
      { title: 'Supermercado', amount: 850, date: ymd(d1), category: 'Mercado' },
      { title: 'Combustível', amount: 350, date: ymd(d2), category: 'Transporte' },
      { title: 'Restaurante', amount: 220, date: ymd(d3), category: 'Restaurante' },
    ];
    for (const p of monthPurchases) {
      const ref = doc(collection(db, 'purchases'));
      batch.set(ref, {
        title: p.title,
        amount: p.amount,
        date: p.date,
        category: p.category,
        notes: null,
        auto: true,
        batchId,
      } as any);
    }
  }

  const totalDocs = incomes.length + bills.length + months * 3;
  await batch.commit();
  return { batchId, totalDocs } as const;
}

/**
 * Remove documentos gerados automaticamente (auto === true) em bills, incomes e purchases
 */
export async function clearAutoData() {
  const colls = ['bills', 'incomes', 'purchases'] as const;
  for (const c of colls) {
    const q = query(collection(db, c), where('auto', '==', true));
    const snap = await getDocs(q);
    if (snap.empty) continue;
    const batch = writeBatch(db);
    snap.forEach(d => batch.delete(doc(db, c, d.id)));
    await batch.commit();
  }
}
