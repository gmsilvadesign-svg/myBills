// src/App.jsx
import { useState } from "react";
import '../styles/App.css';
import { useI18n, LANG_TO_LOCALE } from "../constants/constants"; 


// Componentes
import Header from '../components/layout/Header';
import Filters from '../components/layout/Filters';
import BillsList from '../components/UI/bills/BillsList';
import BillsCalendar from '../components/UI/bills/BillsCalendar';
import BillForm from '../components/UI/bills/BillForm';
import DeleteConfirm from '../components/UI/modals/DeleteConfirm';
import SettingsModal from '../components/UI/modals/Settings';
import Footer from '../components/layout/Footer';

// Hooks
import { usePrefs } from '../hooks/usePrefs';
import useFilteredBills from '../hooks/useFilteredBills';
import useTotals from '../hooks/useTotals';
import useFirebaseBills from '../hooks/useFirebaseBills';

export default function App() {
  // Preferências do usuário
  const [prefs, setPrefs] = usePrefs();
  const locale = LANG_TO_LOCALE[prefs.language] || "pt-BR";
  const currency = prefs.currency || "BRL";
  const t = useI18n(prefs.language);

  // Hook do Firebase
  const { bills, upsertBill, removeBill, markPaid } = useFirebaseBills();

  // Estados locais
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any>(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [monthDate, setMonthDate] = useState(new Date());
  const [openSettings, setOpenSettings] = useState(false);

  // Filtragem e totais
  const filtered = useFilteredBills(bills, filter, search);
  const totals = useTotals(bills);

  // Função para exportar ICS (mantida local, não Firebase)
  const exportICS = () => {
    import('../utils/utils').then(({ buildICSForMonth, download }) => {
      const ics = buildICSForMonth(bills, monthDate, locale, currency);
      const fname = `contas-${monthDate.getFullYear()}-${String(monthDate.getMonth()+1).padStart(2,'0')}.ics`;
      download(fname, ics);
    });
  };

  return (
     <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">

        <Header 
          t={t} 
          setEditing={setEditing} 
          exportICS={exportICS} 
          setOpenSettings={setOpenSettings} 
        />

        <Filters 
          view={view} setView={setView}
          filter={filter} setFilter={setFilter}
          search={search} setSearch={setSearch}
          totals={totals} t={t} locale={locale} currency={currency}
        />

        {view === "list" &&
          <BillsList 
            bills={filtered}
            markPaid={markPaid}
            setEditing={setEditing}
            setConfirm={setConfirm}
            t={t} locale={locale} currency={currency}
          />
        }

        {view === "calendar" &&
          <BillsCalendar 
            bills={bills} monthDate={monthDate} setMonthDate={setMonthDate}
            t={t} locale={locale} currency={currency}
          />
        }

        {editing &&
          <BillForm
            initial={editing} 
            onCancel={() => setEditing(null)}
            onSave={upsertBill}
            t={t} locale={locale} currency={currency}
          />
        }

        <DeleteConfirm 
          open={confirm.open} 
          title={t.confirm_delete_title} 
          body={t.confirm_delete_body} 
          t={t} 
          onClose={() => setConfirm({ open: false, id: null })}
          onConfirm={() => {
            if(confirm.id) removeBill(confirm.id);
            setConfirm({ open: false, id: null });
          }}
        />

        <SettingsModal 
          open={openSettings} onClose={() => setOpenSettings(false)}
          prefs={prefs} setPrefs={setPrefs} t={t}
        />

        <Footer t={t} />
      </div>
    </div>
  );
}