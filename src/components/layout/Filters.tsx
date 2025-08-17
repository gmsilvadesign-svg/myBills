import TotalsPills from '../UI/TotalsPills';
import ToggleButton from '../UI/ToggleButton';

export default function Filters({ view, setView, filter, setFilter, search, setSearch, totals, t, locale, currency }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <ToggleButton items={[["list",t.view_list],["calendar",t.view_calendar]]} selected={view} onChange={setView} />
      <ToggleButton items={[["all",t.filter_all],["today",t.filter_today],["overdue",t.filter_overdue],["next7",t.filter_next7],["next30",t.filter_next30]]} selected={filter} onChange={setFilter} />
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search_placeholder}
        className="flex-1 min-w-[220px] rounded-2xl border border-slate-300 px-3 py-2 dark:bg-slate-900 dark:border-slate-700"/>
      <TotalsPills totals={totals} t={t} locale={locale} currency={currency} />
    </div>
  )
}