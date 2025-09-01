// React
import { useCallback, useState } from 'react';

// Components
import ToolbarButton from '@/components/UI/ToolbarButton';

// Modals
import NotificationsModal from '@/components/UI/modals/NotificationsModal';
import AdminPanel from '@/components/UI/modals/AdminPanel';

// Styles & Utils
import { CSS_CLASSES, cn } from '@/styles/constants';
import { useAuth } from '@/contexts/AuthContext';

// Types
import * as Types from '@/types';

interface HeaderProps {
  t: Record<string, string>; // Traduções
  setEditing: (bill: Partial<Types.Bill> | null) => void;
  setEditingIncome?: (income: Partial<Types.Income> | null) => void;
  setEditingPurchase?: (purchase: Partial<Types.Purchase> | null) => void;
  exportICS: () => void;
  setOpenSettings: (open: boolean) => void;
  addSampleData?: () => void;
}

export default function Header({ t, setEditing, setEditingIncome, setEditingPurchase, exportICS, setOpenSettings, addSampleData }: HeaderProps) {
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openAdminPanel, setOpenAdminPanel] = useState(false);
  const { user, signInWithGoogle, signOutApp } = useAuth();

  const handleOpenNotifications = useCallback(() => {
    setOpenNotifications(true);
  }, []);
  const handleNewBill = useCallback(() => {
    setEditing({});
  }, [setEditing]);

  const handleNewIncome = useCallback(() => {
    setEditingIncome && setEditingIncome({});
  }, [setEditingIncome]);

  const handleOpenSettings = useCallback(() => {
    setOpenSettings(true);
  }, [setOpenSettings]);

  const handleOpenAdminPanel = useCallback(() => {
    setOpenAdminPanel(true);
  }, []);

  const handleNewPurchase = useCallback(() => {
    setEditingPurchase && setEditingPurchase({});
  }, [setEditingPurchase]);

  // JSX do componente Header
  return (
    <header className={cn(CSS_CLASSES.flex.responsive, 'md:items-center', CSS_CLASSES.flex.gap4, 'md:gap-6', CSS_CLASSES.spacing.mb6)}>
      <div className="flex-1">
        <div className="text-xl sm:text-2xl font-bold">
          <span className="text-green-400">A</span>
          <span className="text-green-700">- PAGAR</span>
          <span className="text-slate-400"> V004</span>
        </div>
      </div>

      <nav className={cn(CSS_CLASSES.flex.wrap, CSS_CLASSES.flex.gap2, 'items-center justify-center md:justify-end')} aria-label={t.main_actions || "Ações principais"}>
        {/* Botão para criar uma nova conta */}
        <ToolbarButton 
          onClick={handleNewBill}
          ariaLabel={t.new_bill}
        >
          {t.new_bill}
        </ToolbarButton>

        {/* Botão para abrir formulário de nova compra */}
        {setEditingPurchase && (
          <ToolbarButton 
            onClick={handleNewPurchase}
            ariaLabel={t.new_purchase || "+ Compra"}
          >
            {t.new_purchase || "+ Compra"}
          </ToolbarButton>
        )}

        {/* Botão para criar uma nova fonte de renda */}
        {setEditingIncome && (
          <ToolbarButton 
            onClick={handleNewIncome}
            ariaLabel={t.new_income || "+ Fonte de Renda"}
          >
            {t.new_income || "+ Fonte de Renda"}
          </ToolbarButton>
        )}

        {/* Botão temporário para adicionar dados de exemplo */}
        {addSampleData && (
          <ToolbarButton 
            onClick={addSampleData}
            ariaLabel="Adicionar dados de exemplo"
          >
            📝 Exemplo
          </ToolbarButton>
        )}

        {/* Botão para exportar contas em arquivo ICS */}
        <ToolbarButton 
          onClick={exportICS}
          ariaLabel={t.export_ics}
        >
          {t.export_ics}
        </ToolbarButton>

        {/* Autenticação */}
        {!user ? (
          <ToolbarButton onClick={signInWithGoogle} ariaLabel="Entrar">Entrar</ToolbarButton>
        ) : (
          <ToolbarButton onClick={signOutApp} ariaLabel="Sair">Sair</ToolbarButton>
        )}

        {/* Ícone de notificações */}
        <button
          onClick={handleOpenNotifications}
          aria-label={t.notifications}
          className="px-3 py-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <span aria-hidden="true">🔔</span>
        </button>

        {/* Botão para abrir o modal de configurações */}
        <button
          onClick={handleOpenSettings}
          aria-label={t.settings}
          className="px-3 py-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <span aria-hidden="true">⚙️</span>
        </button>

        {/* Botão para abrir o painel de administração */}
        <button
          onClick={handleOpenAdminPanel}
          aria-label="Painel de Administração"
          className="px-3 py-3 rounded-2xl bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-700 border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <span aria-hidden="true">🔧</span>
        </button>
      </nav>

      {/* Modal de notificações */}
      <NotificationsModal
        open={openNotifications}
        onClose={() => setOpenNotifications(false)}
        t={t}
      />

      {/* Modal do painel de administração */}
      <AdminPanel
        isOpen={openAdminPanel}
        onClose={() => setOpenAdminPanel(false)}
      />
    </header>
  );
}
