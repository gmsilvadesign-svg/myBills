import Section from '@/components/layout/Section';
import IncomeRow from '@/components/UI/incomes/IncomeRow';
import * as Types from '@/types';
import { occurrencesForIncomeInMonth, fmtMoneyTruncated } from '@/utils/utils';
import { TranslationDictionary } from '@/constants/translation';

interface IncomesTabProps {
  incomes: Types.Income[];
  onEdit: (income: Types.Income) => void;
  onRemove: (id: string) => void;
  t: TranslationDictionary;
  locale: string;
  currency: string;
  filter?: Types.FilterType;
  hideValues?: boolean;
  referenceMonth?: Date;
}

export default function IncomesTab({
  incomes,
  onEdit,
  onRemove,
  t,
  locale,
  currency,
  hideValues = false,
  referenceMonth,
}: IncomesTabProps) {
  const today = new Date();
  const monthRef = referenceMonth ?? today;
  const y = monthRef.getFullYear();
  const m = monthRef.getMonth();

  const isSameMonth = (iso: string, year: number, monthIndex: number) => {
    const date = new Date(iso);
    return date.getFullYear() === year && date.getMonth() === monthIndex;
  };

  const entries = incomes.flatMap((income) => {
    const occurrences = occurrencesForIncomeInMonth(income, y, m);
    if (!occurrences.length) return [];
    return occurrences.map((iso) => ({ income, occurrence: iso }));
  });

  const monthlyEntries = entries.filter(({ occurrence }) => isSameMonth(occurrence, y, m));
  const orderedEntries = [...monthlyEntries].sort((a, b) => {
    const dateComparison = a.occurrence.localeCompare(b.occurrence);
    if (dateComparison !== 0) return dateComparison;
    return (a.income.title || '').localeCompare(b.income.title || '');
  });

  const total = orderedEntries.reduce((sum, { income }) => sum + Number(income.amount || 0), 0);
  const totalFormatted = hideValues ? '*****' : fmtMoneyTruncated(total, currency, locale);

  return (
    <>
      <Section title={t.monthly_incomes || 'Rendas do mes'}>
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">{t.monthly_incomes || 'Rendas do mes'}</h3>
          <span className="text-sm font-semibold text-slate-900">{totalFormatted}</span>
        </div>

        {orderedEntries.length === 0 ? (
          <div className="text-slate-600 text-center py-8">{t.no_incomes || 'Nenhuma renda registrada neste mes.'}</div>
        ) : (
          <div>
            {orderedEntries.map(({ income, occurrence }, index) => (
              <IncomeRow
                key={`${income.id ?? income.title}-${occurrence}-${index}`}
                income={income}
                occurrenceDate={occurrence}
                onEdit={onEdit}
                onRemove={onRemove}
                locale={locale}
                currency={currency}
                t={t}
                hideValues={hideValues}
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="Check-in">
        <div className="text-slate-600 text-center py-8">
          Nenhum check-in disponivel no momento. Esta area recebera dados em breve.
        </div>
      </Section>
    </>
  );
}


