// Categorias padrão recomendadas para contas a pagar
// Organizadas em fixas (recorrentes mensais) e variáveis/avulsas

export interface Category {
  id: string;
  name: string;
  emoji: string;
  type: 'fixed' | 'variable';
}

export const DEFAULT_CATEGORIES: Category[] = [
  // Fixas (recorrentes mensais)
  { id: 'moradia', name: 'Moradia', emoji: '🏠', type: 'fixed' },
  { id: 'contas-domesticas', name: 'Contas domésticas', emoji: '⚡', type: 'fixed' },
  { id: 'transporte', name: 'Transporte', emoji: '🚗', type: 'fixed' },
  { id: 'alimentacao', name: 'Alimentação', emoji: '🍽️', type: 'fixed' },
  { id: 'educacao', name: 'Educação', emoji: '🎓', type: 'fixed' },
  { id: 'saude', name: 'Saúde', emoji: '🩺', type: 'fixed' },
  { id: 'financeiro', name: 'Financeiro', emoji: '💳', type: 'fixed' },
  { id: 'lazer', name: 'Lazer', emoji: '🎉', type: 'fixed' },
  { id: 'pessoais', name: 'Pessoais', emoji: '👕', type: 'fixed' },
  
  // Variáveis / Avulsas
  { id: 'trabalho-negocios', name: 'Trabalho/Negócios', emoji: '💼', type: 'variable' },
  { id: 'compras-gerais', name: 'Compras gerais', emoji: '📦', type: 'variable' },
  { id: 'impostos-taxas', name: 'Impostos e taxas', emoji: '📑', type: 'variable' },
];

// Função para obter categorias por tipo
export const getCategoriesByType = (type: 'fixed' | 'variable') => {
  return DEFAULT_CATEGORIES.filter(category => category.type === type);
};

// Função para obter todas as categorias formatadas para select
export const getCategoriesForSelect = () => {
  return DEFAULT_CATEGORIES.map(category => ({
    value: category.name,
    label: `${category.emoji} ${category.name}`,
    type: category.type
  }));
};