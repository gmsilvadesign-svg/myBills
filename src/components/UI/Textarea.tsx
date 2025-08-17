// Textarea com label estilizado
export default function Textarea({ label, ...props }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm text-slate-600 mb-1">{label}</span>
      <textarea {...props} className="w-full rounded-xl border border-slate-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-slate-900 dark:border-slate-700" />
    </label>
  );
}