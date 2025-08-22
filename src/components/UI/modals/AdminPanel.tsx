import { useState } from 'react';
import { resetFirebaseData, checkFirebaseStatus } from '../../../utils/resetFirebase';
import { checkFirebaseHealth, checkFirebaseConfig } from '../../../utils/firebaseHealth';
import { useNotification } from '../../../hooks/useNotification';
import Modal from './Modal';
import { CSS_CLASSES, cn } from '../../../styles/constants';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const { showNotification } = useNotification();

  const handleResetFirebase = async () => {
    if (!confirm('⚠️ ATENÇÃO: Esta ação irá DELETAR TODOS os dados do Firebase. Esta ação é IRREVERSÍVEL. Tem certeza?')) {
      return;
    }

    if (!confirm('🚨 ÚLTIMA CONFIRMAÇÃO: Todos os dados serão perdidos permanentemente. Continuar?')) {
      return;
    }

    setIsResetting(true);
    try {
      await resetFirebaseData();
      showNotification('✅ Firebase resetado com sucesso! Todos os dados foram removidos.', 'success', 8000);
    } catch (error) {
      console.error('Erro ao resetar Firebase:', error);
      showNotification('❌ Erro ao resetar Firebase. Verifique o console para mais detalhes.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await checkFirebaseStatus();
      showNotification('📊 Status do Firebase verificado. Verifique o console para detalhes.', 'info');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      showNotification('❌ Erro ao verificar status do Firebase.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    try {
      checkFirebaseConfig();
      const isHealthy = await checkFirebaseHealth();
      if (isHealthy) {
        showNotification('✅ Firebase está funcionando corretamente!', 'success');
      } else {
        showNotification('⚠️ Problemas detectados no Firebase. Verifique o console.', 'error');
      }
    } catch (error) {
      console.error('Erro ao verificar saúde:', error);
      showNotification('❌ Erro ao verificar saúde do Firebase.', 'error');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔧 Painel de Administração">
      <div className={cn(CSS_CLASSES.flex.col, 'gap-6')}>
        <div className={cn(CSS_CLASSES.container.card, 'p-4 border-yellow-200 bg-yellow-50')}>
          <h3 className={cn(CSS_CLASSES.text.subtitle, 'text-yellow-800 mb-2')}>⚠️ Zona de Perigo</h3>
          <p className={cn(CSS_CLASSES.text.muted, 'text-yellow-700 mb-4')}>
            As ações abaixo podem afetar permanentemente os dados da aplicação.
          </p>
        </div>

        <div className={cn(CSS_CLASSES.flex.col, 'gap-4')}>
          <div className={cn(CSS_CLASSES.container.card, 'p-4')}>
            <h4 className={cn(CSS_CLASSES.text.subtitle, 'mb-2')}>🔍 Diagnósticos</h4>
            <div className={cn(CSS_CLASSES.flex.col, 'gap-3')}>
              <div>
                <p className={cn(CSS_CLASSES.text.muted, 'mb-2')}>
                  Verifica a conectividade e configurações do Firebase.
                </p>
                <button
                  onClick={handleCheckHealth}
                  disabled={isCheckingHealth}
                  className={cn(
                    CSS_CLASSES.button.primary,
                    isCheckingHealth && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isCheckingHealth ? '🔄 Verificando...' : '🔍 Verificar Saúde'}
                </button>
              </div>
              
              <div>
                <p className={cn(CSS_CLASSES.text.muted, 'mb-2')}>
                  Verifica quantos documentos existem no Firebase.
                </p>
                <button
                  onClick={handleCheckStatus}
                  disabled={isChecking}
                  className={cn(
                    CSS_CLASSES.button.secondary,
                    isChecking && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isChecking ? '🔄 Verificando...' : '📊 Verificar Status'}
                </button>
              </div>
            </div>
          </div>

          <div className={cn(CSS_CLASSES.container.card, 'p-4 border-red-200')}>
            <h4 className={cn(CSS_CLASSES.text.subtitle, 'mb-2 text-red-700')}>🗑️ Reset Completo</h4>
            <p className={cn(CSS_CLASSES.text.muted, 'mb-3 text-red-600')}>
              <strong>ATENÇÃO:</strong> Remove TODOS os dados do Firebase. Esta ação é irreversível!
            </p>
            <button
              onClick={handleResetFirebase}
              disabled={isResetting}
              className={cn(
                'px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed font-medium'
              )}
            >
              {isResetting ? '🔄 Resetando...' : '🗑️ Reset Firebase'}
            </button>
          </div>
        </div>

        <div className={cn(CSS_CLASSES.flex.row, 'justify-end gap-3 pt-4 border-t')}>
          <button
            onClick={onClose}
            className={CSS_CLASSES.button.secondary}
          >
            Fechar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminPanel;