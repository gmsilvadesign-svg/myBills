# Etapa 1 � Arquitetura e Design

## 1. Invent�rio da Arquitetura Atual

### 1.1 Fluxo macro da aplica��o
- `src/app/App.tsx`: orquestra splash/login/books landing e monta `LegacyDashboard` sob os providers (`Notification`, `Translation`, `Auth`, `Preview`).
- Contextos atuais:
  - `AuthContext` (`AuthProvider`, `useAuth`): abstrai Firebase Auth e modo local; exp�e estado `user`, `loading`, m�todos de login e logout.
  - `NotificationContext`: controla fila de toasts; depende de `useNotification`/`useNotifications`.
  - `TranslationContext`: define idioma (`prefs.language`) e fornece `t` via `useI18n` (`src/constants/translation.ts`).
  - `PreviewContext`: emula viewports (browser/mobile/tablet) para pr�-visualiza��o.
- Fluxo de dados predominante: `useBooks` (sele��o de book) ? hooks Firebase (`useFirebaseBills`, `useFirebaseIncomes`, `useFirebasePurchases`) ? `LegacyDashboard` renderiza listas, calend�rios e gr�ficos.

### 1.2 Hooks e servi�os
- **Hooks Firebase** (`src/hooks/useFirebase*.ts`): executam opera��es CRUD em Firestore/localDb, mas repetem l�gica de normaliza��o e usam v�rios `any`.
- **Hooks de agrega��o**:
  - `useTotals` e `useFilteredBills` cuidam de filtros b�sicos.
  - `useBillNotifications` calcula contas a vencer mas depende fortemente de estruturas de dados locais.
  - N�o existe um hook �nico para proje��es mensais/semanal ou metas; c�lculos aparecem duplicados em `LegacyDashboard` e `TotalsStrip`.
- **Persist�ncia local** (`src/utils/localDb.ts`, `AuthContext`, `usePrefs`): cada m�dulo manipula `localStorage` diretamente sem uma camada comum.

### 1.3 Componentes principais
- **Onboarding** (`components/UI/auth/*`): Splash, Login, BooksLanding; dependem de `AuthContext` e `useBooks`.
- **Dashboard** (`LegacyDashboard.tsx` ~700 linhas): concentra filtros, tabs, calend�rio, cards, modais. A composi��o atual mistura l�gica de dados, formata��o e UI.
- **Gr�ficos**: `LineChart`, `PieChart`, `RadialProgress`; estiliza��o inline, sem esquema de tema unificado.
- **Modais**: `SettingsModal`, `PurchasesModal`, `IncomesModal`, `Modal` gen�rico; cada um mant�m estado pr�prio em `LegacyDashboard`.

### 1.4 Estrutura de estilos
- Mistura de Tailwind utility classes, CSS globais (`styles/index.css`, `styles/App.css`) e classes personalizadas (`CSS_CLASSES` em `styles/constants.ts`).
- N�o h� tokens de design/documenta��o unificada; varia��es de cores/spacing s�o repetidas manualmente.

## 2. Pontos de Atrito Identificados

| �rea | Refer�ncia | Observa��o |
|------|------------|------------|
| Hooks condicionais | `LegacyDashboard.tsx:179-195` | `usePreview` chamado ap�s m�ltiplos `return`; quebra regras de hooks e impede lint estrito. |
| C�digo morto | `LegacyDashboard.tsx:23,72,85,93,99` | Imports/vari�veis (`PurchasesView`, `loadingIncomes`, `totals`, `expiringBills`) n�o usados. Atrasa refatora��es porque disfar�a depend�ncias reais. |
| Duplicidade de c�lculos | `LegacyDashboard.tsx:540-673` & `TotalsStrip.tsx:150-188` | Agrega��es de renda/gastos/metas e uso de `occurrencesForBillInMonth` replicados; mudan�a em uma regra exige alterar duas ou mais partes. |
| `require` din�mico | `LegacyDashboard.tsx:333-334` | Importa utilit�rio via `require` dentro de JSX; impede tree-shaking, complica testes e causa lint errors. |
| Interna�cionaliza��o inconsistente | `LegacyDashboard.tsx:495-524` | Strings fixas PT-BR no modal de metas, fora do dicion�rio `t`. |
| `PieChart` API extensa | `PieChart.tsx:19-205` | Props novos (`hoverCenterText`, `onHoverChange`) nem sempre utilizados; sem documenta��o ? risco de uso incorreto. |
| `usePrefs` sanitiza��o | `usePrefs.ts:16-73` | Usa `as any`, somente n�meros positivos, sem union segura; metas ficam ocultas por aus�ncia de UI. |
| Lint geral | `npm run lint` | 50+ erros (hooks, `any`, imports). Sem limpeza, dif�cil detectar regress�es na Etapa 2+. |
| Estilos dispersos | Diversos | Tailwind + CSS + `CSS_CLASSES` sem guia; dificulta padronizar componentes novos. |

## 3. Recomenda��es de Formata��o e Reestrutura��o

1. **Restringir hooks e efeitos**
   - Mover `usePreview` (e outros hooks globais) para o topo de `LegacyDashboard` e extrair early returns para helpers.
   - Revisar demais componentes para garantir que hooks sigam ordem est�vel.

2. **Criar camada de m�tricas compartilhadas**
   - Introduzir hooks como `useMonthlyMetrics(bookId)` e `useGoalSummaries(prefs, bills, incomes, purchases)`.
   - Substituir c�lculos duplicados em `TotalsStrip`, `LegacyDashboard`, `GoalsModal` e futuros relat�rios.

3. **Modularizar o dashboard**
   - Dividir `LegacyDashboard` em:
     - `DashboardHeader` (books, filtros, metas CTA)
     - `DashboardCards` (TotalsStrip + metas)
     - `DashboardCharts` (hist�ricos e proje��es) 
     - `DashboardModals` (settings, metas, compras, rendas).
   - Viabiliza testes unit�rios e lazy loading por se��o.

4. **Design System leve**
   - Definir tokens (cores, espa�amentos, radius) num arquivo central (`styles/tokens.ts` ou Tailwind config).
   - Alinhar componentes (`PieChart`, `RadialProgress`, bot�es) aos tokens para preparar temas claro/escuro e multi-moeda.

5. **Governan�a de strings e formatos**
   - Centralizar textos em `translation.ts`, inclusive metas e tooltips.
   - Criar helper `formatCurrency(locale, currency)` e `formatPercent(locale)` reutilizado em TotalsStrip, gr�ficos, relat�rios.

6. **Persist�ncia e camadas de dados**
   - Encapsular acesso a `localStorage` (`prefs`, `auth`, `books`) em `src/services/storage.ts` para facilitar migra��o a IndexedDB/secure storage.
   - Criar servi�o de metas (`src/services/goals.ts`) que orquestra leitura/grava��o e notifica o resto da UI.

7. **Testes e pipeline**
   - Adotar `eslint --max-warnings=0` e `prettier --check` em pre-commit.
   - Escrever testes para os novos hooks de m�tricas e metas (Vitest) antes das Etapas 5/8.

## 4. Prepara��o para Etapas Futuras

| Etapa do roadmap | Depend�ncias t�cnicas recomendadas |
|------------------|------------------------------------|
| **Etapa 2 � Autentica��o & Onboarding** | Ap�s modularizar hooks, separar AppShell e Providers em arquivos menores; garantir que `AuthContext` exporte tipos e handlers isolados para testes. |
| **Etapa 3 � Books & Home** | Com Dashboard fatiado, ser� mais simples introduzir cards novos (`Metas`, `Notifica��es`). Tamb�m preparar custom hook `useBooksList` para suportar ordena��o/renomea��o incremental. |
| **Etapa 4 � Dashboards** | Reutilizar `useMonthlyMetrics` para gr�ficos; migrar componentes para design system. |
| **Etapa 5 � Metas & Estat�sticas** | Servidor/local service de metas pronto, GoalsModal conectado ao Settings; notifica��es baseadas em thresholds (usar `useGoalSummaries`). |
| **Etapa 6 � Calend�rio & Contas** | Com hooks de m�tricas centralizados, reescrever l�gica de recorr�ncia sem quebrar os gr�ficos. |
| **Etapa 8 � Relat�rio PDF** | Utilizar camada de m�tricas e helpers de formata��o j� consolidados; extrair `ReportBuilder` compartilhado. |
| **Etapa 9 � i18n & Moedas** | Com tokens/theme e helpers centralizados, basta ampliar dicion�rio e expor `prefs.currency` via context. |

## 5. Checklist inicial de a��es (Etapa 1)
1. **Limpeza de base**: remover c�digo morto, corrigir `usePreview`, eliminar `require` din�mico, mover strings fixas para `translation.ts`.
2. **Novos hooks utilit�rios**: `useMonthlyMetrics`, `useGoalSummaries`, `usePreferencesStorage` (isolar `localStorage`).
3. **Estrutura de componentes**: criar diret�rio `src/app/dashboard/` com subcomponentes e migrar gradualmente.
4. **Guia de estilos**: documentar tokens em `docs/design-tokens.md` (ou ampliar este documento) e adicionar refer�ncias no Tailwind config.
5. **Pipeline**: configurar scripts `lint:strict`, `format:check` e atualizar `package.json` + CI (quando dispon�vel).

## 6. Documenta��o e pr�ximos artefatos
- `docs/architecture-stage1.md` (este arquivo) resume o invent�rio e diretrizes.
- Pr�ximos documentos sugeridos:
  - `docs/dashboard-refactor.md`: plano detalhado da modulariza��o do dashboard.
  - `docs/data-metrics.md`: contratos dos hooks de m�tricas/metas/relat�rios.
  - `docs/design-tokens.md`: cat�logo de cores, tipografia, spacing.

Com essa base organizada, as etapas subsequentes (metas, dashboards, calend�rio, relat�rios) passam a compartilhar l�gica e padr�es, reduzindo retrabalho e facilitando a evolu��o do sistema sem quebrar funcionalidades existentes.
