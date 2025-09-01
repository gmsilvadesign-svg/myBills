import { useEffect, useState } from 'react';
import { resetFirebaseData, checkFirebaseStatus } from '@/utils/resetFirebase';
import { checkFirebaseHealth, checkFirebaseConfig } from '@/utils/firebaseHealth';
import { useNotification } from '@/hooks/useNotification';
import { seedAutoData, clearAutoData, hasAutoData } from '@/utils/autoData';
import Modal from '@/components/UI/modals/Modal';
import { CSS_CLASSES, cn } from '@/styles/constants';
import Switch from '@/components/UI/Switch';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const [isResetting, setIsResetting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const { showNotification } = useNotification();

  // Estado do preenchimento automático
  const [isSeeding, setIsSeeding] = useState(false);
  const [isClearingAuto, setIsClearingAuto] = useState(false);
  // Inicia liberado (false). Se já houver dados automáticos, atualiza após checagem, sem travar a UI.
  const [autoEnabled, setAutoEnabled] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressPhase, setProgressPhase] = useState<string>('');

  const handleResetFirebase = async () => {
    if (!confirm('ATENÇÃO: Esta ação irá DELETAR TODOS os dados do Firebase. Esta ação é IRREVERSÍVEL. Tem certeza?')) return;
    if (!confirm('ÚLTIMA CONFIRMAÇÃO: Todos os dados serão perdidos permanentemente. Continuar?')) return;

    setIsResetting(true);
    try {
      await resetFirebaseData();
      showNotification('Firebase resetado com sucesso! Todos os dados foram removidos.', 'success', 8000);
    } catch (error) {
      console.error('Erro ao resetar Firebase:', error);
      showNotification('Erro ao resetar Firebase. Verifique o console para mais detalhes.', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    try {
      await checkFirebaseStatus();
      showNotification('Status do Firebase verificado. Verifique o console para detalhes.', 'info');
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      showNotification('Erro ao verificar status do Firebase.', 'error');
    } finally {
      setIsChecking(false);
    }
  };

  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    try {
      checkFirebaseConfig();
      const healthy = await checkFirebaseHealth();
      if (healthy) showNotification('Firebase está funcionando corretamente!', 'success');
      else showNotification('Problemas detectados no Firebase. Verifique o console.', 'error');
    } catch (error) {
      console.error('Erro ao verificar saúde:', error);
      showNotification('Erro ao verificar saúde do Firebase.', 'error');
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSeedAuto = async () => {
    setIsSeeding(true);
    setProgress(0);
    setProgressPhase('Preenchendo');
    try {
      const { batchId, totalDocs } = await seedAutoData(12, (p, phase) => {
        setProgress(Math.round(p * 100));
        if (phase) setProgressPhase(phase);
        if (p >= 1) {
          setIsSeeding(false);
          setAutoEnabled(true);
        }
      });
      showNotification(`Dados automáticos gerados (lote ${batchId}) • ${totalDocs} documentos.`, 'success');
      setAutoEnabled(true);
      setProgress(100);
      setProgressPhase('Concluído');
    } catch (e) {
      console.error(e);
      showNotification('Erro ao gerar dados automáticos.', 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAuto = async () => {
    setIsClearingAuto(true);
    setProgress(0);
    setProgressPhase('Limpando');
    try {
      await clearAutoData((p, phase) => {
        setProgress(Math.round(p * 100));
        if (phase) setProgressPhase(phase);
        if (p >= 1) {
          setIsClearingAuto(false);
          setAutoEnabled(false);
        }
      });
      showNotification('Dados automáticos removidos.', 'success');
      setAutoEnabled(false);
      setProgress(100);
      setProgressPhase('Concluído');
    } catch (e) {
      console.error(e);
      showNotification('Erro ao remover dados automáticos.', 'error');
    } finally {
      setIsClearingAuto(false);
    }
  };

  // Estado inicial do switch ao abrir o painel
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const exists = await hasAutoData();
        if (mounted) setAutoEnabled(exists);
      } catch {
        if (mounted) setAutoEnabled(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🛠️ Painel de Administração">
      <div className={cn(CSS_CLASSES.flex.col, 'gap-6')}>
        <div className={cn(CSS_CLASSES.container.card, 'p-4 border-yellow-200 bg-yellow-50')}>
          <h3 className={cn(CSS_CLASSES.text.subtitle, 'text-yellow-800 mb-2')}>⚠️ Zona de Perigo</h3>
          <p className={cn(CSS_CLASSES.text.muted, 'text-yellow-700 mb-4')}>
            As ações abaixo podem afetar permanentemente os dados da aplicação.
          </p>
        </div>

        <div className={cn(CSS_CLASSES.flex.col, 'gap-4')}>
          <div className={cn(CSS_CLASSES.container.card, 'p-4')}>
            <h4 className={cn(CSS_CLASSES.text.subtitle, 'mb-2')}>⚙️ Dados automáticos (12 meses)</h4>
            <p className={cn(CSS_CLASSES.text.muted, 'mb-3')}>
              Ativar preenchimento: quando ligado, gera 12 meses com contas recorrentes, rendas e compras realistas. Quando desligado, limpa os dados automáticos.
            </p>
            <div className="flex items-center gap-3 w-full">
              <Switch
                checked={autoEnabled}
                onChange={(v) => v ? handleSeedAuto() : handleClearAuto()}
                disabled={isSeeding || isClearingAuto}
                label={autoEnabled ? 'Ativar preenchimento (ligado)' : 'Ativar preenchimento'}
                ariaLabel="Ativar preenchimento automático"
              />
              {(isSeeding || isClearingAuto) && (
                <div className="flex items-center gap-3 grow">
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-40 sm:w-56 overflow-hidden">
                    <div
                      className="h-2 bg-blue-600 transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className={cn(CSS_CLASSES.text.muted)}>{progressPhase} {progress}%</span>
                </div>
              )}
              {!isSeeding && !isClearingAuto && progressPhase === 'Concluído' && (
                <span className="text-green-600 dark:text-green-400">Concluído</span>
              )}
            </div>
          </div>

          <div className={cn(CSS_CLASSES.container.card, 'p-4')}>
            <h4 className={cn(CSS_CLASSES.text.subtitle, 'mb-2')}>🧪 Diagnósticos</h4>
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
                  {isCheckingHealth ? 'Verificando…' : 'Verificar Saúde'}
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
                  {isChecking ? 'Verificando…' : 'Verificar Status'}
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
              {isResetting ? 'Resetando…' : 'Reset Firebase'}
            </button>
          </div>
        </div>

        <div className={cn(CSS_CLASSES.flex.row, 'justify-end gap-3 pt-4 border-t')}>
          <button onClick={onClose} className={CSS_CLASSES.button.secondary}>Fechar</button>
        </div>
      </div>
    </Modal>
  );
};

export default AdminPanel;
