import { memo } from 'react';
import ToggleButton from '@/components/UI/ToggleButton';
import * as Types from '@/types';

interface FiltersProps {
  view: Types.ViewType;
  setView: (view: Types.ViewType) => void;
  filter: Types.FilterType;
  setFilter: (filter: Types.FilterType) => void;
  search: string;
  setSearch: (search: string) => void;
  t: Record<string, string>;
}

const Filters = memo(function Filters({ view, setView, filter, setFilter, search, setSearch, t }: FiltersProps) {

  // JSX do componente
  return (
    // Container principal dos filtros, flexível, responsivo e com espaçamento entre elementos
    <div className="flex flex-col sm:flex-row flex-wrap items items-stretch sm:items-center gap-3 sm:gap-2 mb-4">

      {/* Container para os botões de toggle - responsivo */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
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
      </div>

      {/* Input de pesquisa de contas - responsivo */}
      <input 
        value={search} 
        onChange={e => setSearch(e.target.value)} 
        placeholder={t.search_placeholder}
        className="flex-1 min-w-[200px] sm:min-w-[220px] rounded-xl border bg-white text-slate-900 border-slate-300 px-3 py-2 dark:text-white dark:bg-slate-900 dark:border-slate-700"
      />


    </div>
  );
});

export default Filters;