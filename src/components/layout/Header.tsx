// React
import { useCallback, useState } from 'react';

// Components
import SideDrawer from '@/components/UI/SideDrawer';

// Modals
import NotificationsModal from '@/components/UI/modals/NotificationsModal';
import AdminPanel from '@/components/UI/modals/AdminPanel';
import Modal from '@/components/UI/modals/Modal';

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
  const [openAdd, setOpenAdd] = useState(false);
  const { user, signInWithGoogle, signOutApp } = useAuth();

  const handleOpenNotifications = useCallback(() => setOpenNotifications(true), []);
  const handleNewBill = useCallback(() => setEditing({}), [setEditing]);
  const handleNewIncome = useCallback(() => setEditingIncome && setEditingIncome({}), [setEditingIncome]);
  const handleOpenSettings = useCallback(() => setOpenSettings(true), [setOpenSettings]);
  const handleOpenAdminPanel = useCallback(() => setOpenAdminPanel(true), []);
  const handleNewPurchase = useCallback(() => setEditingPurchase && setEditingPurchase({}), [setEditingPurchase]);

  return (
    <header className={cn(CSS_CLASSES.flex.responsive, 'relative', 'md:items-center', CSS_CLASSES.flex.gap4, 'md:gap-6', CSS_CLASSES.spacing.mb6)}>
      <div className="flex-1">
        <div className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-none tracking-tight brand-konta bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-700 select-none">
          Konta
        </div>
      </div>

      {/* Removido: ações no header para evitar botão lateral indesejado */}

      {/* Grupo flutuante: botão "+" e hambúrguer */}
      <div className="absolute right-0 top-0 md:static md:ml-auto flex items-center gap-2">
        {/* Botão + */}
        <button
          onClick={() => setOpenAdd(true)}
          aria-label="Adicionar"
          className="w-10 h-10 rounded-2xl bg-emerald-500 dark:bg-emerald-400 text-white font-bold flex items-center justify-center shadow-sm hover:shadow-md hover:bg-emerald-600 dark:hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        >
          +
        </button>
        {/* Botão lateral (hamburger) */}
        <button
          onClick={() => setOpenMore(true)}
          aria-label="Mais opcoes"
          className="px-3 py-3 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 hover:from-slate-100 hover:to-slate-200 text-slate-700 dark:from-slate-800 dark:to-slate-700 dark:text-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
        >
          <span aria-hidden="true">≡</span>
        </button>
      </div>

      {/* Modal de notificações */}
      <NotificationsModal open={openNotifications} onClose={() => setOpenNotifications(false)} t={t} />

      {/* Admin Panel */}
      <AdminPanel isOpen={openAdminPanel} onClose={() => setOpenAdminPanel(false)} />

      {/* Menu lateral com as outras ações */}
      <SideDrawer open={openMore} onClose={() => setOpenMore(false)} title="Mais opcoes">
        {/* Ações criativas adicionadas ao menu lateral para manter acessíveis */}
        <button onClick={() => { handleNewBill(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.new_bill}</button>
        {setEditingPurchase && (
          <button onClick={() => { handleNewPurchase(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.new_purchase || '+ Compra'}</button>
        )}
        {setEditingIncome && (
          <button onClick={() => { handleNewIncome(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.new_income || '+ Fonte de Renda'}</button>
        )}
        <button onClick={() => { exportICS(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.export_ics}</button>
        <button onClick={() => { handleOpenNotifications(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.notifications}</button>
        <button onClick={() => { handleOpenSettings(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>{t.settings}</button>
        <button onClick={() => { handleOpenAdminPanel(); setOpenMore(false); }} className={CSS_CLASSES.button.secondary}>Painel de Administracao</button>
        {!user ? (
          <button onClick={() => { signInWithGoogle(); setOpenMore(false); }} className={CSS_CLASSES.button.primary}>Entrar</button>
        ) : (
          <button onClick={() => { signOutApp(); setOpenMore(false); }} className={CSS_CLASSES.button.primary}>Sair</button>
        )}
      </SideDrawer>

      {/* Modal de ações de adição */}
      <Modal isOpen={openAdd} onClose={() => setOpenAdd(false)} title="Adicionar">
        <div className="flex flex-col gap-3">
          <button
            onClick={() => { handleNewBill(); setOpenAdd(false); }}
            className={CSS_CLASSES.button.secondary}
          >
            Adicionar Conta
          </button>
          {setEditingPurchase && (
            <button
              onClick={() => { handleNewPurchase(); setOpenAdd(false); }}
              className={CSS_CLASSES.button.secondary}
            >
              Adicionar Compra
            </button>
          )}
          {setEditingIncome && (
            <button
              onClick={() => { handleNewIncome(); setOpenAdd(false); }}
              className={CSS_CLASSES.button.secondary}
            >
              Adicionar Renda
            </button>
          )}
        </div>
      </Modal>
    </header>
  );
}
