import { memo } from 'react'
import Section from '../../layout/Section'
import BillRow from './BillRow'
import * as Types from '../../../types'
interface BillsListProps {
  bills: Types.Bill[];
  loading: boolean;
  markPaid: (bill: Types.Bill, advance: boolean) => void;
  setEditing: (bill: Types.Bill) => void;
  setConfirm: (confirm: Types.ConfirmState) => void;
  t: Record<string, string>; // Traduções
  locale: string;
  currency: string;
}

const BillsList = memo(function BillsList({ bills, loading, markPaid, setEditing, setConfirm, t, locale, currency }: BillsListProps) {
  
  
  return (
    <Section title={t.section_bills}>
      <div className="divide-y divide-slate-200 dark:divide-[#AABBCC]/30 overflow-hidden">
        
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
