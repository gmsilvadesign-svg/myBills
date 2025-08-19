// Importa botão personalizado para toolbar
import ToolbarButton from '../UI/ToolbarButton.tsx';

// Componente Header: exibe o cabeçalho da aplicação com título, subtítulo e botões de ação
export default function Header({ t, setEditing, exportICS, setOpenSettings }) {
  // Abre nova aba exibindo notificações ou mensagem padrão
  const openNotifications = () => {
    const list = JSON.parse(localStorage.getItem('notifications') || '[]');
    const popup = window.open('', '_blank', 'width=400,height=600');
    if (!popup) return;
    const content = list.length
      ? `<ul>${list.map((n: string) => `<li>${n}</li>`).join('')}</ul>`
      : `<p>${t.no_notifications}</p>`;
    popup.document.write(
      `<html><head><title>${t.notifications}</title></head><body>${content}</body></html>`
    );
    popup.document.close();
  };

  // JSX do componente Header
  return (
    // Container do cabeçalho, flexível e responsivo (coluna em mobile, linha em desktop)
    <header className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">

      {/* Container para título e subtítulo, ocupa todo o espaço disponível */}
      <div className="flex-1">
        {/* Título da aplicação */}
        <div className="text-2xl font-bold">{t.app_title}</div>
        {/* Subtítulo da aplicação */}
        <div className="text-slate-500">{t.subtitle}</div>
      </div>

      {/* Container dos botões de ação */}
      <div className="flex gap-2 items-center">
        {/* Botão para criar uma nova conta */}
        <ToolbarButton onClick={() => setEditing({})}>
          {t.new_bill}
        </ToolbarButton>

        {/* Botão para exportar contas em arquivo ICS */}
        <ToolbarButton onClick={exportICS}>
          {t.export_ics}
        </ToolbarButton>

        {/* Ícone de notificações */}
        <button
          onClick={openNotifications}
          title={t.notifications}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
        >
          🔔
        </button>

        {/* Botão para abrir o modal de configurações */}
        <button
          onClick={() => setOpenSettings(true)}
          title={t.settings}
          className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700"
        >
          ⚙️
        </button>
      </div>
    </header>
  );
}