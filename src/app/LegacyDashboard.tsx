// React
import { useMemo, useState } from "react";

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
import { CSS_CLASSES, cn } from "@/styles/constants";

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
import { useAuth } from "@/contexts/AuthContext";
import { usePreview } from "@/contexts/PreviewContext";

// Utils
import { addSampleBills } from "@/utils/addSampleData";
import { occurrencesForBillInMonth, parseDate, ymd } from "@/utils/utils";

interface LegacyDashboardProps {
  activeBookId: string;
  books: Types.Book[];
  onSelectBook: (bookId: string) => void;
  onCreateBook: (name?: string) => Promise<void> | void;
  onDeleteBook: (bookId: string) => Promise<void> | void;
}

function LegacyDashboard({ activeBookId, books, onSelectBook, onCreateBook, onDeleteBook }: LegacyDashboardProps) {
  const { user, loading: authLoading } = useAuth();
  const [prefs, setPrefs] = usePrefs();
  const locale = LANG_TO_LOCALE[prefs.language] || "pt-BR";
  const currency = prefs.currency || "BRL";
  const t = useI18n(prefs.language);
  const { bills, loading, upsertBill, removeBill, markPaid, unmarkPaid } =
    useFirebaseBills(activeBookId);
  const { incomes, loading: loadingIncomes, upsertIncome, removeIncome } = useFirebaseIncomes(activeBookId);
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
  const { purchases, loading: loadingPurchases, upsertPurchase, removePurchase } = useFirebasePurchases(activeBookId);
  const [openPurchasesModal, setOpenPurchasesModal] = useState(false);
  const [openIncomesModal, setOpenIncomesModal] = useState(false);
  const [chartRange, setChartRange] = useState<'6m' | '12m'>('12m');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  const filteredBills = useFilteredBills(bills, filter, search);
  const totals = useTotals(bills);
  // Overdue count for header banner
  const todayISOHeader = ymd(new Date());
  const overdueCount = bills.filter(b => !b.paid && (parseDate(b.dueDate) < parseDate(todayISOHeader))).length;

  // Hook de notifica├º├Áes
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
  const activeBook = useMemo(() => books.find((book) => book.id === activeBookId) ?? null, [books, activeBookId]);
  const hideValues = Boolean(prefs.hideValues);

  const handleToggleHideValues = () => {
    setPrefs((prev) => ({ ...prev, hideValues: !prev.hideValues }));
  };

  const handleCycleTheme = () => {
    setPrefs((prev) => {
      const order: Array<Types.UserPreferences['theme']> = ['light', 'dark', 'system'];
      const currentIndex = order.indexOf(prev.theme);
      const nextTheme = order[(currentIndex + 1) % order.length];
      return { ...prev, theme: nextTheme };
    });
  };

  const themeLabelMap: Record<Types.UserPreferences['theme'], string> = {
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
  };
  const themeLabel = themeLabelMap[prefs.theme] ?? 'Sistema';

  const handleCreateBookClick = async () => {
    try {
      setIsCreatingBook(true);
      const name = window.prompt('Qual nome deseja atribuir ao novo book? (deixe em branco para padrao)');
      const trimmed = name && name.trim().length > 0 ? name.trim() : undefined;
      await onCreateBook(trimmed);
    } finally {
      setIsCreatingBook(false);
    }
  };

  const handleDeleteBookClick = async () => {
    if (books.length <= 1) {
      alert('Mantenha pelo menos um book ativo.');
      return;
    }
    const confirmed = window.confirm('Excluir este book? Esta acao remove todas as informacoes relacionadas.');
    if (!confirmed) return;
    try {
      setIsDeletingBook(true);
      await onDeleteBook(activeBookId);
    } finally {
      setIsDeletingBook(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">CarregandoÔÇª</div>
    );
  }

  if (!user) {
    return null;
  }

  if (!activeBook) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 dark:text-slate-300">
        Nenhum book selecionado.
      </div>
    );
  }

  const { width } = usePreview();
  const containerStyle = width ? { maxWidth: width, margin: '0 auto' } : { maxWidth: '1100px' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-full mx-auto px-4 py-8 space-y-8" style={containerStyle}>
        <Header
            t={t}
            setEditing={setEditing}
            setEditingIncome={setEditingIncome}
            setEditingPurchase={setEditingPurchase}
            exportICS={exportICS}
            setOpenSettings={setOpenSettings}
            addSampleData={addSampleBills}
          />

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl px-4 py-5 md:px-6 md:py-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Book ativo</span>
            <div className="flex items-center gap-3">
              <select
                value={activeBookId}
                onChange={(event) => onSelectBook(event.target.value)}
                className="px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {books.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.name}
                  </option>
                ))}
              </select>
              {activeBook && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Criado em {new Intl.DateTimeFormat('pt-BR').format(new Date(activeBook.createdAt))}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCreateBookClick}
              className={cn(CSS_CLASSES.button.primary, 'flex items-center gap-2')}
              disabled={isCreatingBook}
            >
              {isCreatingBook ? 'Criando...' : '+ Novo controle'}
            </button>
            <button
              type="button"
              onClick={handleDeleteBookClick}
              className={cn(CSS_CLASSES.button.secondary, 'flex items-center gap-2')}
              disabled={isDeletingBook}
            >
              {isDeletingBook ? 'Excluindo...' : 'Excluir book'}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleToggleHideValues}
              className={cn(CSS_CLASSES.button.secondary, 'flex items-center gap-2')}
            >
              {hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            </button>
            <button
              type="button"
              onClick={handleCycleTheme}
              className={cn(CSS_CLASSES.button.secondary, 'flex items-center gap-2')}
            >
              Tema: {themeLabel}
            </button>
          </div>
        </section>

          {overdueCount > 0 && (
          <div className="rounded-3xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Voce possui {overdueCount} {overdueCount === 1 ? 'conta' : 'contas'} em atraso
            </span>
            <button
              onClick={() => { setView('list'); setFilter('overdue'); }}
              className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 dark:bg-amber-700/60 dark:hover:bg-amber-700 text-amber-900 dark:text-amber-100 text-xs font-semibold transition-colors"
            >
              Verificar
            </button>
          </div>
        )}

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm">
          <TotalsStrip
            bills={bills}
            incomes={incomes}
            purchases={purchases}
            onFilterOverdue={() => { setFilter('overdue'); setView('list'); }}
            filter={filter}
            valuesHidden={hideValues}
          />
          {hideValues && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 text-center">
              Valores ocultos. Toque em "Mostrar valores" para revelar.
            </p>
          )}
        </section>

        <Filters
           view={view}
           setView={setView}
           filter={filter}
           setFilter={setFilter}
           search={search}
           setSearch={setSearch}
           t={t}
         />

        {/* Removido: Totais agora sempre vis├¡veis acima das op├º├Áes */}

        <div className="space-y-6">
          {(view === "list" || view === 'purchases' || view === 'incomes') && (
         <div className="min-h-[60vh]">
            <div className="mb-3 max-w-xs">
              <Select label="Filtro" value={filter} onChange={e => setFilter(e.target.value as Types.FilterType)}>
                <option value="today">{t.filter_today}</option>
                <option value="month">{t.filter_month || t.totals_month}</option>
                <option value="overdue">{t.filter_overdue}</option>
                <option value="all">{t.filter_all}</option>
              </Select>
            </div>
            {view === 'list' && (
              <BillsList
                bills={(function(){
                  // Month view: incluir
                  // - contas com vencimento no m├¬s atual (filteredBills)
                  // - contas pagas neste m├¬s (se├º├úo "Contas pagas")
                  // - contas em atraso (de meses anteriores tamb├®m), para que
                  //   ao desmarcar um pagamento elas retornem ├á lista
                  if (filter !== 'month') return filteredBills;
                  const now = new Date();
                  const y = now.getFullYear();
                  const m = now.getMonth();
                  const inSameMonth = (iso?: string | null) => { if (!iso) return false; const d = parseDate(iso); return d.getFullYear()===y && d.getMonth()===m; };
                  const todayISO = ymd(new Date());
                  const isOverdue = (b: Types.Bill) => !b.paid && parseDate(b.dueDate) < parseDate(todayISO);
                  const extrasPaid = bills.filter(b => inSameMonth(b.paidOn));
                  const extrasOverdue = bills.filter(isOverdue);
                  const all = [...filteredBills, ...extrasPaid, ...extrasOverdue];
                  const seen = new Set<string>();
                  return all.filter(b => { const id = (b as any).id as string | undefined; if (!id) return true; if (seen.has(id)) return false; seen.add(id); return true; });
                })()}
                loading={loading}
                markPaid={markPaid}
                unmarkPaid={unmarkPaid}
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
              if (!activeBookId) return;
              if (editing?.id) {
                upsertBill({ ...billData, id: editing.id, bookId: activeBookId });
              } else {
                upsertBill({ ...billData, bookId: activeBookId });
              }
              setEditing(null);
            }}
             t={t}
             locale={locale}
             currency={currency}
          />
        )}

        {/* Removido: duplica├º├úo da aba de compras */}

         {editingIncome && (
           <IncomeForm
             initial={editingIncome}
             onCancel={() => setEditingIncome(null)}
            onSave={(incomeData) => {
              if (!activeBookId) return;
              if (editingIncome?.id) {
                upsertIncome({ ...incomeData, id: editingIncome.id, bookId: activeBookId });
              } else {
                upsertIncome({ ...incomeData, bookId: activeBookId });
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
              if (!activeBookId) return;
              if (editingPurchase?.id) {
                upsertPurchase({ ...purchaseData, id: editingPurchase.id, bookId: activeBookId });
              } else {
                upsertPurchase({ ...purchaseData, bookId: activeBookId });
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
           <div className="general-summary mb-6 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900">
             <h3 className="text-lg font-semibold mb-2">Balan├ºo geral do m├¬s</h3>
             {/* C├ílculo simples: soma despesas do m├¬s - soma rendas do m├¬s */}
             {(() => {
               const now = new Date();
               const y = now.getFullYear();
               const m = now.getMonth();
               const inMonth = (d: string) => {
                 const dd = new Date(d);
                 return dd.getFullYear() === y && dd.getMonth() === m;
               };
               const monthExpenses = bills.filter(b => inMonth(b.dueDate) && !b.paid).reduce((s, b) => s + Number(b.amount || 0), 0);
               // Considera recorr├¬ncia para rendas: inclui item se tiver ocorr├¬ncia no m├¬s
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
                 <div className="hidden grid grid-cols-1 sm:grid-cols-4 gap-3">
                   <div className="rounded-xl p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200">
                     <div className="text-xs">Despesas do m├¬s</div>
                     <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(monthExpenses)}</div>
                   </div>
                   <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200">
                     <div className="text-xs">Rendas do m├¬s</div>
                     <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(monthIncomes)}</div>
                   </div>
                   <div className="rounded-xl p-3 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                     <div className="text-xs">Balan├ºo</div>
                    <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(balance)}</div>
                  </div>
                  <div className="rounded-xl p-3 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-200">
                    <div className="text-xs">Compras do m├¬s</div>
                    <div className="text-lg font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(monthPurchases)}</div>
                  </div>
                 </div>
               );
            })()}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Per├¡odo:</span>
                <button onClick={() => setChartRange('6m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='6m' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'} border-slate-300 dark:border-slate-600`}>6m</button>
                <button onClick={() => setChartRange('12m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='12m' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'} border-slate-300 dark:border-slate-600`}>12m</button>
                {/* Bot├úo 1 ano removido */}
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
                  const inMonth = (iso: string) => { const dd = parseDate(iso); return dd.getFullYear()===y && dd.getMonth()===m; };
                  const monthBills = bills.filter(b => inMonth(b.dueDate) && !b.paid).reduce((s,b)=> s + Number(b.amount||0), 0);
                  const monthPurch = purchases.filter(p => inMonth(p.date)).reduce((s,p)=> s + Number(p.amount||0), 0);
                  // Renda planejada do m├¬s (mesma l├│gica dos cards)
                  let monthInc = incomes.reduce((sum, i) => {
                    const base = parseDate(i.dueDate);
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
                  // adiciona atrasadas no m├¬s atual
                  let overdueAdd = 0;
                  if (i === 0) {
                    const today = new Date(); today.setHours(0,0,0,0);
                    overdueAdd = bills.filter(b => !b.paid && new Date(b.dueDate) < today).reduce((s,b)=> s + Number(b.amount||0), 0);
                  }
                  exp.push(monthBills + monthPurch);
                  inc.push(monthInc);
                }
                const formatCurrency = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Historico Financeiro</h4>
                    <LineChart
                      labels={labels}
                      series={[{ name: 'Gastos', color: '#ef4444', values: exp }, { name: 'Renda', color: '#10b981', values: inc }]}
                      formatY={formatCurrency}
                      barOverlay={labels.map((_, i) => Math.max(0, inc[i] - exp[i]))}
                      barOverlayColor="#ffffff"
                      barOverlayLabel="Economia"
                    />
                  </div>
                );
              })()}
              {(() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = now.getMonth();
                const inMonth = (iso: string) => { const d = parseDate(iso); return d.getFullYear()===y && d.getMonth()===m; };
                // Gastos: agrupar apenas em "Despesas: Fixas", "Despesas: Variaveis" e "Compras"
                // Considera todas as contas do m├¬s (pagas e em aberto)
                const monthBillsAll = bills.filter(b => inMonth(b.dueDate));
                const isFixed = (cat?: string | null) => {
                  const s = (cat || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
                  return s.includes('fixa');
                };
                const fixedSum = monthBillsAll.filter(b => isFixed(b.category)).reduce((s,b)=> s + Number(b.amount||0), 0);
                const totalBills = monthBillsAll.reduce((s,b)=> s + Number(b.amount||0), 0);
                const variableSum = Math.max(0, totalBills - fixedSum);
                const purchasesSum = purchases.filter(p => inMonth(p.date)).reduce((s,p)=> s + Number(p.amount||0), 0);
                const expData = [
                  { label: 'Despesas: Fixas', value: fixedSum, color: '#ef4444' },
                  { label: 'Despesas: Variaveis', value: variableSum, color: '#f59e0b' },
                  { label: 'Compras', value: purchasesSum, color: '#be185d' },
                ];

                // Renda: exibir por categoria, sem prefixo "Renda:"
                const incomeByCat = new Map<string, number>();
                incomes.forEach(i => {
                  let has = false;
                  try { has = require('@/utils/utils').occurrencesForBillInMonth({ dueDate: i.dueDate, recurrence: i.recurrence } as any, y, m).length>0; } catch { has = inMonth(i.dueDate); }
                  if (has) {
                    const label = i.category || 'Outros';
                    incomeByCat.set(label, (incomeByCat.get(label)||0) + Number(i.amount||0));
                  }
                });
                const incData = Array.from(incomeByCat, ([label, value]) => ({ label, value, color: '#10b981' }));
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribui├º├úo de gastos (m├¬s)</h4>
                      <PieChart data={expData} paletteType="warm" formatValue={(v) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v)} />
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribui├º├úo de renda (m├¬s)</h4>
                      <PieChart data={incData} paletteType="cool" formatValue={(v) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v)} />
                    </div>
                  </div>
                );
              })()}
            </div>
           </div>
         )}

        </div>

        <Footer t={t} />
      </div>
    </div>
  );
}

export default LegacyDashboard;
