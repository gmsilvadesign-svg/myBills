# Design Tokens (Draft)

## Cores
| Token | Light | Dark | Uso |
|-------|-------|------|-----|
| `color.surface.primary` | `#ffffff` | `#0f172a` | Cards, superfícies elevadas |
| `color.surface.muted` | `#f1f5f9` | `#1e293b` | Background de seções |
| `color.accent.primary` | `#10b981` | `#34d399` | Ações positivas, renda |
| `color.accent.warning` | `#f97316` | `#fb923c` | Gastos / limites |
| `color.accent.info` | `#38bdf8` | `#38bdf8` | Economia / informações |
| `color.text.primary` | `#0f172a` | `#e2e8f0` | Texto principal |
| `color.text.muted` | `#475569` | `#94a3b8` | Labels secundários |

## Tipografia
| Token | Font | Weight | Size |
|-------|------|--------|------|
| `font.family.base` | "Inter", sans-serif | - | - |
| `font.size.xs` | - | - | 12px |
| `font.size.sm` | - | - | 14px |
| `font.size.md` | - | - | 16px |
| `font.size.lg` | - | - | 18px |
| `font.weight.bold` | - | 700 | - |
| `font.weight.semibold` | - | 600 | - |

## Espaçamentos e radius
| Token | Valor | Uso |
|-------|-------|-----|
| `space.xs` | 4px | Gaps pequenos |
| `space.sm` | 8px | Espaçamento em inputs/cards |
| `space.md` | 16px | Padding padrão de cards |
| `space.lg` | 24px | Seções dentro do dashboard |
| `radius.sm` | 8px | Inputs, botões |
| `radius.lg` | 20px | Cards principais / modais |

## Integração prevista
1. Atualizar `tailwind.config.ts` para refletir tokens acima.
2. Substituir cores hard-coded nos componentes (`TotalsStrip`, `PieChart`, `LineChart`, `LegacyDashboard`).
3. Criar util `@/styles/tokens.ts` exportando os valores para componentes sem Tailwind.
4. Documentar o uso de classes utilitárias e tokens no onboarding de novas features.

> Esta versão é preliminar. A consolidação ocorrerá durante a refatoração do dashboard (Etapas 1-4) e i18n/moedas (Etapa 9).
