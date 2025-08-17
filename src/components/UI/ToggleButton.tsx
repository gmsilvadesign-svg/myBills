import clsx from 'clsx';

export default function ToggleButton({ items, selected, onChange }) {
  return (
    <div className="flex rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700">
      {items.map(([k,label]) => (
        <button key={k} onClick={()=>onChange(k)}
          className={clsx("px-3 py-2", selected===k
            ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300")}>
          {label}
        </button>
      ))}
    </div>
  )
}