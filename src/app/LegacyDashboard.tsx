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
import Modal from "@/components/UI/modals/Modal";

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
  const [openGoals, setOpenGoals] = useState(false);
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

  const goalRows = useMemo(() => {
    const rows: Array<{ label: string; value: string; tone: 'target' | 'limit' }> = [];
    const goals = prefs.goals;
    if (!goals) return rows;
    const formatter = new Intl.NumberFormat(locale, { style: 'currency', currency });
    const addRow = (label: string, amount?: number | null, tone: 'target' | 'limit' = 'target') => {
      if (typeof amount === 'number' && Number.isFinite(amount)) {
        rows.push({ label, value: formatter.format(amount), tone });
      }
    };
    addRow('Meta de renda', goals.incomeTarget, 'target');
    addRow('Meta de economia', goals.savingsTarget, 'target');
    addRow('Teto de gastos em contas', goals.expensesLimit, 'limit');
    addRow('Teto de compras', goals.purchasesLimit, 'limit');
    return rows;
  }, [prefs.goals, locale, currency]);

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
            onOpenGoals={() => setOpenGoals(true)}
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

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <TotalsStrip
            bills={bills}
            incomes={incomes}
            goals={prefs.goals}
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
        <Modal isOpen={openGoals} onClose={() => setOpenGoals(false)} title="Metas">
          <div className="space-y-4">
            {goalRows.length ? (
              <div className="space-y-3">
                {goalRows.map(({ label, value, tone }) => (
                  <div key={label} className="flex items-center justify-between gap-4 text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-200">{label}</span>
                    <span
                      className={tone === 'target' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Nenhuma meta definida ainda. Use as configuracoes para cadastrar metas de renda, economia ou tetos de gastos.
              </p>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setOpenGoals(false)} className={CSS_CLASSES.button.secondary}>
                Fechar
              </button>
              <button
                onClick={() => { setOpenGoals(false); setOpenSettings(true); }}
                className={CSS_CLASSES.button.primary}
              >
                Configurar metas
              </button>
            </div>
          </div>
        </Modal>
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
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 dark:text-slate-300">Per├¡odo:</span>
                <button onClick={() => setChartRange('6m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='6m' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'} border-slate-300 dark:border-slate-600`}>6m</button>
                <button onClick={() => setChartRange('12m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='12m' ? 'bg-slate-200 dark:bg-slate-700' : 'bg-transparent'} border-slate-300 dark:border-slate-600`}>12m</button>
                {/* Bot├úo 1 ano removido */}
              </div>
              {(() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = now.getMonth();
                const totalDays = new Date(y, m + 1, 0).getDate();
                const weeks = Math.max(1, Math.ceil(totalDays / 7));
                const weekPrefix = prefs.language === 'en' ? 'Week' : 'Semana';
                const weekLabels = Array.from({ length: weeks }, (_, idx) => `${weekPrefix} ${idx + 1}`);
                const weekIncome = Array.from({ length: weeks }, () => 0);
                const weekBills = Array.from({ length: weeks }, () => 0);
                const weekPurchases = Array.from({ length: weeks }, () => 0);
                const inMonth = (iso: string) => { const d = parseDate(iso); return d.getFullYear() === y && d.getMonth() === m; };
                const indexFor = (date: Date) => Math.min(weeks - 1, Math.floor((date.getDate() - 1) / 7));
                incomes.forEach((income) => {
                  const occ = occurrencesForBillInMonth({ dueDate: income.dueDate, recurrence: income.recurrence } as any, y, m);
                  const amount = Number(income.amount || 0);
                  occ.forEach((iso) => {
                    const day = parseDate(iso);
                    weekIncome[indexFor(day)] += amount;
                  });
                });
                bills.forEach((bill) => {
                  const occ = occurrencesForBillInMonth(bill, y, m);
                  const amount = Number(bill.amount || 0);
                  occ.forEach((iso) => {
                    const day = parseDate(iso);
                    weekBills[indexFor(day)] += amount;
                  });
                });
                purchases.forEach((purchase) => {
                  if (!inMonth(purchase.date)) return;
                  const day = parseDate(purchase.date);
                  weekPurchases[indexFor(day)] += Number(purchase.amount || 0);
                });
                const weekExpenses = weekBills.map((value, idx) => value + weekPurchases[idx]);
                const cumulativeSaldo: number[] = [];
                let running = 0;
                for (let idx = 0; idx < weeks; idx += 1) {
                  running += weekIncome[idx] - weekExpenses[idx];
                  cumulativeSaldo.push(running);
                }
                const formatCurrency = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Projecao renda x gastos (semanas)</h4>
                    <LineChart
                      labels={weekLabels}
                      height={240}
                      series={[
                        { name: 'Renda', color: '#10b981', values: weekIncome },
                        { name: 'Contas', color: '#f97316', values: weekBills },
                        { name: 'Compras', color: '#06b6d4', values: weekPurchases },
                        { name: 'Saldo acumulado', color: '#2563eb', values: cumulativeSaldo },
                      ]}
                      formatY={formatCurrency}
                    />
                  </div>
                );
              })()}
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
                                    const monthBills = bills.reduce((sum, bill) => {
                    const occurrences = occurrencesForBillInMonth(bill, y, m);
                    if (!occurrences.length) return sum;
                    return sum + occurrences.length * Number(bill.amount || 0);
                  }, 0);
                  const monthPurch = purchases.filter(p => inMonth(p.date)).reduce((s,p)=> s + Number(p.amount||0), 0);
                  const monthInc = incomes.reduce((sum, income) => {
                    const occurrences = occurrencesForBillInMonth({ dueDate: income.dueDate, recurrence: income.recurrence } as any, y, m);
                    if (!occurrences.length) return sum;
                    return sum + occurrences.length * Number(income.amount || 0);
                  }, 0);
                  exp.push(monthBills + monthPurch);
                  inc.push(monthInc);
                }
                const formatCurrency = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                    <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Historico Financeiro</h4>
                    <LineChart
                      labels={labels}
                      height={260}
                      series={[
                        { name: 'Gastos', color: '#ef4444', values: exp },
                        { name: 'Renda', color: '#10b981', values: inc },
                        { name: 'Economia', color: '#38bdf8', values: labels.map((_, i) => Math.max(0, inc[i] - exp[i])) },
                      ]}
                      formatY={formatCurrency}
                    />
                  </div>
                );
              })()}
              {(() => {
                const now = new Date();
                const y = now.getFullYear();
                const m = now.getMonth();
                const inMonth = (iso: string) => { const d = parseDate(iso); return d.getFullYear() === y && d.getMonth() === m; };
                const expenseMap = new Map<string, number>();
                bills.forEach((bill) => {
                  const occ = occurrencesForBillInMonth(bill, y, m);
                  if (!occ.length) return;
                  const total = occ.length * Number(bill.amount || 0);
                  const label = bill.category || 'Contas diversas';
                  expenseMap.set(label, (expenseMap.get(label) || 0) + total);
                });
                purchases.forEach((purchase) => {
                  if (!inMonth(purchase.date)) return;
                  const label = purchase.category || 'Outros';
                  const key = `Compra: ${label}`;
                  expenseMap.set(key, (expenseMap.get(key) || 0) + Number(purchase.amount || 0));
                });
                const expenseSlices = expenseMap.size
                  ? Array.from(expenseMap, ([label, value]) => ({ label, value, color: '' }))
                  : [{ label: 'Sem gastos', value: 1, color: '#94a3b8' }];

                const incomeMap = new Map<string, number>();
                incomes.forEach((income) => {
                  const occ = occurrencesForBillInMonth({ dueDate: income.dueDate, recurrence: income.recurrence } as any, y, m);
                  if (!occ.length) return;
                  const label = income.category || 'Outros';
                  incomeMap.set(label, (incomeMap.get(label) || 0) + occ.length * Number(income.amount || 0));
                });
                const incomeSlices = incomeMap.size
                  ? Array.from(incomeMap, ([label, value]) => ({ label, value, color: '' }))
                  : [{ label: 'Sem renda', value: 1, color: '#94a3b8' }];

                const formatter = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribuicao de gastos (mes)</h4>
                      <PieChart data={expenseSlices} paletteType="warm" formatValue={formatter} />
                    </div>
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700 dark:text-slate-200">Distribuicao de renda (mes)</h4>
                      <PieChart data={incomeSlices} paletteType="cool" formatValue={formatter} />
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
