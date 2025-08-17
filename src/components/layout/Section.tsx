// Componente de seção com título e conteúdo estilizado
export default function Section({ title, children }) {
  return (
    <div className="mb-6">
      <div className="text-sm uppercase tracking-wide text-slate-500 mb-2">{title}</div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-4">{children}</div>
    </div>
  );
}