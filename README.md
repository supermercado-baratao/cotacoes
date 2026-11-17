# Cotações

Aplicação web para gerenciamento de cotações e controle de pedidos de compra em supermercados, em uso real.

- **Dashboard** — indicadores e alertas de margem dos produtos.
- **Cotações** — cotação de listas de itens entre fornecedores e registro dos pedidos de compra.
- **Notas de Entrada** — importação de NF-e (XML) e relação dos itens com os produtos.
- **Reajustes de Preços** — importação dos reajustes exportados do VR Software e avaliação da margem contra o custo.
- **Cadastros** — produtos, fornecedores, vendedores, famílias e departamentos, com importação do catálogo exportado do VR Software.

## Stack

React 19, TypeScript, Vite, MUI, Firebase (Auth + Firestore), React Query, Zustand, Zod e React Hook Form. Testes com Vitest e Playwright.

## Setup local

Pré-requisitos:

- **Node** na versão do `.nvmrc` (`nvm use`).
- **pnpm** na versão do campo `packageManager` do `package.json` (`corepack enable`). Use apenas pnpm.
- **Java**, para os emuladores do Firebase. A Firebase CLI vem nas dependências do projeto.

```bash
pnpm install
pnpm exec playwright install chromium   # browser do Playwright, só para os testes e2e
pnpm dev
```

Fora de produção, o app se conecta aos emuladores do Firebase (Auth e Firestore), e não ao projeto real. O `pnpm dev` sobe os emuladores em segundo plano e os mantém rodando, com os dados, até o `pnpm services:down`. As variáveis locais ficam no `.env.development`, versionado e sem segredos.

## Comandos

| Comando               | O que faz                                                 |
| --------------------- | --------------------------------------------------------- |
| `pnpm dev`            | Emuladores do Firebase e servidor de desenvolvimento      |
| `pnpm build`          | Build de produção                                         |
| `pnpm services:up`    | Sobe os emuladores do Firebase (Auth + Firestore)         |
| `pnpm services:down`  | Para os emuladores                                        |
| `pnpm test`           | Testes unitários (Vitest)                                 |
| `pnpm test:e2e`       | Testes e2e (Playwright), subindo os emuladores se preciso |
| `pnpm type-check`     | Verificação de tipos                                      |
| `pnpm eslint:check`   | Lint (`pnpm eslint:fix` para corrigir)                    |
| `pnpm prettier:check` | Formatação (`pnpm prettier:fix` para corrigir)            |
| `pnpm generate`       | Gera um novo componente (plop)                            |

Os git hooks repetem essas verificações: o `pre-push` roda o type-check e os testes e2e.

## Documentação

- [`AGENTS.md`](./AGENTS.md) — arquitetura, convenções de código, testes, git hooks e CI.
- [`docs/development-workflow.md`](./docs/development-workflow.md) — fluxo de issues, branches, commits e pull requests.
- [`docs/contexto-integracao-vr.md`](./docs/contexto-integracao-vr.md) — integração com o VR Software (ERP do supermercado), com [`query-sql.md`](./docs/query-sql.md), [`tabelas-vr.md`](./docs/tabelas-vr.md) e [`relacao-de-produtos-e-notas.md`](./docs/relacao-de-produtos-e-notas.md).
