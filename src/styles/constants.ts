// CSS utility constants centralised to keep the palette consistent across the app
export const CSS_CLASSES = {
  container: {
    main: 'min-h-screen justify-center p-8 flex overflow-x-auto zoom-500:p-4',
    modal: 'fixed inset-0 bg-black/35 flex items-center justify-center z-50',
    card: 'bg-white/95 rounded-2xl shadow-xl border border-slate-200/70 p-4 zoom-500:p-2 overflow-hidden backdrop-blur-md',
    section: 'mb-6 zoom-500:mb-3',
  },

  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    col: 'flex flex-col',
    row: 'flex flex-row',
    wrap: 'flex flex-wrap',
    responsive: 'flex flex-col sm:flex-row',
    gap2: 'gap-2',
    gap3: 'gap-3',
    gap4: 'gap-4',
  },

  text: {
    primary: 'text-slate-900',
    secondary: 'text-slate-600',
    muted: 'text-slate-600/90',
    label: 'text-sm text-slate-600',
    error: 'text-sm text-red-600',
    title: 'text-lg font-semibold text-slate-900',
    subtitle: 'text-sm sm:text-base text-slate-600/90',
  },

  bg: {
    primary: 'bg-white/95',
    secondary: 'bg-slate-50/90',
    muted: 'bg-slate-100',
    hover: 'hover:bg-slate-100 transition-colors duration-200',
  },

  border: {
    default: 'border border-slate-200/80',
    bottom: 'border-b border-slate-200/70',
    divider: 'border-b border-slate-200/70',
  },

  button: {
    primary: 'px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200 min-w-[80px] text-center shadow-sm hover:shadow-md',
    secondary: 'px-4 py-2 rounded-xl bg-slate-200 text-slate-700 hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200 min-w-[80px] text-center border border-slate-300 shadow-sm',
    ghost: 'px-3 py-1 rounded-xl bg-transparent hover:bg-slate-100 text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 transition-all duration-200',
  },

  input: {
    base: 'w-full px-3 py-2 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 transition-all duration-200',
    default: 'border-slate-300 bg-white text-slate-900 focus:border-blue-400',
    error: 'border-red-500 focus:ring-red-400 focus:border-red-500',
  },

  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
    mb2: 'mb-2',
    mb3: 'mb-3',
    mb4: 'mb-4',
    mb6: 'mb-6',
    mt1: 'mt-1',
    mt4: 'mt-4',
    mt6: 'mt-6',
  },

  transition: {
    default: 'transition-colors duration-200',
    all: 'transition-all duration-200',
    transform: 'transition-all duration-200 hover:scale-105',
  },
};

export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};
