// React
import { useCallback, useMemo, useState } from "react";

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
import BillForm from "@/components/UI/bills/BillForm";
// import TotalsPills from "@/components/UI/TotalsPills";
import IncomeForm from "@/components/UI/incomes/IncomeForm";
import PurchasesModal from "@/components/UI/modals/PurchasesModal";
import PurchaseForm from "@/components/UI/purchases/PurchaseForm";
import TotalsStrip from "@/components/UI/TotalsStrip";
import LineChart from "@/components/UI/charts/LineChart";
import PieChart from "@/components/UI/charts/PieChart";
import IncomesModal from "@/components/UI/modals/IncomesModal";
import PurchasesTab from "@/components/UI/purchases/PurchasesTab";
import IncomesTab from "@/components/UI/incomes/IncomesTab";
import { CSS_CLASSES, cn } from "@/styles/constants";

// Modals
import DeleteConfirm from "@/components/UI/modals/DeleteConfirm";
import SettingsModal from "@/components/UI/modals/Settings";

// Hooks
import { usePrefs } from "@/hooks/usePrefs";
import useFilteredBills from "@/hooks/useFilteredBills";
import useFirebaseBills from "@/hooks/useFirebaseBills";
import useFirebaseIncomes from "@/hooks/useFirebaseIncomes";
import useFirebasePurchases from "@/hooks/useFirebasePurchases";

// Contexts
import { useAuth } from "@/contexts/AuthContext";
import { usePreview } from "@/contexts/PreviewContext";

// Utils
import { addSampleBills } from "@/utils/addSampleData";
import { occurrencesForBillInMonth, occurrencesForIncomeInMonth, parseDate, ymd } from "@/utils/utils";
import { collectBillOccurrencesForMonth, collectBillOccurrencesUpToMonth } from "@/utils/billOccurrences";

type IncomeOccurrenceSummary = {
  income: Types.Income;
  occurrence: string;
  amount: number;
};

const normalizeISO = (iso: string) => ymd(parseDate(iso));

const isSameMonthISO = (iso: string, year: number, monthIndex: number) => {
  const date = parseDate(iso);
  return date.getFullYear() === year && date.getMonth() === monthIndex;
};

const computeIncomeOccurrencesForMonth = (
  income: Types.Income,
  year: number,
  monthIndex: number,
): IncomeOccurrenceSummary[] => {
  const occurrences = occurrencesForIncomeInMonth(income, year, monthIndex);
  return occurrences.map((iso) => ({
    income,
    occurrence: normalizeISO(iso),
    amount: Number(income.amount || 0),
  }));
};

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
  const { incomes, upsertIncome, removeIncome } = useFirebaseIncomes(activeBookId);
  const [view, setView] = useState<Types.ViewType>("list");
  const [filter, setFilter] = useState<Types.FilterType>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Types.Bill> | null>(null);
  const [confirm, setConfirm] = useState<Types.ConfirmState>({
    open: false,
    id: null,
  });
  const [editingIncome, setEditingIncome] = useState<Partial<Types.Income> | null>(null);
  const [editingPurchase, setEditingPurchase] = useState<Partial<Types.Purchase> | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const base = new Date();
    base.setDate(1);
    base.setHours(0, 0, 0, 0);
    return base;
  });
  const [openSettings, setOpenSettings] = useState(false);
  const { purchases, upsertPurchase, removePurchase } = useFirebasePurchases(activeBookId);
  const { width } = usePreview();
  const [openPurchasesModal, setOpenPurchasesModal] = useState(false);
  const [openIncomesModal, setOpenIncomesModal] = useState(false);
  const [chartRange, setChartRange] = useState<'6m' | '12m'>('12m');
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [isDeletingBook, setIsDeletingBook] = useState(false);
  const [showCreateBookModal, setShowCreateBookModal] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [createBookError, setCreateBookError] = useState("");

  const statsYear = selectedMonth.getFullYear();
  const statsMonthIndex = selectedMonth.getMonth();

  const incomeTotalForMonth = (year: number, monthIndex: number) =>
    incomes.reduce((total, income) => {
      const occurrences = occurrencesForIncomeInMonth(income, year, monthIndex);
      if (!occurrences.length) return total;
      return total + occurrences.length * Number(income.amount || 0);
    }, 0);

  const purchasesTotalForMonth = (year: number, monthIndex: number) =>
    purchases.reduce((total, purchase) => {
      return isSameMonthISO(purchase.date, year, monthIndex)
        ? total + Number(purchase.amount || 0)
        : total;
    }, 0);

  const billsTotalForMonth = (year: number, monthIndex: number) =>
    bills.reduce((total, bill) => {
      const occurrences = collectBillOccurrencesForMonth(bill, year, monthIndex);
      if (!occurrences.length) return total;
      return total + occurrences.reduce((sum, occ) => sum + occ.amount, 0);
    }, 0);

  const filteredBills = useFilteredBills(bills, filter, search, selectedMonth);
  const getOccurrenceDate = (bill: Types.Bill) => {
    const meta = (bill as any).__meta__ as { occurrenceDate?: string } | undefined;
    return meta?.occurrenceDate ?? bill.dueDate;
  };
  const todayISOHeader = ymd(new Date());

  const billOccurrencesUpToSelectedMonth = useMemo(() => {
    const targetYear = selectedMonth.getFullYear();
    const targetMonth = selectedMonth.getMonth();
    return bills.flatMap((bill) =>
      collectBillOccurrencesUpToMonth(bill, targetYear, targetMonth),
    );
  }, [bills, selectedMonth]);

  const billOccurrencesUpToToday = useMemo(() => {
    const today = new Date();
    return bills.flatMap((bill) =>
      collectBillOccurrencesUpToMonth(bill, today.getFullYear(), today.getMonth(), today),
    );
  }, [bills]);

  const monthlyIncomeOccurrences = useMemo(() => {
    const targetYear = selectedMonth.getFullYear();
    const targetMonth = selectedMonth.getMonth();
    return incomes.flatMap((income) =>
      computeIncomeOccurrencesForMonth(income, targetYear, targetMonth),
    );
  }, [incomes, selectedMonth]);

  const monthlyPurchases = useMemo(() => {
    const targetYear = selectedMonth.getFullYear();
    const targetMonth = selectedMonth.getMonth();
    return purchases.filter((purchase) => isSameMonthISO(purchase.date, targetYear, targetMonth));
  }, [purchases, selectedMonth]);

  const totalsForSelectedMonth = useMemo(() => {
    const todayRef = parseDate(todayISOHeader);
    const billMetrics = billOccurrencesUpToSelectedMonth.reduce(
      (acc, occurrence) => {
        acc.total += occurrence.amount;
        if (occurrence.paid) {
          acc.paid += occurrence.amount;
          return acc;
        }
        const occurrenceDate = parseDate(occurrence.occurrence);
        if (occurrenceDate < todayRef) {
          acc.overdue += occurrence.amount;
        } else {
          acc.open += occurrence.amount;
        }
        return acc;
      },
      { open: 0, overdue: 0, paid: 0, total: 0 },
    );

    const incomeTotal = monthlyIncomeOccurrences.reduce((sum, entry) => sum + entry.amount, 0);
    const purchasesTotal = monthlyPurchases.reduce((sum, purchase) => sum + Number(purchase.amount || 0), 0);

    return {
      bills: billMetrics,
      income: incomeTotal,
      purchases: purchasesTotal,
    };
  }, [
    billOccurrencesUpToSelectedMonth,
    monthlyIncomeOccurrences,
    monthlyPurchases,
    todayISOHeader,
  ]);

  const listBillsData = useMemo(() => {
    if (filter !== "all") return filteredBills;
    const targetMonth = selectedMonth.getMonth();
    const targetYear = selectedMonth.getFullYear();
    const seen = new Set<string>();
    const monthItems: Types.Bill[] = [];

    const pushIfUnique = (bill: Types.Bill) => {
      const meta = (bill as any).__meta__ as { displayKey?: string } | undefined;
      const occurrenceKey = getOccurrenceDate(bill);
      const key =
        meta?.displayKey ??
        (bill.id ? `${bill.id}-${occurrenceKey}` : `${bill.title}-${occurrenceKey}`);
      if (seen.has(key)) return;
      seen.add(key);
      monthItems.push(bill);
    };

    filteredBills.forEach((bill) => {
      const occurrence = parseDate(getOccurrenceDate(bill));
      if (occurrence.getFullYear() === targetYear && occurrence.getMonth() === targetMonth) {
        pushIfUnique(bill);
      }
    });

    bills.forEach((bill) => {
      if (!bill.paidOn) return;
      const paidDate = parseDate(bill.paidOn);
      if (paidDate.getFullYear() !== targetYear || paidDate.getMonth() !== targetMonth) return;
      pushIfUnique(bill);
    });

    return monthItems;
  }, [filteredBills, filter, selectedMonth, bills]);
  const overdueCount = useMemo(() => {
    const todayRef = parseDate(todayISOHeader);
    return billOccurrencesUpToToday.reduce((count, occurrence) => {
      if (occurrence.paid) return count;
      const occurrenceDate = parseDate(occurrence.occurrence);
      if (occurrenceDate >= todayRef) return count;
      return count + 1;
    }, 0);
  }, [billOccurrencesUpToToday, todayISOHeader]);
  const handleViewOverdue = useCallback(() => {
    setView("list");
    setFilter("overdue");
    setSelectedMonth(() => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      monthStart.setHours(0, 0, 0, 0);
      return monthStart;
    });
  }, []);

  // Hook de notificacoes
  const exportICS = () => {
    import("@/utils/utils").then(({ buildICSForMonth, download }) => {
      const ics = buildICSForMonth(bills, selectedMonth, locale, currency);
      const fname = `contas-${selectedMonth.getFullYear()}-${String(
        selectedMonth.getMonth() + 1
      ).padStart(2, "0")}.ics`;
      download(fname, ics);
    });
  };
  const activeBook = useMemo(() => books.find((book) => book.id === activeBookId) ?? null, [books, activeBookId]);
  const hideValues = Boolean(prefs.hideValues);
  const monthFilterActive = filter !== "overdue";
  const monthLabel = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" });
    const label = formatter.format(selectedMonth);
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [locale, selectedMonth]);
  const handlePrevMonth = () => {
    setSelectedMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() - 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  };
  const handleNextMonth = () => {
    setSelectedMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + 1);
      next.setDate(1);
      next.setHours(0, 0, 0, 0);
      return next;
    });
  };
  const showMonthSelector = view === "list" || view === "purchases" || view === "incomes" || view === "general";

  const countOccurrencesForSchedule = (dueDate: string, recurrence: Types.Bill['recurrence'], year: number, month: number) => {
    const stub: Types.Bill = {
      id: 'schedule',
      title: '',
      amount: 0,
      dueDate,
      recurrence,
      paid: false,
      paidOn: null,
    };
    return occurrencesForBillInMonth(stub, year, month).length;
  };

  const handleCreateBookClick = () => {
    if (isCreatingBook) return;
    setNewBookName("");
    setCreateBookError("");
    setShowCreateBookModal(true);
  };

  const handleSubmitCreateBook = useCallback(async () => {
    const trimmed = newBookName.trim();
    if (!trimmed) {
      setCreateBookError('Informe um nome para o book.');
      return;
    }
    try {
      setIsCreatingBook(true);
      await onCreateBook(trimmed);
      setShowCreateBookModal(false);
      setNewBookName('');
      setCreateBookError('');
    } catch (error) {
      console.error('[LegacyDashboard] createBook error', error);
      setCreateBookError('Nao foi possivel criar o book. Tente novamente.');
    } finally {
      setIsCreatingBook(false);
    }
  }, [newBookName, onCreateBook]);

  const handleCloseCreateBookModal = useCallback(() => {
    if (isCreatingBook) return;
    setShowCreateBookModal(false);
    setNewBookName('');
    setCreateBookError('');
  }, [isCreatingBook]);

  const handleDeleteBookClick = async () => {
    if (books.length <= 1) {
      alert('Mantenha pelo menos um book ativo.');
      return;
    }
    const confirmed = window.confirm('Excluir este book? Esta acao remove todas as informacoes relacionadas.');
    if (!confirmed) return;
    const securityAnswer = window.prompt(`Para confirmar, digite o nome do book ativo ("${activeBook?.name || ''}").`);
    if ((securityAnswer || '').trim() !== (activeBook?.name || '').trim()) {
      alert('Confirmacao invalida. Nenhuma alteracao foi realizada.');
      return;
    }
    try {
      setIsDeletingBook(true);
      await onDeleteBook(activeBookId);
    } finally {
      setIsDeletingBook(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">Carregando...</div>
    );
  }

  if (!user) {
    return null;
  }

  if (!activeBook) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Nenhum book selecionado.
      </div>
    );
  }

  const containerStyle = width ? { maxWidth: width, margin: '0 auto' } : { maxWidth: '1100px' };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="w-full mx-auto px-4 py-8 space-y-8 zoom-500:px-2 zoom-500:py-4 zoom-500:space-y-4" style={containerStyle}>
        <Header
            t={t}
            setEditing={setEditing}
            setEditingIncome={setEditingIncome}
            setEditingPurchase={setEditingPurchase}
            exportICS={exportICS}
            setOpenSettings={setOpenSettings}
            addSampleData={addSampleBills}
          />

        <section className="bg-white border border-slate-200 rounded-3xl px-4 py-5 md:px-6 md:py-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-2 flex-1">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Book ativo</span>
              <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                <select
                  value={activeBookId}
                  onChange={(event) => onSelectBook(event.target.value)}
                  className="px-3 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full md:w-[320px] min-w-0"
                >
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.name}
                    </option>
                  ))}
                </select>
                {activeBook && (
                  <span className="text-xs text-slate-400 md:whitespace-nowrap">
                    Criado em {new Intl.DateTimeFormat('pt-BR').format(new Date(activeBook.createdAt))}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleCreateBookClick}
                className={cn(CSS_CLASSES.button.primary, 'flex items-center gap-2 justify-center min-w-[140px]')}
                disabled={isCreatingBook}
              >
                {isCreatingBook ? 'Criando...' : 'Novo Book'}
              </button>
              <button
                type="button"
                onClick={handleDeleteBookClick}
                className={cn(CSS_CLASSES.button.secondary, 'flex items-center gap-2 justify-center min-w-[140px]')}
                disabled={isDeletingBook}
              >
                {isDeletingBook ? 'Excluindo...' : 'Excluir book'}
              </button>
            </div>
          </div>
        </section>

        {overdueCount > 0 && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 px-4 py-3 flex flex-wrap items-center gap-3 shadow-sm">
            <span className="text-sm text-amber-800">
              Voce possui {overdueCount} {overdueCount === 1 ? 'conta' : 'contas'} em atraso
            </span>
            <button
              onClick={handleViewOverdue}
              className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 text-xs font-semibold transition-colors"
            >
              Verificar
            </button>
          </div>
        )}

        <section className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm">
          <TotalsStrip
            totals={totalsForSelectedMonth}
            onFilterOverdue={() => {
              setFilter('overdue');
              setView('list');
            }}
            valuesHidden={hideValues}
          />
          {hideValues && (
            <p className="mt-3 text-xs text-slate-500 text-center">
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
          monthLabel={monthLabel}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          showMonthSelector={showMonthSelector}
        />

        {/* Removido: Totais agora sempre visiveis acima das opcoes */}

        <div className="space-y-6">
          {(view === "list" || view === 'purchases' || view === 'incomes') && (
         <div className="min-h-[60vh]">
            {view === 'list' && (
              <BillsList
                bills={listBillsData}
                loading={loading}
                markPaid={markPaid}
                unmarkPaid={unmarkPaid}
                setEditing={setEditing}
                setConfirm={setConfirm}
                t={t}
                locale={locale}
                currency={currency}
                purchasesTotalMonth={monthFilterActive ? (() => {
                  const monthRef = selectedMonth;
                  const y = monthRef.getFullYear();
                  const m = monthRef.getMonth();
                  return purchases
                    .filter((p) => {
                      const d = new Date(p.date);
                      return d.getFullYear() === y && d.getMonth() === m;
                    })
                    .reduce((s, p) => s + Number(p.amount || 0), 0);
                })() : undefined}
                onOpenPurchases={() => setOpenPurchasesModal(true)}
                incomesTotalMonth={monthFilterActive ? (() => {
                  const monthRef = selectedMonth;
                  const y = monthRef.getFullYear();
                  const m = monthRef.getMonth();
                  return incomes.reduce((sum, income) => {
                    const occurrences = countOccurrencesForSchedule(
                      income.dueDate,
                      income.recurrence,
                      y,
                      m,
                    );
                    if (occurrences > 0) {
                      return sum + occurrences * Number(income.amount || 0);
                    }
                    return sum;
                  }, 0);
                })() : undefined}
                onOpenIncomes={() => setOpenIncomesModal(true)}
                hideValues={prefs.hideValues}
                referenceMonth={monthFilterActive ? selectedMonth : undefined}
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
                hideValues={prefs.hideValues}
                referenceMonth={monthFilterActive ? selectedMonth : undefined}
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
                hideValues={prefs.hideValues}
                referenceMonth={monthFilterActive ? selectedMonth : undefined}
              />
            )}
          </div>
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

        {/* Removido: duplicacao da aba de compras */}

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

         {showCreateBookModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
            <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-900">Criar novo book</h2>
              <p className="text-sm text-slate-600">Informe um nome para identificar este conjunto de dados financeiros.</p>
              <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); handleSubmitCreateBook(); }}>
                <div>
                  <label className="text-sm font-medium text-slate-700" htmlFor="newBookName">Nome do book</label>
                  <input
                    id="newBookName"
                    type="text"
                    value={newBookName}
                    onChange={(event) => { setNewBookName(event.target.value); if (createBookError) setCreateBookError(''); }}
                    disabled={isCreatingBook}
                    autoFocus
                    className="mt-1 w-full rounded-2xl border border-slate-300 px-3 py-2 text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                    placeholder="Ex.: Planejamento 2025"
                  />
                </div>
                {createBookError && (<p className="text-sm text-red-600">{createBookError}</p>)}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseCreateBookModal}
                    disabled={isCreatingBook}
                    className={cn(CSS_CLASSES.button.secondary, 'min-w-[110px] justify-center')}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingBook}
                    className={cn(CSS_CLASSES.button.primary, 'min-w-[110px] justify-center')}
                  >
                    {isCreatingBook ? 'Criando...' : 'Criar book'}
                  </button>
                </div>
              </form>
            </div>
          </div>
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
          referenceMonth={selectedMonth}
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
          referenceMonth={selectedMonth}
        />
         {view === 'general' && (
           <div className="general-summary mb-6 rounded-2xl border border-slate-200 p-4 bg-white">
             <h3 className="text-lg font-semibold mb-2">Balanco geral do mes</h3>
             {/* Calculo simples: soma despesas do mes - soma rendas do mes */}
            {/* Indicadores mensais removidos conforme solicitado */}
            <div className="space-y-6">
              {(() => {
                const months = chartRange === '6m' ? 6 : 12;
                const labels: string[] = [];
                const exp: number[] = [];
                const inc: number[] = [];
                for (let i = months - 1; i >= 0; i--) {
                  const d = new Date(statsYear, statsMonthIndex - i, 1);
                  labels.push(d.toLocaleDateString(locale, { month: 'short' }));
                  const y = d.getFullYear();
                  const m = d.getMonth();
                  const monthBills = billsTotalForMonth(y, m);
                  const monthPurch = purchasesTotalForMonth(y, m);
                  const monthInc = incomeTotalForMonth(y, m);
                  exp.push(monthBills + monthPurch);
                  inc.push(monthInc);
                }
                const formatCurrency = (v: number) =>
                  new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-slate-700">Historico Financeiro</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600">Periodo:</span>
                        <button onClick={() => setChartRange('6m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='6m' ? 'bg-slate-200' : 'bg-transparent'} border-slate-300`}>6m</button>
                        <button onClick={() => setChartRange('12m')} className={`px-3 py-1 rounded-lg border text-xs ${chartRange==='12m' ? 'bg-slate-200' : 'bg-transparent'} border-slate-300`}>12m</button>
                      </div>
                    </div>
                    <div className="flex justify-center">
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
                  </div>
                );
              })()}
              {(() => {
                const y = statsYear;
                const m = statsMonthIndex;
                const totalDays = new Date(y, m + 1, 0).getDate();
                const weekPrefix = prefs.language === 'en' ? 'Week' : 'Semana';
                const dayLabels = Array.from({ length: totalDays }, (_, idx) => String(idx + 1).padStart(2, '0'));
                const secondaryWeekLabels = Array.from({ length: totalDays }, (_, idx) => {
                  const weekIndex = Math.floor(idx / 7);
                  return idx % 7 === 0 ? `${weekPrefix} ${weekIndex + 1}` : '';
                });
                const dayIncome = Array.from({ length: totalDays }, () => 0);
                const dayBills = Array.from({ length: totalDays }, () => 0);
                const dayPurchases = Array.from({ length: totalDays }, () => 0);
                const inMonth = (iso: string) => { const d = parseDate(iso); return d.getFullYear() === y && d.getMonth() === m; };
                const indexFor = (date: Date) => date.getDate() - 1;

                const processedBillKeys = new Set<string>();
                const registerBillValue = (bill: Types.Bill, iso: string, amount: number) => {
                  const key = `${bill.id ?? bill.title}-${iso}`;
                  if (processedBillKeys.has(key)) return;
                  processedBillKeys.add(key);
                  const day = parseDate(iso);
                  const idx = indexFor(day);
                  if (idx >= 0 && idx < totalDays) dayBills[idx] += amount;
                };

                incomes.forEach((income) => {
                  const occ = occurrencesForIncomeInMonth(income, y, m);
                  const amount = Number(income.amount || 0);
                  occ.forEach((iso) => {
                    const day = parseDate(iso);
                    const idx = indexFor(day);
                    if (idx >= 0 && idx < totalDays) dayIncome[idx] += amount;
                  });
                });
                listBillsData.forEach((bill) => {
                  const amount = Number(bill.amount || 0);
                  const occurrenceISO = getOccurrenceDate(bill);
                  if (!occurrenceISO) return;
                  if (!inMonth(occurrenceISO)) return;
                  registerBillValue(bill, occurrenceISO, amount);
                });
                purchases.forEach((purchase) => {
                  if (!inMonth(purchase.date)) return;
                  const day = parseDate(purchase.date);
                  const idx = indexFor(day);
                  if (idx >= 0 && idx < totalDays) dayPurchases[idx] += Number(purchase.amount || 0);
                });
                const dayExpenses = dayBills.map((value, idx) => value + dayPurchases[idx]);
                const dayTotalExpenses = dayExpenses;
                const cumulativeSaldo: number[] = [];
                let running = 0;
                for (let idx = 0; idx < totalDays; idx += 1) {
                  running += dayIncome[idx] - dayExpenses[idx];
                  cumulativeSaldo.push(running);
                }
                const formatCurrency = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="rounded-xl border border-slate-200 p-4">
                    <h4 className="font-semibold mb-2 text-slate-700 text-center">Projecao renda x gastos (semanas)</h4>
                    <div className="flex justify-center">
                      <LineChart
                        labels={dayLabels}
                        secondaryLabels={secondaryWeekLabels}
                        height={240}
                        series={[
                          { name: 'Renda', color: '#10b981', values: dayIncome },
                          { name: 'Gastos', color: '#f97316', values: dayTotalExpenses },
                          { name: 'Saldo acumulado', color: '#2563eb', values: cumulativeSaldo },
                        ]}
                        formatY={formatCurrency}
                      />
                    </div>
                  </div>
                );
              })()}
              {(() => {
                const y = statsYear;
                const m = statsMonthIndex;
                const inMonth = (iso: string) => { const d = parseDate(iso); return d.getFullYear() === y && d.getMonth() === m; };
                const expenseItems: { label: string; value: number }[] = [];
                listBillsData.forEach((bill) => {
                  const occurrenceISO = getOccurrenceDate(bill);
                  if (!occurrenceISO || !inMonth(occurrenceISO)) return;
                  expenseItems.push({
                    label: bill.title,
                    value: Number(bill.amount || 0),
                  });
                });
                purchases.forEach((purchase) => {
                  if (!inMonth(purchase.date)) return;
                  expenseItems.push({
                    label: purchase.title,
                    value: Number(purchase.amount || 0),
                  });
                });
                const totalExpenses = expenseItems.reduce((sum, item) => sum + item.value, 0);
                const sortedExpenses = expenseItems.sort((a, b) => (a.value || 0) - (b.value || 0));
                const SMALL_THRESHOLD = 0.05;
                const MAX_OTHERS_SHARE = 0.15;
                const majorExpenses: { label: string; value: number; children?: { label: string; value: number }[] }[] = [];
                const othersChildren: { label: string; value: number }[] = [];
                let othersTotal = 0;
                sortedExpenses.forEach((item) => {
                  if (!totalExpenses) {
                    majorExpenses.push(item);
                    return;
                  }
                  const share = item.value / totalExpenses;
                  if (share < SMALL_THRESHOLD && (othersTotal + item.value) / totalExpenses <= MAX_OTHERS_SHARE) {
                    othersChildren.push(item);
                    othersTotal += item.value;
                  } else {
                    majorExpenses.push(item);
                  }
                });
                if (othersChildren.length) {
                  majorExpenses.push({ label: 'Outros', value: othersTotal, children: othersChildren });
                }
                const expenseSlices = majorExpenses.length
                  ? majorExpenses
                      .sort((a, b) => (b.value || 0) - (a.value || 0))
                      .map((item) => ({ ...item, color: '' }))
                  : [{ label: 'Sem gastos', value: 1, color: '#94a3b8' }];

                const incomeMap = new Map<string, number>();
                incomes.forEach((income) => {
                  const occurrences = occurrencesForIncomeInMonth(income, y, m);
                  if (!occurrences.length) return;
                  const label = income.category || 'Outros';
                  incomeMap.set(label, (incomeMap.get(label) || 0) + occurrences.length * Number(income.amount || 0));
                });
                const incomeSlices = incomeMap.size
                  ? Array.from(incomeMap, ([label, value]) => ({ label, value, color: '' }))
                      .sort((a, b) => (b.value || 0) - (a.value || 0))
                  : [{ label: 'Sem renda', value: 1, color: '#94a3b8' }];

                const formatter = (v: number) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(v);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700">Distribuicao de gastos (mes)</h4>
                      <PieChart
                        data={expenseSlices}
                        paletteType="warm"
                        formatValue={formatter}
                        showLegend
                        showTotal
                        totalLabel="Total"
                      />
                    </div>
                    <div className="rounded-xl border border-slate-200 p-4">
                      <h4 className="font-semibold mb-2 text-slate-700">Distribuicao de renda (mes)</h4>
                      <PieChart
                        data={incomeSlices}
                        paletteType="cool"
                        formatValue={formatter}
                        showLegend
                        showTotal
                        totalLabel="Total"
                      />
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


















