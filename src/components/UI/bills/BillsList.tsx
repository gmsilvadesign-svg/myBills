import Section from '../../layout/Section.tsx';
import BillRow from './BillRow.tsx';

export default function BillsList({ bills, markPaid, setEditing, setConfirm, t, locale, currency }) {
  return (
    <Section title={t.section_bills}>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {bills.length===0 && <div className="text-slate-500">{t.no_bills}</div>}
        {bills.map(b=>(
          <BillRow key={b.id} bill={b} markPaid={markPaid} setEditing={setEditing} setConfirm={setConfirm} t={t} locale={locale} currency={currency}/>
        ))}
      </div>
    </Section>
  )
}