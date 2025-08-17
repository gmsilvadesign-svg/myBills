// Select com label estilizado
export default function Select({ label, children, ...props }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm text-slate-600 mb-1">{label}</span>
      <select {...props} className="w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700">{children}</select>
    </label>
  );
}