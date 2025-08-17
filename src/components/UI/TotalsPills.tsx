// Importa o componente Pill para exibir rótulos estilizados
import Pill from './Pill.tsx';

// Importa função para formatar valores monetários
import { fmtMoney } from '../../utils/utils.ts';

export default function TotalsPills({ totals, t, locale, currency }) {

  // JSX do container de totais com rótulos coloridos
  return (
    <div className="ml-auto flex items-center gap-2">
      
      {/* Pill para mostrar o total de contas em aberto */}
      <Pill tone="amber">
        {t.totals_open}: {fmtMoney(totals.allOpen, currency, locale)}
      </Pill>

      {/* Pill para mostrar o total de contas do mês */}
      <Pill tone="blue">
        {t.totals_month}: {fmtMoney(totals.monthOpen, currency, locale)}
      </Pill>

    </div>
  );
}