# Dashboard Refactor Roadmap

## Objetivos
- Reduzir o tamanho de `LegacyDashboard.tsx` e separar responsabilidades.
- Padronizar o consumo de m�tricas/metas via hooks utilit�rios (`useMonthlyMetrics`, `useGoalSummaries`).
- Preparar terreno para features futuras (Metas CRUD, relat�rios, i18n) sem regress�es.

## Componentes-alvo
| Novo componente | Responsabilidade | Depend�ncias |
|-----------------|------------------|--------------|
| `DashboardHeader` | Sele��o de book, a��es r�pidas, CTA de metas/relat�rios | `Header`, hooks de books/metas |
| `DashboardCards` | Cards de totais + metas (usa `TotalsStrip`, `GoalSummaryCard`) | `useMonthlyMetrics`, `useGoalSummaries` |
| `DashboardCharts` | Linha hist�rica, proje��o semanal, pizza de gastos/rendas | `useMonthlyMetrics`, componentes de chart |
| `DashboardModals` | Orquestra `SettingsModal`, `GoalsModal`, `PurchasesModal`, `IncomesModal` | Modal registry/Priority queue |
| `DashboardTabs` | Controle de view (`list`, `purchases`, `incomes`, `calendar`) e filtros | `useFilteredBills`, `useDashboardView` |

## Passos Sugeridos
1. **Isolar hooks utilit�rios**
   - Adotar `useMonthlyMetrics`/`useGoalSummaries` no c�digo existente.
   - Extrair helpers de filtro/orden��o para `useDashboardView` (ainda a criar).
2. **Criar camada de apresenta��o**
   - Introduzir `DashboardHeader`, `DashboardCards` e mover JSX da �rea hero.
   - Incorporar `GoalSummaryCard` reutilizando `RadialProgress`/`PieChart`.
3. **Modais e estado compartilhado**
   - Criar `useDashboardModals` para consolidar flags (`openSettings`, `openGoals`, etc.).
   - Substituir estados locais no dashboard pelo hook/Contexto.
4. **Tabs e listas**
   - Extrair `DashboardTabs` (Select + Tabs) e simplificar `BillsList` props.
5. **Charts**
   - Mover `LineChart`/`PieChart` inst�ncias para `DashboardCharts` e conectar com hooks.
6. **Limpeza final**
   - Remover c�digo morto, alinhar tipagem, adicionar testes de snapshot/smoke.

## Considera��es de Testes
- Criar Mocks de dados (`tests/fixtures/dashboard.ts`).
- Smoke tests com `@testing-library/react` para as sub-se��es (`DashboardCards`, `DashboardCharts`).
- Hooks utilit�rios com Vitest (valida��o de c�lculos de metas/proje��es).

## Depend�ncias futuras
- **Metas CRUD (Etapa 5)**: `GoalsModal` j� conectado ao hook, apenas expor formul�rios.
- **Relat�rios PDF (Etapa 8)**: Reutilizar `useMonthlyMetrics` e `useGoalSummaries` para montar data layer do relat�rio.
- **I18n/Moedas (Etapa 9)**: Todas as strings tocar design tokens/dicion�rios, evitando literais.
