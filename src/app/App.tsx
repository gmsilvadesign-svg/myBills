import React, { useState } from "react";
import '../styles/App.css';
import { useI18n, LANG_TO_LOCALE } from "../constants/constants";
import { buildICSForMonth, download } from '../utils/utils.ts';
import { usePrefs } from '../hooks/usePrefs.ts'
import { useLocalBills } from '../hooks/useLocalBills.ts';
import useFilteredBills from '../hooks/useFilteredBills';
import useTotals from '../hooks/useTotals';
import useBillsActions from '../hooks/useBillsActions';
import Header from '../components/layout/Header';
import Filters from '../components/layout/Filters.tsx';
import BillsList from '../components/UI/bills/BillsList.tsx';
import BillsCalendar from '../components/UI/bills/BillsCalendar';
import BillForm from '../components/UI/bills/BillForm.tsx'
import Confirm from '../components/UI/modals/Confirm';
import SettingsModal from '../components/UI/modals/Settings.tsx';
import Footer from '../components/layout/Footer';

export default function App() {
  const [prefs, setPrefs] = usePrefs();
  const locale = LANG_TO_LOCALE[prefs.language] || "pt-BR";
  const currency = prefs.currency || "BRL";
  const t = useI18n(prefs.language);

  const [bills, setBills] = useLocalBills();
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({open:false,id:null});
  const [monthDate, setMonthDate] = useState(new Date());
  const [openSettings, setOpenSettings] = useState(false);

  const filtered = useFilteredBills(bills, filter, search);
  const totals = useTotals(bills);
  const { upsertBill, removeBill, markPaid } = useBillsActions(setBills);

  const exportICS = () => {
    const ics = buildICSForMonth(bills, monthDate, locale, currency);
    const fname = `contas-${monthDate.getFullYear()}-${String(monthDate.getMonth()+1).padStart(2,'0')}.ics`;
    download(fname, ics);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Header t={t} setEditing={setEditing} exportICS={exportICS} setOpenSettings={setOpenSettings}/>
        <Filters view={view} setView={setView} filter={filter} setFilter={setFilter} search={search} setSearch={setSearch} totals={totals} t={t} locale={locale} currency={currency}/>

        {view==="list" && <BillsList bills={filtered} markPaid={markPaid} setEditing={setEditing} setConfirm={setConfirm} t={t} locale={locale} currency={currency}/>}
        {view==="calendar" && <BillsCalendar bills={bills} monthDate={monthDate} setMonthDate={setMonthDate} t={t} locale={locale} currency={currency}/>}

        {editing && <BillForm initial={editing?.id ? editing : null} onCancel={()=>setEditing(null)} onSave={upsertBill} t={t} locale={locale} currency={currency}/>}
        <Confirm open={confirm.open} title={t.confirm_delete_title} body={t.confirm_delete_body} t={t} onClose={()=>setConfirm({open:false,id:null})} onConfirm={()=>removeBill(confirm.id)} />
        <SettingsModal open={openSettings} onClose={()=>setOpenSettings(false)} prefs={prefs} setPrefs={setPrefs} t={t} />
        <Footer t={t}/>
      </div>
    </div>
  );
}