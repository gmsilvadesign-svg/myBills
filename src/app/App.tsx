// Importa o React e o hook useState para gerenciar estados locais do componente
import React, { useState } from "react"; 

// Importa o CSS principal da aplicação
import '../styles/App.css'; 

// useI18n: hook para tradução/idioma
// LANG_TO_LOCALE: mapeamento de idioma para locale (ex: pt-BR, en-US)
import { useI18n, LANG_TO_LOCALE } from "../constants/constants"; 

// buildICSForMonth: gera arquivo ICS (calendário) para o mês com as contas
// download: função para baixar arquivos no navegador
import { buildICSForMonth, download } from '../utils/utils.ts'; 

// hook customizado para gerenciar preferências do usuário (idioma, moeda etc.)
import { usePrefs } from '../hooks/usePrefs.ts';

// hook customizado para gerenciar as contas salvas localmente
import { useLocalBills } from '../hooks/useLocalBills.ts'; 

// hook que retorna contas filtradas por pesquisa/filtro
import useFilteredBills from '../hooks/useFilteredBills'; 

// hook que calcula totais (ex: total de contas, total pago etc.)
import useTotals from '../hooks/useTotals'; 

// hook que fornece funções para alterar as contas (adicionar, remover, marcar como pago)
import useBillsActions from '../hooks/useBillsActions'; 

// Componente do cabeçalho da aplicação
import Header from '../components/layout/Header'; 

// Componente para filtros, pesquisa e troca de visualização (lista/calendário)
import Filters from '../components/layout/Filters.tsx'; 

// Componente que exibe a lista de contas
import BillsList from '../components/UI/bills/BillsList.tsx'; 

// Componente que exibe as contas em calendário
import BillsCalendar from '../components/UI/bills/BillsCalendar'; 

// Formulário para adicionar ou editar contas
import BillForm from '../components/UI/bills/BillForm.tsx'; 

// Modal de confirmação (ex: para deletar uma conta)
import Confirm from '../components/UI/modals/Confirm'; 

// Modal de configurações (idioma, moeda, preferências)
import SettingsModal from '../components/UI/modals/Settings.tsx'; 

// Componente do rodapé da aplicação
import Footer from '../components/layout/Footer'; 

export default function App() {
  // Armazena preferências do usuário (idioma, moeda)
  const [prefs, setPrefs] = usePrefs(); 
  
  // Define o locale baseado na preferência de idioma do usuário (fallback pt-BR)
  const locale = LANG_TO_LOCALE[prefs.language] || "pt-BR"; 

  // Define a moeda baseada na preferência do usuário (fallback BRL)
  const currency = prefs.currency || "BRL"; 

  // Função de tradução baseada no idioma do usuário
  const t = useI18n(prefs.language); 

  // Estado com todas as contas armazenadas localmente
  const [bills, setBills] = useLocalBills(); 

  // Define se a visualização atual é "lista" ou "calendário"
  const [view, setView] = useState("list"); 

  // Filtro aplicado às contas (ex: todas, pagas, pendentes)
  const [filter, setFilter] = useState("all"); 

  // Termo de pesquisa para filtrar contas
  const [search, setSearch] = useState(""); 

  // Estado para controlar a conta que está sendo editada
  const [editing, setEditing] = useState(null); 

  // Estado para modal de confirmação (ex: deletar conta)
  const [confirm, setConfirm] = useState({open:false,id:null}); 

  // Data do mês atual para exibição no calendário
  const [monthDate, setMonthDate] = useState(new Date()); 

  // Controle de abertura do modal de configurações
  const [openSettings, setOpenSettings] = useState(false); 

  // Contas filtradas de acordo com pesquisa e filtro selecionado
  const filtered = useFilteredBills(bills, filter, search); 

  // Totais calculados a partir das contas
  const totals = useTotals(bills); 

  // Funções para adicionar/editar conta, remover conta e marcar como paga
  const { upsertBill, removeBill, markPaid } = useBillsActions(setBills); 

  // Função que exporta as contas do mês atual para um arquivo ICS
  const exportICS = () => {
    const ics = buildICSForMonth(bills, monthDate, locale, currency);
    const fname = `contas-${monthDate.getFullYear()}-${String(monthDate.getMonth()+1).padStart(2,'0')}.ics`;
    download(fname, ics);
  }

  // JSX principal do App
  return (
    // Container principal da aplicação com estilo responsivo e suporte a dark mode
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">

      {/* Centraliza o conteúdo e define largura máxima */}
      <div className="max-w-6xl mx-auto">

        {/* Cabeçalho com título, botões de exportar e abrir configurações */}
        <Header 
          t={t} 
          setEditing={setEditing} 
          exportICS={exportICS} 
          setOpenSettings={setOpenSettings}
        />

        {/* Componente de filtros e troca de visualização */}
        <Filters 
          view={view} 
          setView={setView} 
          filter={filter} 
          setFilter={setFilter} 
          search={search} 
          setSearch={setSearch} 
          totals={totals} 
          t={t} 
          locale={locale} 
          currency={currency}
        />

        {/* Exibe lista de contas quando a view é "list" */}
        {view==="list" && 
          <BillsList 
            bills={filtered} 
            markPaid={markPaid} 
            setEditing={setEditing} 
            setConfirm={setConfirm} 
            t={t} 
            locale={locale} 
            currency={currency}
          />
        }

        {/* Exibe calendário de contas quando a view é "calendar" */}
        {view==="calendar" && 
          <BillsCalendar 
            bills={bills} 
            monthDate={monthDate} 
            setMonthDate={setMonthDate} 
            t={t} 
            locale={locale} 
            currency={currency}
          />
        }

        {/* Formulário de adicionar/editar conta quando uma conta está sendo editada */}
        {editing && 
          <BillForm 
            initial={editing?.id ? editing : null} 
            onCancel={()=>setEditing(null)} 
            onSave={upsertBill} 
            t={t} 
            locale={locale} 
            currency={currency}
          />
        }

        {/* Modal de confirmação para deletar conta */}
        <Confirm 
          open={confirm.open} 
          title={t.confirm_delete_title} 
          body={t.confirm_delete_body} 
          t={t} 
          onClose={()=>setConfirm({open:false,id:null})} 
          onConfirm={()=>removeBill(confirm.id)} 
        />

        {/* Modal de configurações */}
        <SettingsModal 
          open={openSettings} 
          onClose={()=>setOpenSettings(false)} 
          prefs={prefs} 
          setPrefs={setPrefs} 
          t={t} 
        />

        {/* Rodapé da aplicação */}
        <Footer t={t}/>
      </div>
    </div>
  );
}