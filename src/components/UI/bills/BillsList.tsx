// Importa componente Section para agrupar conteúdo com título
import Section from '../../layout/Section.tsx'

// Importa componente BillRow, que renderiza cada linha de conta individual
import BillRow from './BillRow.tsx'

// Componente BillsList: exibe uma lista de contas em formato de seção
export default function BillsList({ bills, loading, markPaid, setEditing, setConfirm, t, locale, currency }) {
  
  
  return (
    <Section title={t.section_bills}>
      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        
        {/* Estado 1: ainda carregando */}
        {loading && <div className="text-slate-500">{t.loading_bills}</div>}

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
          <div className="text-slate-500">{t.no_bills}</div>
        )}
      </div>
    </Section>
  )
}
