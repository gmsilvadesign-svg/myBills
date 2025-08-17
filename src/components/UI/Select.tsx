// Select com label estilizado
export default function Select({ label, children, ...props }) {

  // JSX do select com label
  return (
    // Label engloba o texto do label e o select
    <label className="block mb-3">

      {/* Texto do label acima do select */}
      <span className="block text-sm text-slate-600 mb-1">{label}</span>

      {/* Select propriamente dito, recebe props passadas e estilização */}
      <select 
        {...props} 
        className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700"
      >
        {children}
      </select>

    </label>
  );
}