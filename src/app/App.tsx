// React
import { useState } from "react";

// Styles
import "@/styles/index.css";
import "@/styles/App.css";

// Constants & Types
import { useI18n, LANG_TO_LOCALE } from "@/constants/translation";
import * as Types from "@/types";

// Layout Components
import Header from "@/components/layout/Header";
import Filters from "@/components/layout/Filters";
import Footer from "@/components/layout/Footer";

// UI Components
import BillsList from "@/components/UI/bills/BillsList";
import BillsCalendar from "@/components/UI/bills/BillsCalendar";
import BillForm from "@/components/UI/bills/BillForm";
// import TotalsPills from "@/components/UI/TotalsPills";
import IncomeForm from "@/components/UI/incomes/IncomeForm";
import PurchasesView from "@/components/UI/purchases/PurchasesView";
import PurchasesModal from "@/components/UI/modals/PurchasesModal";
import PurchaseForm from "@/components/UI/purchases/PurchaseForm";
import TotalsStrip from "@/components/UI/TotalsStrip";
import LineChart from "@/components/UI/charts/LineChart";
import PieChart from "@/components/UI/charts/PieChart";
import IncomesModal from "@/components/UI/modals/IncomesModal";
import PurchasesTab from "@/components/UI/purchases/PurchasesTab";
import IncomesTab from "@/components/UI/incomes/IncomesTab";
import Select from "@/components/UI/Select";

// Modals
import DeleteConfirm from "@/components/UI/modals/DeleteConfirm";
import SettingsModal from "@/components/UI/modals/Settings";

// Hooks
import { usePrefs } from "@/hooks/usePrefs";
import useFilteredBills from "@/hooks/useFilteredBills";
import useTotals from "@/hooks/useTotals";
import useFirebaseBills from "@/hooks/useFirebaseBills";
import useFirebaseIncomes from "@/hooks/useFirebaseIncomes";
import useFirebasePurchases from "@/hooks/useFirebasePurchases";
import { useBillNotifications } from "@/hooks/useBillNotifications";

// Contexts
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PreviewProvider, usePreview } from "@/contexts/PreviewContext";
import SignIn from "@/components/UI/SignIn";

// Utils
import { addSampleBills } from "@/utils/addSampleData";
import { occurrencesForBillInMonth } from "@/utils/utils";

function App() {
  const { user, loading: authLoading } = useAuth();
  const [prefs, setPrefs] = usePrefs();
  const locale = LANG_TO_LOCALE[prefs.language] || "pt-BR";
  const currency = prefs.currency || "BRL";
  const t = useI18n(prefs.language);
  const { bills, loading, upsertBill, removeBill, markPaid } =
    useFirebaseBills();
  const { incomes, loading: loadingIncomes, upsertIncome, removeIncome } = useFirebaseIncomes();
  const [view, setView] = useState<Types.ViewType>("list");
  const [filter, setFilter] = useState<Types.FilterType>("month");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Types.Bill> | null>(null);
  const [confirm, setConfirm] = useState<Types.ConfirmState>({
    open: false,
    id: null,
  });
  const [editingIncome, setEditingIncome] = useState<Partial<Types.Income> | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Partial<Types.Purchase> | null>(null);
  const [monthDate, setMonthDate] = useState(new Date());
  const [openSettings, setOpenSettings] = useState(false);
  const { purchases, loading: loadingPurchases, upsertPurchase, removePurchase } = useFirebasePurchases();
  const [openPurchasesModal, setOpenPurchasesModal] = useState(false);
  const [openIncomesModal, setOpenIncomesModal] = useState(false);
  const [chartRange, setChartRange] = useState<'6m' | '12m'>('12m');

  const filteredBills = useFilteredBills(bills, filter, search);
  const totals = useTotals(bills);
  
  // Hook de notificações
  const { expiringBills } = useBillNotifications(bills);
  const exportICS = () => {
    import("@/utils/utils").then(({ buildICSForMonth, download }) => {
      const ics = buildICSForMonth(bills, monthDate, locale, currency);
      const fname = `contas-${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1
      ).padStart(2, "0")}.ics`;
      download(fname, ics);
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">Carregando…</div>
    );
  }

  if (!user) {
    // Mostra painel de login; hooks internos não assinam nada sem user
    return (
      <div className="min-h-screen justify-center p-8 flex overflow-x-auto">
        <div className="w-full max-w-2xl">
          <Header
            t={t}
            setEditing={setEditing}
            setEditingIncome={setEditingIncome}
            setEditingPurchase={setEditingPurchase}
            exportICS={exportICS}
            setOpenSettings={setOpenSettings}
            addSampleData={addSampleBills}
          />
          <SignIn />
          <Footer t={t} />
        </div>
      </div>
    );
  }

  const { width } = usePreview();

  return (
    <div className="min-h-screen justify-center p-8 flex overflow-x-auto">
      <div className="w-full" style={width ? { maxWidth: width, margin: '0 auto' } : undefined}>
        <Header
           t={t}
           setEditing={setEditing}
           setEditingIncome={setEditingIncome}
           setEditingPurchase={setEditingPurchase}
           exportICS={exportICS}
           setOpenSettings={setOpenSettings}
           addSampleData={addSampleBills}
         />
 
         {/* Totais fixos centralizados acima das opções */}
         <TotalsStrip 
           bills={bills}
           incomes={incomes}
           purchases={purchases}
           onFilterOverdue={() => { setFilter('overdue'); setView('list'); }}
         />

         <Filters
           view={view}
           setView={setView}
           filter={filter}
           setFilter={setFilter}
           search={search}
           setSearch={setSearch}
           t={t}
         />

        {/* Removido: Totais agora sempre visíveis acima das opções */}

        {(view === "list" || view === 'purchases' || view === 'incomes') && (
          <div className="min-h-[60vh]">
            <div className="mb-3 max-w-xs">
              <Select label="Filtro" value={filter} onChange={e => setFilter(e.target.value as Types.FilterType)}>
                <option value="today">{t.filter_today}</option>
                <option value="month">{t.filter_month || t.totals_month}</option>
                <option value="all">{t.filter_all}</option>
              </Select>
            </div>
            {view === 'list' && (
              <BillsList
                bills={filteredBills}
                loading={loading}
                markPaid={markPaid}
                setEditing={setEditing}
                setConfirm={setConfirm}
                t={t}
                locale={locale}
                currency={currency}
                purchasesTotalMonth={(() => { const now = new Date(); const y = now.getFullYear(); const m = now.getMonth(); return purchases.filter(p => { const d = new Date(p.date); return d.getFullYear() === y && d.getMonth() === m; }).reduce((s, p) => s + Number(p.amount || 0), 0); })()}
                onOpenPurchases={() => setOpenPurchasesModal(true)}
                incomesTotalMonth={(() => { const now = new Date(); const y = now.getFullYear(); const m = now.getMonth(); try { return incomes.filter(i => (require('@/utils/utils').occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m).length>0)).reduce((s,x)=> s+Number(x.amount||0),0);} catch { return incomes.filter(i => { const d = new Date(i.dueDate); return d.getFullYear()===y && d.getMonth()===m; }).reduce((s,x)=> s+Number(x.amount||0),0);} })()}
                onOpenIncomes={() => setOpenIncomesModal(true)}
              />
            )}
            {view === 'purchases' && (
              <PurchasesTab
                purchases={purchases}
                onEdit={(p) => setEditingPurchase(p)}
                onRemove={(id) => removePurchase(id)}
                t={t}
                locale={locale}
                currency={currency}
                filter={filter}
              />
            )}
            {view === 'incomes' && (
              <IncomesTab
                incomes={incomes}
                onEdit={(i) => setEditingIncome(i)}
                onRemove={(id) => removeIncome(id)}
                t={t}
                locale={locale}
                currency={currency}
                filter={filter}
              />
            )}
          </div>
        )}
 
         {view === "calendar" && (
           <BillsCalendar
             bills={bills}
             purchases={purchases}
             monthDate={monthDate}
             setMonthDate={setMonthDate}
             t={t}
             locale={locale}
             currency={currency}
           />
         )}


 
         {editing && (
           <BillForm
             initial={editing}
             onCancel={() => setEditing(null)}
             onSave={(billData) => {
               if (editing?.id) {
                 upsertBill({ ...billData, id: editing.id });
               } else {
                 upsertBill(billData);
               }
               setEditing(null);
             }}
             t={t}
             locale={locale}
             currency={currency}
          />
        )}

        {/* Removido: duplicação da aba de compras */}

         {editingIncome && (
           <IncomeForm
             initial={editingIncome}
             onCancel={() => setEditingIncome(null)}
             onSave={(incomeData) => {
               if (editingIncome?.id) {
                 upsertIncome({ ...incomeData, id: editingIncome.id });
               } else {
                 upsertIncome(incomeData);
               }
               setEditingIncome(null);
             }}
             t={t}
           />
         )}

         {editingPurchase && (
           <PurchaseForm
             initial={editingPurchase}
             onCancel={() => setEditingPurchase(null)}
             onSave={(purchaseData) => {
               if (editingPurchase?.id) {
                 upsertPurchase({ ...purchaseData, id: editingPurchase.id });
               } else {
                 upsertPurchase(purchaseData);
               }
               setEditingPurchase(null);
             }}
             t={t}
           />
         )}
 
         <DeleteConfirm
           open={confirm.open}
           title={t.confirm_delete_title}
           body={t.confirm_delete_body}
           t={t}
           onClose={() => setConfirm({ open: false, id: null })}
           onConfirm={() => {
             if (confirm.id) removeBill(confirm.id);
             setConfirm({ open: false, id: null });
           }}
         />
 
        <SettingsModal
          open={openSettings}
          onClose={() => setOpenSettings(false)}
          prefs={prefs}
          setPrefs={setPrefs}
          t={t}
          bills={bills}
        />

        <PurchasesModal
          open={openPurchasesModal}
          onClose={() => setOpenPurchasesModal(false)}
          purchases={purchases}
          onEdit={(p) => setEditingPurchase(p)}
          onDelete={(id) => removePurchase(id)}
          t={t}
          locale={locale}
          currency={currency}
        />

        <IncomesModal
          open={openIncomesModal}
          onClose={() => setOpenIncomesModal(false)}
          incomes={incomes}
          onEdit={(i) => setEditingIncome(i)}
          onDelete={(id) => removeIncome(id)}
          t={t}
          locale={locale}
          currency={currency}
        />
         {view === 'general' && (
           <div className="mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
             <h3 className="text-lg font-semibold mb-2">Balanço geral do mês</h3>
             {/* Cálculo simples: soma despesas do mês - soma rendas do mês */}
             {(() => {
               const now = new Date();
               const y = now.getFullYear();
               const m = now.getMonth();
               const inMonth = (d: string) => {
                 const dd = new Date(d);
                 return dd.getFullYear() === y && dd.getMonth() === m;
               };
               const monthExpenses = bills.filter(b => inMonth(b.dueDate) && !b.paid).reduce((s, b) => s + Number(b.amount || 0), 0);
               // Considera recorrência para rendas: inclui item se tiver ocorrência no mês
               const monthIncomes = incomes.filter(i => {
                 try {
                   const occ = occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m);
                   return occ.length > 0;
                 } catch {
                   return inMonth(i.dueDate);
                 }
               }).reduce((s, i) => s + Number(i.amount || 0), 0);
              const monthPurchases = purchases.filter(p => inMonth(p.date)).reduce((s, p) => s + Number(p.amount || 0), 0);
              const balance = monthIncomes - monthExpenses - monthPurchases;
               return (
                 <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                   <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200">
                     <div className="text-xs">Despesas do mês</div>
                     <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(monthExpenses)}</div>
                   </div>
                   <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200">
                     <div className="text-xs">Rendas do mês</div>
                     <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(monthIncomes)}</div>
                   </div>
                   <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                     <div className="text-xs">Balanço</div>
                    <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(balance)}</div>
                  </div>
                  <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200">
                    <div className="text-xs">Compras do mês</div>
                    <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(monthPurchases)}</div>
                  </div>
                 </div>
               );
            })()}
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Período:</span>
                <button onClick={() => setChartRange('6m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='6m' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'} border-slate-300 dark:border-slate-600`}>6m</button>
                <button onClick={() => setChartRange('12m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='12m' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'} border-slate-300 dark:border-slate-600`}>12m</button>
                {/* Botão 1 ano removido */}
              </div>
              {(() => {
                const now = new Date();
                const months = (chartRange === '6m' ? 6 : 12);
                const labels: string[] = [];
                const exp: number[] = [];
                const inc: number[] = [];
                for (let i = months - 1; i >= 0; i--) {
                  const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                  labels.push(d.toLocaleDateString(locale, { month: 'short' }));
                  const y = d.getFullYear();
                  const m = d.getMonth();
                  const inMonth = (iso: string) => { const dd = new Date(iso); return dd.getFullYear()===y && dd.getMonth()===m; };
                  const monthBills = bills.filter(b => inMonth(b.dueDate) && !b.paid).reduce((s,b)=> s + Number(b.amount||0), 0);
                  const monthPurch = purchases.filter(p => inMonth(p.date)).reduce((s,p)=> s + Number(p.amount||0), 0);
                  // Renda planejada do mês (mesma lógica dos cards)
                  let monthInc = incomes.reduce((sum, i) => {
                    const base = new Date(i.dueDate);
                    const rec = (i as any).recurrence || 'NONE';
                    if (rec === 'MONTHLY') return sum + Number(i.amount || 0);
                    if (rec === 'WEEKLY') {
                      const weekday = base.getDay();
                      let count = 0;
                      const totalDays = new Date(y, m + 1, 0).getDate();
                      for (let d2 = 1; d2 <= totalDays; d2++) if (new Date(y, m, d2).getDay() === weekday) count++;
                      return sum + count * Number(i.amount || 0);
                    }
                    if (rec === 'DAILY') {
                      const totalDays = new Date(y, m + 1, 0).getDate();
                      return sum + totalDays * Number(i.amount || 0);
                    }
                    if (rec === 'YEARLY') return base.getMonth() === m ? sum + Number(i.amount || 0) : sum;
                    // NONE
                    return inMonth(i.dueDate) ? sum + Number(i.amount || 0) : sum;
                  }, 0);
                  // adiciona atrasadas no mês atual
                  let overdueAdd = 0;
                  if (i === 0) {
                    const today = new Date(); today.setHours(0,0,0,0);
                    overdueAdd = bills.filter(b => !b.paid && new Date(b.dueDate) < today).reduce((s,b)=> s + Number(b.amount||0), 0);
                  }
                  exp.push(monthBills + monthPurch);
                  inc.push(monthInc);
                }
                // Savings rate (percentual da economia mensal)
                const pct = labels.map((_, i) => {
                  const spend = exp[i];
                  const income = inc[i];
                  if (!income || income <= 0) return 0;
                  const saving = income - spend;
                  return Math.max(0, Math.min(1, saving / income));
                });
                const formatCurrency = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Gráfico Financeiro</h4>
                    <LineChart 
                      labels={labels} 
                      series={[{ name: 'Gastos', color: '#ef4444', values: exp }, { name: 'Renda', color: '#10b981', values: inc }]}
                      formatY={formatCurrency}
                      percentOverlay={pct}
                    />
                  </div>
                );
              })()}
              {(() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = now.getMonth();
                const inMonth = (iso: string) => { const d = new Date(iso); return d.getFullYear()===y && d.getMonth()===m; };
                const expenseByCat = new Map<string, number>();
                bills.filter(b => inMonth(b.dueDate) && !b.paid).forEach(b => expenseByCat.set(`Despesa: ${b.category || 'Sem categoria'}`, (expenseByCat.get(`Despesa: ${b.category || 'Sem categoria'}`)||0) + Number(b.amount||0)));
                purchases.filter(p => inMonth(p.date)).forEach(p => expenseByCat.set(`Compra: ${p.category || 'Outros'}`, (expenseByCat.get(`Compra: ${p.category || 'Outros'}`)||0) + Number(p.amount||0)));
                const incomeByCat = new Map<string, number>();
                incomes.forEach(i => {
                  let has = false;
                  try { has = require('@/utils/utils').occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m).length>0; } catch { has = inMonth(i.dueDate); }
                  if (has) incomeByCat.set(`Renda: ${i.category || 'Outros'}`, (incomeByCat.get(`Renda: ${i.category || 'Outros'}`)||0) + Number(i.amount||0));
                });
                const expData = Array.from(expenseByCat, ([label, value]) => ({ label, value, color: '#ef4444' }));
                const incData = Array.from(incomeByCat, ([label, value]) => ({ label, value, color: '#10b981' }));
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribuição de gastos (mês)</h4>
                      <PieChart data={expData} paletteType="warm" formatValue={(v) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v)} />
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribuição de renda (mês)</h4>
                      <PieChart data={incData} paletteType="cool" formatValue={(v) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v)} />
                    </div>
                  </div>
                );
              })()}
            </div>
           </div>
         )}

         <Footer t={t} />
       </div>
     </div>
   );
}

export default function AppWithProviders() {
  return (
    <NotificationProvider>
      <TranslationProvider>
        <AuthProvider>
          <PreviewProvider>
            <App />
          </PreviewProvider>
        </AuthProvider>
      </TranslationProvider>
    </NotificationProvider>
  );
}
