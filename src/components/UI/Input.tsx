// Input com label estilizado
export default function Input({ label, ...props }) {

  // JSX do input com label
  return (
    // Label engloba o texto do label e o input
    <label className="block mb-3">

      {/* Texto do label acima do input */}
      <span className="block text-sm text-slate-600 mb-1">{label}</span>

      {/* Input propriamente dito, recebe props passadas e estilização */}
      <input 
        {...props} 
        className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700" 
      />
    </label>
  );
}