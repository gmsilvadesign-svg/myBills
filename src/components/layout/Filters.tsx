import { memo } from 'react';
import ToggleButton from '@/components/UI/ToggleButton';
import Select from '@/components/UI/Select';
import * as Types from '@/types';
import { TranslationDictionary } from '@/constants/translation';

interface FiltersProps {
  view: Types.ViewType;
  setView: (view: Types.ViewType) => void;
  filter: Types.FilterType;
  setFilter: (filter: Types.FilterType) => void;
  search: string;
  setSearch: (search: string) => void;
  t: TranslationDictionary;
  monthLabel?: string;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  showMonthSelector?: boolean;
}

const Filters = memo(function Filters({
  view,
  setView,
  filter,
  setFilter,
  search: _search,
  setSearch: _setSearch,
  t,
  monthLabel,
  onPrevMonth,
  onNextMonth,
  showMonthSelector = false,
}: FiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 sm:gap-2 mb-4 zoom-500:gap-0.5 zoom-500:mb-1">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
        <ToggleButton
          items={[
            ['general', t.general],
            ['list', t.view_list],
            ['purchases', t.purchases || 'Compras'],
            ['incomes', t.incomes || 'Rendas'],
          ]}
          selected={view}
          onChange={setView}
        />
      </div>

      {(view === 'list' || view === 'purchases' || view === 'incomes') && (
        <div className="max-w-xs">
          <Select
            label="Filtro"
            value={filter}
            onChange={(e) => setFilter(e.target.value as Types.FilterType)}
          >
            <option value="today">{t.filter_today}</option>
            <option value="month">{t.filter_month || t.totals_month}</option>
            <option value="overdue">{t.filter_overdue}</option>
            <option value="all">{t.filter_all}</option>
          </Select>
        </div>
      )}

      {showMonthSelector && monthLabel && onPrevMonth && onNextMonth && (
        <div className="flex sm:ml-auto">
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium shadow-sm">
            <button
              type="button"
              onClick={onPrevMonth}
              className="rounded-full border border-transparent px-2 py-1 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              &lt;
            </button>
            <span className="whitespace-nowrap text-slate-700">{monthLabel}</span>
            <button
              type="button"
              onClick={onNextMonth}
              className="rounded-full border border-transparent px-2 py-1 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              &gt;
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default Filters;
