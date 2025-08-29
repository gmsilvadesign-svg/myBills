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
          items={[["general", t.general], ["list", t.view_list], ["calendar", t.view_calendar], ["purchases", t.purchases || 'Compras'], ["incomes", t.incomes || 'Rendas']]} 
          selected={view} 
          onChange={setView} 
        />
      </div>

      {/* Campo de pesquisa removido conforme solicitado */}


    </div>
  );
});

export default Filters;
