// Importa componente que exibe os totais de contas em pequenos badges/pills
import TotalsPills from '../UI/TotalsPills'; 

// Importa botão toggle personalizado para alternar entre opções
import ToggleButton from '../UI/ToggleButton'; 

// Componente Filters: exibe filtros, pesquisa e troca de visualização (lista/calendário)
export default function Filters({ view, setView, filter, setFilter, search, setSearch, totals, t, locale, currency }) {

  // JSX do componente
  return (
    // Container principal dos filtros, flexível, responsivo e com espaçamento entre elementos
    <div className="flex flex-wrap items-center gap-2 mb-4">

      {/* Botão toggle para alternar entre visualização "lista" e "calendário" */}
      <ToggleButton 
        items={[["list", t.view_list], ["calendar", t.view_calendar]]} 
        selected={view} 
        onChange={setView} 
      />

      {/* Botão toggle para alternar entre filtros de contas */}
      <ToggleButton 
        items={[
          ["all", t.filter_all],
          ["today", t.filter_today],
          ["overdue", t.filter_overdue],
          ["next7", t.filter_next7],
          ["next30", t.filter_next30]
        ]} 
        selected={filter} 
        onChange={setFilter} 
      />

      {/* Input de pesquisa de contas */}
      <input 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        placeholder={t.search_placeholder}
        className="flex-1 min-w-[220px] rounded-2xl border bg-white text-slate-900 border-slate-300 px-3 py-2 dark:text-white dark:bg-slate-900 dark:border-slate-700"
      />

      {/* Component que exibe os totais de contas em pills, incluindo tradução, locale e moeda */}
      <TotalsPills 
        totals={totals} 
        t={t} 
        locale={locale} 
        currency={currency} 
      />
    </div>
  )
}