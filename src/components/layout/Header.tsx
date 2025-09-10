// React
import { useCallback, useState } from 'react';

// Components
import ToolbarButton from '@/components/UI/ToolbarButton';
import SideDrawer from '@/components/UI/SideDrawer';

// Modals
import NotificationsModal from '@/components/UI/modals/NotificationsModal';
import AdminPanel from '@/components/UI/modals/AdminPanel';

// Styles & Utils
import { CSS_CLASSES, cn } from '@/styles/constants';
import { useAuth } from '@/contexts/AuthContext';

// Types
import * as Types from '@/types';

interface HeaderProps {
  t: Record<string, string>;
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
  const [openMore, setOpenMore] = useState(false);
  const { user, signInWithGoogle, signOutApp } = useAuth();

  const handleOpenNotifications = useCallback(() => setOpenNotifications(true), []);
  const handleNewBill = useCallback(() => setEditing({}), [setEditing]);
  const handleNewIncome = useCallback(() => setEditingIncome && setEditingIncome({}), [setEditingIncome]);
  const handleOpenSettings = useCallback(() => setOpenSettings(true), [setOpenSettings]);
  const handleOpenAdminPanel = useCallback(() => setOpenAdminPanel(true), []);
  const handleNewPurchase = useCallback(() => setEditingPurchase && setEditingPurchase({}), [setEditingPurchase]);

  return (
    <header className={cn(CSS_CLASSES.flex.responsive, 'md:items-center', CSS_CLASSES.flex.gap4, 'md:gap-6', CSS_CLASSES.spacing.mb6)}>
      <div className="flex-1">
        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight brand-konta bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-700 select-none">
          Konta
        </div>
      </div>

      <nav className={cn(CSS_CLASSES.flex.wrap, CSS_CLASSES.flex.gap2, 'items-center justify-center md:justify-end')} aria-label={t.main_actions || 'Ações principais'}>
        {/* + Nova conta */}
        <ToolbarButton onClick={handleNewBill} ariaLabel={t.new_bill}>{t.new_bill}</ToolbarButton>

        {/* + Compra */}
        {setEditingPurchase && (
          <ToolbarButton onClick={handleNewPurchase} ariaLabel={t.new_purchase || '+ Compra'}>{t.new_purchase || '+ Compra'}</ToolbarButton>
        )}

        {/* + Fonte de Renda */}
        {setEditingIncome && (
          <ToolbarButton onClick={handleNewIncome} ariaLabel={t.new_income || '+ Fonte de Renda'}>{t.new_income || '+ Fonte de Renda'}</ToolbarButton>
        )}

        {/* Botão lateral (hamburger) */}
        <button
          onClick={() => setOpenMore(true)}
          aria-label="Mais opções"
          className="px-3 py-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <span aria-hidden="true">≡</span>
        </button>
      </nav>

      {/* Modal de notificações */}
      <NotificationsModal open={openNotifications} onClose={() => setOpenNotifications(false)} t={t} />

      {/* Admin Panel */}
      <AdminPanel isOpen={openAdminPanel} onClose={() => setOpenAdminPanel(false)} />

      {/* Menu lateral com as outras ações */}
      <SideDrawer open={openMore} onClose={() => setOpenMore(false)} title="Mais opções">
        <button onClick={() => { exportICS(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.export_ics}</button>
        <button onClick={() => { handleOpenNotifications(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.notifications}</button>
        <button onClick={() => { handleOpenSettings(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.settings}</button>
        <button onClick={() => { handleOpenAdminPanel(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>Painel de Administração</button>
        {!user ? (
          <button onClick={() => { signInWithGoogle(); setOpenMore(false); }} className={CSS_CLASSES.button.primary}>Entrar</button>
        ) : (
          <button onClick={() => { signOutApp(); setOpenMore(false); }} className={CSS_CLASSES.button.primary}>Sair</button>
        )}
      </SideDrawer>
    </header>
  );
}
