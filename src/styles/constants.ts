// Constantes de estilos CSS para padronização
export const CSS_CLASSES = {
  // Containers e layouts
  container: {
    main: 'min-h-screen justify-center p-8 flex overflow-x-auto',
    modal: 'fixed inset-0 bg-black/40 flex items-center justify-center z-50',
    card: 'bg-white dark:bg-[#AABBCC]/20 rounded-2xl shadow-lg border border-slate-200 dark:border-[#AABBCC]/40 p-4 overflow-hidden backdrop-blur-sm',
    section: 'mb-6'
  },

  // Flexbox layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    col: 'flex flex-col',
    row: 'flex flex-row',
    wrap: 'flex flex-wrap',
    responsive: 'flex flex-col sm:flex-row',
    gap2: 'gap-2',
    gap3: 'gap-3',
    gap4: 'gap-4'
  },

  // Textos
  text: {
    primary: 'text-slate-900 dark:text-slate-50',
    secondary: 'text-slate-600 dark:text-slate-300',
    muted: 'text-slate-500 dark:text-slate-400',
    label: 'text-sm text-slate-600 dark:text-slate-300',
    error: 'text-sm text-red-600 dark:text-red-400',
    title: 'text-lg font-semibold text-slate-900 dark:text-slate-50',
    subtitle: 'text-sm sm:text-base text-slate-500 dark:text-slate-400'
  },

  // Backgrounds
  bg: {
    primary: 'bg-white dark:bg-[#AABBCC]/10',
    secondary: 'bg-slate-50 dark:bg-[#AABBCC]/15',
    muted: 'bg-slate-100 dark:bg-[#AABBCC]/20',
    hover: 'hover:bg-slate-50 dark:hover:bg-[#AABBCC]/25 transition-colors duration-200'
  },

  // Borders
  border: {
    default: 'border border-slate-300 dark:border-[#AABBCC]/40',
    bottom: 'border-b border-slate-100 dark:border-[#AABBCC]/35',
    divider: 'border-b border-slate-200 dark:border-[#AABBCC]/40'
  },

  // Botões
  button: {
    primary: 'px-4 py-2 rounded-xl bg-blue-600 text-white dark:bg-[#AABBCC] dark:text-white hover:bg-blue-700 dark:hover:bg-[#AABBCC]/80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#AABBCC]/10 transition-all duration-200 min-w-[80px] text-center shadow-sm hover:shadow-md',
    secondary: 'px-4 py-2 rounded-xl bg-slate-200 dark:bg-[#AABBCC]/20 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-[#AABBCC]/30 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#AABBCC]/10 transition-all duration-200 min-w-[80px] text-center border border-slate-300 dark:border-[#AABBCC]/30',
    ghost: 'px-3 py-1 rounded-xl bg-transparent hover:bg-slate-100 dark:hover:bg-[#AABBCC]/15 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-[#AABBCC]/10 transition-all duration-200'
  },

  // Inputs
  input: {
    base: 'w-full px-3 py-2 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200',
    default: 'border-slate-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-[#AABBCC]/10 dark:border-[#AABBCC]/30 dark:text-slate-50 dark:focus:border-[#AABBCC] dark:focus:ring-[#AABBCC] backdrop-blur-sm',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400 dark:focus:ring-red-400 dark:focus:border-red-400'
  },

  // Espaçamentos comuns
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
    mt6: 'mt-6'
  },

  // Transições
  transition: {
    default: 'transition-colors duration-200',
    all: 'transition-all duration-200',
    transform: 'transition-all duration-200 hover:scale-105'
  }
};

// Função helper para combinar classes
export const cn = (...classes: (string | undefined | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};