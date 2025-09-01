import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { db, auth, isLocalMode } from '@/firebase';
import * as local from '@/utils/localDb';
import { ymd } from '@/utils/utils';

export type ProgressCallback = (progress: number, phase?: string) => void;

/**
 * Gera dados automáticos realistas por N meses para o usuário autenticado.
 */
export async function seedAutoData(months = 12, onProgress?: ProgressCallback) {
  const uid = auth.currentUser?.uid || 'local-user';
  
  const batchId = `auto-${Date.now()}`;
  onProgress?.(0, 'Preparando');

  const vary = (base: number, pct = 0.1) => Math.round(base * (1 + (Math.random() * 2 - 1) * pct));
  const rand = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
  const baseDay = (d: number) => { const dt = new Date(); dt.setDate(d); return dt; };

  type DocItem = { col: 'incomes' | 'bills' | 'purchases'; data: any };
  const docs: DocItem[] = [];

  // Incomes fixos
  const fixedIncomes = [
    { title: 'Salário', amount: 5500, day: 5, category: 'Salário', recurrence: 'MONTHLY' as const },
  ];
  for (const inc of fixedIncomes) {
    docs.push({ col: 'incomes', data: { title: inc.title, amount: inc.amount, dueDate: ymd(baseDay(inc.day)), recurrence: inc.recurrence, category: inc.category, notes: null, auto: true, batchId, userId: uid } });
  }

  // Rendas eventuais
  const nowIncome = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const y = nowIncome.getFullYear();
    const m = nowIncome.getMonth() - i;
    if (Math.random() < 0.55) {
      const dt = new Date(y, m, rand(18, 25));
      const amount = vary(rand(300, 1200), 0.2);
      docs.push({ col: 'incomes', data: { title: 'Trabalho extra', amount, dueDate: ymd(dt), recurrence: 'NONE', category: 'Trabalho extra', notes: null, auto: true, batchId, userId: uid } });
    }
  }

  // 13º
  {
    const y = new Date().getFullYear();
    docs.push({ col: 'incomes', data: { title: '13º salário', amount: 5500, dueDate: ymd(new Date(y, 11, 15)), recurrence: 'YEARLY', category: 'Salário', notes: null, auto: true, batchId, userId: uid } });
  }

  // Bills mensais
  const bills = [
    { title: 'Aluguel/Condomínio', amount: 2200, day: 8, category: 'Fixas' },
    { title: 'Energia elétrica', amount: 190, day: 12, category: 'Fixas' },
    { title: 'Água', amount: 95, day: 12, category: 'Fixas' },
    { title: 'Internet', amount: 120, day: 10, category: 'Fixas' },
    { title: 'Telefone celular', amount: 75, day: 10, category: 'Fixas' },
    { title: 'Plano de saúde', amount: 480, day: 6, category: 'Fixas' },
    { title: 'Seguro auto', amount: 160, day: 18, category: 'Fixas' },
    { title: 'Streaming', amount: 60, day: 15, category: 'Variáveis' },
    { title: 'Academia', amount: 110, day: 4, category: 'Variáveis' },
  ];
  for (const b of bills) {
    docs.push({ col: 'bills', data: { title: b.title, amount: b.amount, dueDate: ymd(baseDay(b.day)), recurrence: 'MONTHLY', paid: false, paidOn: null, category: b.category, notes: null, tags: [], auto: true, batchId, userId: uid } });
  }

  // Bills anuais
  const yearlyBills = [
    { title: 'IPVA', amount: 900, month: 0, day: 20, category: 'Anual' },
    { title: 'Seguro residência', amount: 650, month: 8, day: 5, category: 'Anual' },
    { title: 'Licenciamento', amount: 150, month: 7, day: 15, category: 'Anual' },
  ];
  const yNow = new Date().getFullYear();
  for (const yb of yearlyBills) {
    docs.push({ col: 'bills', data: { title: yb.title, amount: yb.amount, dueDate: ymd(new Date(yNow, yb.month, yb.day)), recurrence: 'YEARLY', paid: false, paidOn: null, category: yb.category, notes: null, tags: [], auto: true, batchId, userId: uid } });
  }

  // Compras mensais
  const now = new Date();
  let purchasesCount = 0;
  for (let i = months - 1; i >= 0; i--) {
    const y = now.getFullYear();
    const m = now.getMonth() - i;
    const mm = (m + 12) % 12;
    const seasonFactor = mm === 11 ? 1.15 : mm === 6 ? 1.1 : mm <= 2 ? 1.05 : 1.0;
    const monthPurchases = [
      { title: 'Supermercado', amount: vary(850 * seasonFactor, 0.18), day: rand(6, 12), category: 'Mercado' },
      { title: 'Supermercado (reposição)', amount: vary(320 * seasonFactor, 0.22), day: rand(18, 24), category: 'Mercado' },
      { title: 'Combustível', amount: vary(340, 0.25), day: rand(14, 22), category: 'Transporte' },
      { title: 'Restaurante', amount: vary(180 * seasonFactor, 0.35), day: rand(20, 28), category: 'Restaurante' },
      { title: 'Farmácia', amount: vary(120, 0.3), day: rand(10, 25), category: 'Saúde' },
      { title: 'Transporte por app', amount: vary(90, 0.4), day: rand(8, 27), category: 'Transporte' },
    ];
    if (Math.random() < 0.35) monthPurchases.push({ title: 'Cinema/Lazer', amount: vary(80, 0.4), day: rand(5, 25), category: 'Lazer' });
    if (Math.random() < 0.25) monthPurchases.push({ title: 'Roupas', amount: vary(220, 0.35), day: rand(12, 26), category: 'Vestuário' });
    if (mm === 1) monthPurchases.push({ title: 'Material escolar', amount: vary(450, 0.2), day: rand(5, 15), category: 'Educação' });
    if (mm === 4) monthPurchases.push({ title: 'Presente Dia das Mães', amount: vary(180, 0.25), day: rand(1, 10), category: 'Presentes' });
    if (mm === 9) monthPurchases.push({ title: 'Presente Dia das Crianças', amount: vary(150, 0.3), day: rand(5, 15), category: 'Presentes' });
    if (mm === 11) monthPurchases.push({ title: 'Presentes de Natal', amount: vary(600, 0.3), day: rand(10, 23), category: 'Presentes' });
    if (mm === 6) monthPurchases.push({ title: 'Viagem curta', amount: vary(1200, 0.25), day: rand(10, 20), category: 'Viagem' });
    if (Math.random() < 0.15) monthPurchases.push({ title: 'Manutenção do carro', amount: vary(650, 0.25), day: rand(8, 22), category: 'Transporte' });
    if (Math.random() < 0.1) monthPurchases.push({ title: 'Eletrônicos', amount: vary(900, 0.3), day: rand(15, 28), category: 'Eletrônicos' });

    for (const p of monthPurchases) {
      docs.push({ col: 'purchases', data: { title: p.title, amount: p.amount, date: ymd(new Date(y, m, p.day)), category: p.category, notes: null, auto: true, batchId, userId: uid } });
      purchasesCount++;
    }
  }

  const totalDocs = fixedIncomes.length + 1 + bills.length + yearlyBills.length + purchasesCount;

  if (isLocalMode) {
    // Local: grava direto no localStorage
    let written = 0;
    local.upsertMany('incomes', docs.filter(d=>d.col==='incomes').map(d=>d.data)); written += docs.filter(d=>d.col==='incomes').length; onProgress?.(Math.min(0.99, written/totalDocs), 'Preenchendo');
    local.upsertMany('bills', docs.filter(d=>d.col==='bills').map(d=>d.data)); written += docs.filter(d=>d.col==='bills').length; onProgress?.(Math.min(0.99, written/totalDocs), 'Preenchendo');
    local.upsertMany('purchases', docs.filter(d=>d.col==='purchases').map(d=>d.data)); written += docs.filter(d=>d.col==='purchases').length; onProgress?.(Math.min(0.99, written/totalDocs), 'Preenchendo');
    onProgress?.(1, 'Concluído');
    return { batchId, totalDocs } as const;
  }

  // Firestore: escreve em lotes
  let written = 0; let currentBatch = writeBatch(db); let opsInBatch = 0;
  const flush = async () => { if (opsInBatch === 0) return; await currentBatch.commit(); opsInBatch = 0; currentBatch = writeBatch(db); };
  for (const item of docs) { const ref = doc(collection(db, item.col)); currentBatch.set(ref, item.data); opsInBatch++; written++; if (opsInBatch >= 400) await flush(); onProgress?.(Math.min(0.99, written/totalDocs), 'Preenchendo'); }
  await flush(); onProgress?.(1, 'Concluído'); return { batchId, totalDocs } as const;
}

/** Remove dados automáticos do usuário atual */
export async function clearAutoData(onProgress?: ProgressCallback) {
  const uid = auth.currentUser?.uid || 'local-user';
  const colls = ['bills', 'incomes', 'purchases'] as const;
  if (isLocalMode) {
    let count = 0;
    for (const c of colls) { const before = local.list(c, uid); local.removeWhere(c, r => r.userId === uid && r.auto === true); const after = local.list(c, uid); count += (before.length - after.length); onProgress?.(Math.min(0.99, 0.3), 'Limpando'); }
    onProgress?.(1, 'Concluído'); return;
  }
  const idsByCol: { col: typeof colls[number]; id: string }[] = [];
  for (const c of colls) { const qy = query(collection(db, c), where('auto', '==', true), where('userId', '==', uid)); const snap = await getDocs(qy); snap.forEach((d) => idsByCol.push({ col: c, id: d.id })); }
  const total = idsByCol.length; if (total === 0) { onProgress?.(1, 'Concluído'); return; }
  let done = 0; let batch = writeBatch(db); let ops = 0; const flush = async () => { if (ops === 0) return; await batch.commit(); ops = 0; batch = writeBatch(db); };
  for (const it of idsByCol) { batch.delete(doc(db, it.col, it.id)); ops++; done++; if (ops >= 400) await flush(); onProgress?.(Math.min(0.99, done/total), 'Limpando'); }
  await flush(); onProgress?.(1, 'Concluído');
}

/** Existe auto data do usuário? */
export async function hasAutoData(): Promise<boolean> {
  const uid = auth.currentUser?.uid || 'local-user';
  const colls = ['bills', 'incomes', 'purchases'] as const;
  if (isLocalMode) { return colls.some(c => (local.list(c, uid) as any[]).some(r => r.auto)); }
  for (const c of colls) { const qy = query(collection(db, c), where('auto', '==', true), where('userId', '==', uid)); const snap = await getDocs(qy); if (!snap.empty) return true; }
  return false;
}
