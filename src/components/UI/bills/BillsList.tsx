import { memo } from 'react'
import Section from '@/components/layout/Section'
import BillRow from '@/components/UI/bills/BillRow'
import * as Types from '@/types'
interface BillsListProps {
  bills: Types.Bill[];
  loading: boolean;
  markPaid: (bill: Types.Bill, advance: boolean) => void;
  setEditing: (bill: Types.Bill) => void;
  setConfirm: (confirm: Types.ConfirmState) => void;
  t: Record<string, string>; // Traduções
  locale: string;
  currency: string;
  purchasesTotalMonth?: number;
  onOpenPurchases?: () => void;
  incomesTotalMonth?: number;
  onOpenIncomes?: () => void;
}

const BillsList = memo(function BillsList({ bills, loading, markPaid, setEditing, setConfirm, t, locale, currency, purchasesTotalMonth = 0, onOpenPurchases, incomesTotalMonth = 0, onOpenIncomes }: BillsListProps) {
  
  
  return (
    <Section title={t.section_bills}>
      <div className="divide-y divide-slate-200 dark:divide-[#AABBCC]/30 overflow-hidden">
        {/* Resumo de Compras do mês */}
        <div className="flex items-center justify-between px-3 py-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200">
          <div className="font-medium">{t.monthly_purchases || 'Compras do mês'}</div>
          <div className="flex items-center gap-3">
            <div className="font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(purchasesTotalMonth)}</div>
            <button onClick={onOpenPurchases} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              {t.view_purchases || 'Ver compras'}
            </button>
          </div>
        </div>

        {/* Resumo de Rendas do mês */}
        <div className="flex items-center justify-between px-3 py-4 bg-emerald-50/60 dark:bg-emerald-900/10 text-emerald-800 dark:text-emerald-200">
          <div className="font-medium">{t.monthly_incomes || 'Rendas do mês'}</div>
          <div className="flex items-center gap-3">
            <div className="font-semibold">{new Intl.NumberFormat(locale, { style: 'currency', currency }).format(incomesTotalMonth)}</div>
            <button onClick={onOpenIncomes} className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm">
              {t.view_incomes || 'Ver rendas'}
            </button>
          </div>
        </div>
        
        {/* Estado 1: ainda carregando */}
        {loading && <div className="text-slate-500 py-8 text-center flex items-center justify-center min-h-[400px]">{t.loading_bills}</div>}

        {/* Estado 2: carregou e tem contas */}
        {!loading && bills.length > 0 && bills.map(b => (
          <BillRow 
            key={b.id} 
            bill={b} 
            markPaid={markPaid} 
            setEditing={setEditing} 
            setConfirm={setConfirm} 
            t={t} 
            locale={locale} 
            currency={currency}
          />
        ))}

        {/* Estado 3: carregou mas não tem contas */}
        {!loading && bills.length === 0 && (
          <div className="text-slate-500 py-8 text-center min-h-[400px] flex items-center justify-center">{t.no_bills}</div>
        )}
      </div>
    </Section>
  )
})

export default BillsList
