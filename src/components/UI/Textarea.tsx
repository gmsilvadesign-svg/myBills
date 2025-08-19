// Textarea com label estilizado
export default function Textarea({ label, ...props }) {

  // JSX do textarea com label
  return (
    // Label engloba o texto do label e o textarea
    <label className="block mb-3">

      {/* Texto do label acima do textarea */}
      <span className="block text-sm text-slate-600 mb-1">{label}</span>

      {/* Textarea propriamente dito, recebe props passadas e estilização */}
      <textarea 
        {...props} 
        className="w-full rounded-xl border border-slate-300 px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />

    </label>
  );
}