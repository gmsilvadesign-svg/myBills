import Pill from './Pill.tsx'
import { fmtMoney } from '../../utils/utils.ts';

export default function TotalsPills({ totals, t, locale, currency }) {
  return (
    <div className="ml-auto flex items-center gap-2">
      <Pill tone="amber">{t.totals_open}: {fmtMoney(totals.allOpen, currency, locale)}</Pill>
      <Pill tone="blue">{t.totals_month}: {fmtMoney(totals.monthOpen, currency, locale)}</Pill>
    </div>
  )
}