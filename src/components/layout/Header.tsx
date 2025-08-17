import ToolbarButton from '../UI/ToolbarButton.tsx';

export default function Header({ t, setEditing, exportICS, setOpenSettings }) {
  return (
    <header className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-6">
      <div className="flex-1">
        <div className="text-2xl font-bold">{t.app_title}</div>
        <div className="text-slate-500">{t.subtitle}</div>
      </div>
      <div className="flex gap-2 items-center">
        <ToolbarButton onClick={() => setEditing({})}>{t.new_bill}</ToolbarButton>
        <ToolbarButton onClick={exportICS}>{t.export_ics}</ToolbarButton>
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