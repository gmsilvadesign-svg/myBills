# Dashboard Refactor Roadmap

## Objetivos
- Reduzir o tamanho de `LegacyDashboard.tsx` e separar responsabilidades.
- Padronizar o consumo de métricas/metas via hooks utilitários (`useMonthlyMetrics`, `useGoalSummaries`).
- Preparar terreno para features futuras (Metas CRUD, relatórios, i18n) sem regressões.

## Componentes-alvo
| Novo componente | Responsabilidade | Dependências |
|-----------------|------------------|--------------|
| `DashboardHeader` | Seleção de book, ações rápidas, CTA de metas/relatórios | `Header`, hooks de books/metas |
| `DashboardCards` | Cards de totais + metas (usa `TotalsStrip`, `GoalSummaryCard`) | `useMonthlyMetrics`, `useGoalSummaries` |
| `DashboardCharts` | Linha histórica, projeção semanal, pizza de gastos/rendas | `useMonthlyMetrics`, componentes de chart |
| `DashboardModals` | Orquestra `SettingsModal`, `GoalsModal`, `PurchasesModal`, `IncomesModal` | Modal registry/Priority queue |
| `DashboardTabs` | Controle de view (`list`, `purchases`, `incomes`, `calendar`) e filtros | `useFilteredBills`, `useDashboardView` |

## Passos Sugeridos
1. **Isolar hooks utilitários**
   - Adotar `useMonthlyMetrics`/`useGoalSummaries` no código existente.
   - Extrair helpers de filtro/ordenção para `useDashboardView` (ainda a criar).
2. **Criar camada de apresentação**
   - Introduzir `DashboardHeader`, `DashboardCards` e mover JSX da área hero.
   - Incorporar `GoalSummaryCard` reutilizando `RadialProgress`/`PieChart`.
3. **Modais e estado compartilhado**
   - Criar `useDashboardModals` para consolidar flags (`openSettings`, `openGoals`, etc.).
   - Substituir estados locais no dashboard pelo hook/Contexto.
4. **Tabs e listas**
   - Extrair `DashboardTabs` (Select + Tabs) e simplificar `BillsList` props.
5. **Charts**
   - Mover `LineChart`/`PieChart` instâncias para `DashboardCharts` e conectar com hooks.
6. **Limpeza final**
   - Remover código morto, alinhar tipagem, adicionar testes de snapshot/smoke.

## Considerações de Testes
- Criar Mocks de dados (`tests/fixtures/dashboard.ts`).
- Smoke tests com `@testing-library/react` para as sub-seções (`DashboardCards`, `DashboardCharts`).
- Hooks utilitários com Vitest (validação de cálculos de metas/projeções).

## Dependências futuras
- **Metas CRUD (Etapa 5)**: `GoalsModal` já conectado ao hook, apenas expor formulários.
- **Relatórios PDF (Etapa 8)**: Reutilizar `useMonthlyMetrics` e `useGoalSummaries` para montar data layer do relatório.
- **I18n/Moedas (Etapa 9)**: Todas as strings tocar design tokens/dicionários, evitando literais.
