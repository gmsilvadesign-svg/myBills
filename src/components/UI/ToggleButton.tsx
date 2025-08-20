export default function ToggleButton({ items, selected, onChange }) {
  return (
    <div className="flex rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700">
      {items.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          className={`px-3 py-2 transition-colors duration-200 ${
            selected === k
              ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
              : "bg-white text-slate-900 dark:bg-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}