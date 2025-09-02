// Mapeamento de cores fixas por categoria para uso no calendário
// Ajuste a ordem e as classes conforme a paleta desejada na sua UI.

// Ordem fixa utilizada para atribuir cores previsíveis
export const CATEGORY_COLOR_ORDER = [
  'Fixas',
  'Variáveis',
  'Anual',
  'Mercado',
  'Transporte',
  'Restaurante',
  'Saúde',
  'Lazer',
  'Vestuário',
  'Educação',
  'Presentes',
  'Viagem',
  'Eletrônicos',
];

// Classes Tailwind para cada posição (claro/dark)
const ORDERED_CLASSES = [
  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-200',
  'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-200',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
  'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-200',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
  'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-200',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-200',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-200',
  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200',
];

const FALLBACK_CLASSES = ORDERED_CLASSES; // reutiliza a mesma paleta

// Retorna classes de cor para a categoria informada, usando a sequência fixa
export function categoryClass(category?: string): string {
  if (!category) return ORDERED_CLASSES[0];
  const idx = CATEGORY_COLOR_ORDER.indexOf(category);
  if (idx >= 0 && idx < ORDERED_CLASSES.length) return ORDERED_CLASSES[idx];
  // Fallback determinístico baseado em hash da string
  let h = 0;
  for (let i = 0; i < category.length; i++) {
    h = ((h << 5) - h) + category.charCodeAt(i);
    h |= 0; // 32-bit
  }
  const pos = Math.abs(h) % FALLBACK_CLASSES.length;
  return FALLBACK_CLASSES[pos];
}

