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
  'bg-indigo-200 text-indigo-800',
  'bg-sky-200 text-sky-800',
  'bg-fuchsia-200 text-fuchsia-800',
  'bg-emerald-200 text-emerald-800',
  'bg-teal-200 text-teal-800',
  'bg-orange-200 text-orange-800',
  'bg-rose-200 text-rose-800',
  'bg-purple-200 text-purple-800',
  'bg-amber-200 text-amber-800',
  'bg-lime-200 text-lime-800',
  'bg-pink-200 text-pink-800',
  'bg-cyan-200 text-cyan-800',
  'bg-blue-200 text-blue-800',
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
