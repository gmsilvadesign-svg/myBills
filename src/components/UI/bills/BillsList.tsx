// Importa componente Section para agrupar conteúdo com título
import Section from '../../layout/Section.tsx'

// Importa componente BillRow, que renderiza cada linha de conta individual
import BillRow from './BillRow.tsx'

// Componente BillsList: exibe uma lista de contas em formato de seção
export default function BillsList({ bills, markPaid, setEditing, setConfirm, t, locale, currency }) {

  // JSX da lista de contas
  return (
    // Seção com título traduzido
    <Section title={t.section_bills}>

      {/* Container com linhas separadas por bordas (divide-y) */}
      <div className="divide-y divide-slate-200">

        {/* Mensagem quando não há contas */}
        {bills.length === 0 && <div className="text-slate-500">{t.no_bills}</div>}

        {/* Mapeia as contas e renderiza cada BillRow */}
        {bills.map(b => (
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

      </div>

    </Section>
  )
}
