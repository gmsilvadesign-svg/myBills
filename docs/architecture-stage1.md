# Etapa 1 – Arquitetura e Design

## 1. Inventário da Arquitetura Atual

### 1.1 Fluxo macro da aplicação
- `src/app/App.tsx`: orquestra splash/login/books landing e monta `LegacyDashboard` sob os providers (`Notification`, `Translation`, `Auth`, `Preview`).
- Contextos atuais:
  - `AuthContext` (`AuthProvider`, `useAuth`): abstrai Firebase Auth e modo local; expõe estado `user`, `loading`, métodos de login e logout.
  - `NotificationContext`: controla fila de toasts; depende de `useNotification`/`useNotifications`.
  - `TranslationContext`: define idioma (`prefs.language`) e fornece `t` via `useI18n` (`src/constants/translation.ts`).
  - `PreviewContext`: emula viewports (browser/mobile/tablet) para pré-visualização.
- Fluxo de dados predominante: `useBooks` (seleção de book) ? hooks Firebase (`useFirebaseBills`, `useFirebaseIncomes`, `useFirebasePurchases`) ? `LegacyDashboard` renderiza listas, calendários e gráficos.

### 1.2 Hooks e serviços
- **Hooks Firebase** (`src/hooks/useFirebase*.ts`): executam operações CRUD em Firestore/localDb, mas repetem lógica de normalização e usam vários `any`.
- **Hooks de agregação**:
  - `useTotals` e `useFilteredBills` cuidam de filtros básicos.
  - `useBillNotifications` calcula contas a vencer mas depende fortemente de estruturas de dados locais.
  - Não existe um hook único para projeções mensais/semanal ou metas; cálculos aparecem duplicados em `LegacyDashboard` e `TotalsStrip`.
- **Persistência local** (`src/utils/localDb.ts`, `AuthContext`, `usePrefs`): cada módulo manipula `localStorage` diretamente sem uma camada comum.

### 1.3 Componentes principais
- **Onboarding** (`components/UI/auth/*`): Splash, Login, BooksLanding; dependem de `AuthContext` e `useBooks`.
- **Dashboard** (`LegacyDashboard.tsx` ~700 linhas): concentra filtros, tabs, calendário, cards, modais. A composição atual mistura lógica de dados, formatação e UI.
- **Gráficos**: `LineChart`, `PieChart`, `RadialProgress`; estilização inline, sem esquema de tema unificado.
- **Modais**: `SettingsModal`, `PurchasesModal`, `IncomesModal`, `Modal` genérico; cada um mantém estado próprio em `LegacyDashboard`.

### 1.4 Estrutura de estilos
- Mistura de Tailwind utility classes, CSS globais (`styles/index.css`, `styles/App.css`) e classes personalizadas (`CSS_CLASSES` em `styles/constants.ts`).
- Não há tokens de design/documentação unificada; variações de cores/spacing são repetidas manualmente.

## 2. Pontos de Atrito Identificados

| Área | Referência | Observação |
|------|------------|------------|
| Hooks condicionais | `LegacyDashboard.tsx:179-195` | `usePreview` chamado após múltiplos `return`; quebra regras de hooks e impede lint estrito. |
| Código morto | `LegacyDashboard.tsx:23,72,85,93,99` | Imports/variáveis (`PurchasesView`, `loadingIncomes`, `totals`, `expiringBills`) não usados. Atrasa refatorações porque disfarça dependências reais. |
| Duplicidade de cálculos | `LegacyDashboard.tsx:540-673` & `TotalsStrip.tsx:150-188` | Agregações de renda/gastos/metas e uso de `occurrencesForBillInMonth` replicados; mudança em uma regra exige alterar duas ou mais partes. |
| `require` dinâmico | `LegacyDashboard.tsx:333-334` | Importa utilitário via `require` dentro de JSX; impede tree-shaking, complica testes e causa lint errors. |
| Interna­cionalização inconsistente | `LegacyDashboard.tsx:495-524` | Strings fixas PT-BR no modal de metas, fora do dicionário `t`. |
| `PieChart` API extensa | `PieChart.tsx:19-205` | Props novos (`hoverCenterText`, `onHoverChange`) nem sempre utilizados; sem documentação ? risco de uso incorreto. |
| `usePrefs` sanitização | `usePrefs.ts:16-73` | Usa `as any`, somente números positivos, sem union segura; metas ficam ocultas por ausência de UI. |
| Lint geral | `npm run lint` | 50+ erros (hooks, `any`, imports). Sem limpeza, difícil detectar regressões na Etapa 2+. |
| Estilos dispersos | Diversos | Tailwind + CSS + `CSS_CLASSES` sem guia; dificulta padronizar componentes novos. |

## 3. Recomendações de Formatação e Reestruturação

1. **Restringir hooks e efeitos**
   - Mover `usePreview` (e outros hooks globais) para o topo de `LegacyDashboard` e extrair early returns para helpers.
   - Revisar demais componentes para garantir que hooks sigam ordem estável.

2. **Criar camada de métricas compartilhadas**
   - Introduzir hooks como `useMonthlyMetrics(bookId)` e `useGoalSummaries(prefs, bills, incomes, purchases)`.
   - Substituir cálculos duplicados em `TotalsStrip`, `LegacyDashboard`, `GoalsModal` e futuros relatórios.

3. **Modularizar o dashboard**
   - Dividir `LegacyDashboard` em:
     - `DashboardHeader` (books, filtros, metas CTA)
     - `DashboardCards` (TotalsStrip + metas)
     - `DashboardCharts` (históricos e projeções) 
     - `DashboardModals` (settings, metas, compras, rendas).
   - Viabiliza testes unitários e lazy loading por seção.

4. **Design System leve**
   - Definir tokens (cores, espaçamentos, radius) num arquivo central (`styles/tokens.ts` ou Tailwind config).
   - Alinhar componentes (`PieChart`, `RadialProgress`, botões) aos tokens para preparar temas claro/escuro e multi-moeda.

5. **Governança de strings e formatos**
   - Centralizar textos em `translation.ts`, inclusive metas e tooltips.
   - Criar helper `formatCurrency(locale, currency)` e `formatPercent(locale)` reutilizado em TotalsStrip, gráficos, relatórios.

6. **Persistência e camadas de dados**
   - Encapsular acesso a `localStorage` (`prefs`, `auth`, `books`) em `src/services/storage.ts` para facilitar migração a IndexedDB/secure storage.
   - Criar serviço de metas (`src/services/goals.ts`) que orquestra leitura/gravação e notifica o resto da UI.

7. **Testes e pipeline**
   - Adotar `eslint --max-warnings=0` e `prettier --check` em pre-commit.
   - Escrever testes para os novos hooks de métricas e metas (Vitest) antes das Etapas 5/8.

## 4. Preparação para Etapas Futuras

| Etapa do roadmap | Dependências técnicas recomendadas |
|------------------|------------------------------------|
| **Etapa 2 – Autenticação & Onboarding** | Após modularizar hooks, separar AppShell e Providers em arquivos menores; garantir que `AuthContext` exporte tipos e handlers isolados para testes. |
| **Etapa 3 – Books & Home** | Com Dashboard fatiado, será mais simples introduzir cards novos (`Metas`, `Notificações`). Também preparar custom hook `useBooksList` para suportar ordenação/renomeação incremental. |
| **Etapa 4 – Dashboards** | Reutilizar `useMonthlyMetrics` para gráficos; migrar componentes para design system. |
| **Etapa 5 – Metas & Estatísticas** | Servidor/local service de metas pronto, GoalsModal conectado ao Settings; notificações baseadas em thresholds (usar `useGoalSummaries`). |
| **Etapa 6 – Calendário & Contas** | Com hooks de métricas centralizados, reescrever lógica de recorrência sem quebrar os gráficos. |
| **Etapa 8 – Relatório PDF** | Utilizar camada de métricas e helpers de formatação já consolidados; extrair `ReportBuilder` compartilhado. |
| **Etapa 9 – i18n & Moedas** | Com tokens/theme e helpers centralizados, basta ampliar dicionário e expor `prefs.currency` via context. |

## 5. Checklist inicial de ações (Etapa 1)
1. **Limpeza de base**: remover código morto, corrigir `usePreview`, eliminar `require` dinâmico, mover strings fixas para `translation.ts`.
2. **Novos hooks utilitários**: `useMonthlyMetrics`, `useGoalSummaries`, `usePreferencesStorage` (isolar `localStorage`).
3. **Estrutura de componentes**: criar diretório `src/app/dashboard/` com subcomponentes e migrar gradualmente.
4. **Guia de estilos**: documentar tokens em `docs/design-tokens.md` (ou ampliar este documento) e adicionar referências no Tailwind config.
5. **Pipeline**: configurar scripts `lint:strict`, `format:check` e atualizar `package.json` + CI (quando disponível).

## 6. Documentação e próximos artefatos
- `docs/architecture-stage1.md` (este arquivo) resume o inventário e diretrizes.
- Próximos documentos sugeridos:
  - `docs/dashboard-refactor.md`: plano detalhado da modularização do dashboard.
  - `docs/data-metrics.md`: contratos dos hooks de métricas/metas/relatórios.
  - `docs/design-tokens.md`: catálogo de cores, tipografia, spacing.

Com essa base organizada, as etapas subsequentes (metas, dashboards, calendário, relatórios) passam a compartilhar lógica e padrões, reduzindo retrabalho e facilitando a evolução do sistema sem quebrar funcionalidades existentes.
