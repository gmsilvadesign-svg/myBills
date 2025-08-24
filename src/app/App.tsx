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
import TotalsPills from "@/components/UI/TotalsPills";

// Modals
import DeleteConfirm from "@/components/UI/modals/DeleteConfirm";
import SettingsModal from "@/components/UI/modals/Settings";

// Hooks
import { usePrefs } from "@/hooks/usePrefs";
import useFilteredBills from "@/hooks/useFilteredBills";
import useTotals from "@/hooks/useTotals";
import useFirebaseBills from "@/hooks/useFirebaseBills";
import { useBillNotifications } from "@/hooks/useBillNotifications";

// Contexts
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TranslationProvider } from "@/contexts/TranslationContext";

// Utils
import { addSampleBills } from "@/utils/addSampleData";

function App() {
  const [prefs, setPrefs] = usePrefs();
  const locale = LANG_TO_LOCALE[prefs.language] || "pt-BR";
  const currency = prefs.currency || "BRL";
  const t = useI18n(prefs.language);
  const { bills, loading, upsertBill, removeBill, markPaid } =
    useFirebaseBills();
  const [view, setView] = useState<Types.ViewType>("list");
  const [filter, setFilter] = useState<Types.FilterType>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<Types.Bill> | null>(null);
  const [confirm, setConfirm] = useState<Types.ConfirmState>({
    open: false,
    id: null,
  });
  const [monthDate, setMonthDate] = useState(new Date());
  const [openSettings, setOpenSettings] = useState(false);

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

  return (
    <div className="min-h-screen justify-center p-8 flex overflow-x-auto">
      <div className="">
        <Header
           t={t}
           setEditing={setEditing}
           exportICS={exportICS}
           setOpenSettings={setOpenSettings}
           addSampleData={addSampleBills}
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

         {/* Component que exibe os totais de contas em pills */}
         <div className="flex justify-end mb-4">
           <TotalsPills 
             totals={totals} 
             onFilterOverdue={() => {
               setFilter('overdue');
               setView('list');
             }}
           />
         </div>
 
         {view === "list" && (
           <BillsList
             bills={filteredBills}
             loading={loading}
             markPaid={markPaid}
             setEditing={setEditing}
             setConfirm={setConfirm}
             t={t}
             locale={locale}
             currency={currency}
           />
         )}
 
         {view === "calendar" && (
           <BillsCalendar
             bills={bills}
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

         <Footer t={t} />
       </div>
     </div>
   );
}

export default function AppWithProviders() {
  return (
    <NotificationProvider>
      <TranslationProvider>
        <App />
      </TranslationProvider>
    </NotificationProvider>
  );
}