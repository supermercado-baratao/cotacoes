# Cotações

Aplicação web para gerenciamento de cotações e controle de pedidos de compra do Supermercado Baratão, em uso real.

- **Dashboard** — indicadores e alertas de margem dos produtos.
- **Cotações** — cotação de listas de itens entre fornecedores e registro dos pedidos de compra.
- **Notas de Entrada** — importação de NF-e (XML) e relação dos itens com os produtos e os pedidos.
- **Reajustes de Preços** — importação dos reajustes exportados do VR Software e avaliação da margem contra o custo.
- **Cadastros** — produtos, fornecedores, vendedores, famílias e departamentos, com importação do catálogo exportado do VR Software.

React 19, TypeScript, Vite, MUI, Firebase (Auth + Firestore), React Query, Zustand, Zod e React Hook Form, com testes em Vitest e Playwright.

## Como rodar

Pré-requisitos:

- **Node** na versão do `.nvmrc` (`nvm use`).
- **pnpm** na versão do campo `packageManager` do `package.json` (`corepack enable`). Use apenas o pnpm.
- **Java**, para os emuladores do Firebase. A CLI do Firebase vem nas dependências do projeto.

```bash
pnpm install
pnpm exec playwright install chromium   # browser do Playwright, só para os testes e2e
pnpm db:seed                            # opcional: cria um usuário com dados de exemplo
pnpm dev                                # http://localhost:5173
```

Fora de produção, o app se conecta aos emuladores do Firebase (Auth e Firestore), nunca ao projeto real. O `pnpm dev` sobe os emuladores em segundo plano e os mantém rodando, com os dados, até o `pnpm services:down`. As variáveis locais ficam no `.env.development`, versionado e sem segredos, e as sugestões de IA vêm de uma busca local no lugar do Gemini.

O `pnpm db:seed` cria um usuário com e-mail verificado e grava as credenciais em `seed-credentials.json`. O roteiro para conferir cada funcionalidade à mão está em [`docs/local-testing.md`](./docs/local-testing.md).

## Scripts

| Script                                      | O que faz                                                        |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                                  | Sobe os emuladores do Firebase e o servidor de desenvolvimento   |
| `pnpm build`                                | Gera o build de produção                                         |
| `pnpm preview`                              | Serve o build de produção localmente                             |
| `pnpm services:up` / `pnpm services:down`   | Sobe (em segundo plano) ou para os emuladores (Auth + Firestore) |
| `pnpm db:seed`                              | Cria um usuário verificado com dados de exemplo nos emuladores   |
| `pnpm test` / `pnpm test:watch`             | Roda os testes unitários (Vitest)                                |
| `pnpm test:e2e` / `pnpm test:e2e:ui`        | Reinicia os emuladores e roda os testes e2e (Playwright)         |
| `pnpm type-check`                           | Verifica os tipos                                                |
| `pnpm eslint:check` / `pnpm eslint:fix`     | Roda o ESLint (e corrige o que der)                              |
| `pnpm prettier:check` / `pnpm prettier:fix` | Confere (e reescreve) a formatação                               |
| `pnpm spell:check`                          | Confere a ortografia, em inglês e português (cspell)             |
| `pnpm generate`                             | Gera um novo componente compartilhado (plop)                     |

## Produção

O app é um site estático hospedado no **Netlify**, ligado ao repositório do GitHub: cada merge na `main` vai para produção, e cada pull request ganha um deploy preview. O `netlify.toml` define o build (`pnpm build`, publicando o `dist`) e redireciona todas as rotas para o `index.html`.

As regras do Firestore (`firestore.rules`) não passam pelo Netlify: depois de alterá-las, publique com `pnpm exec firebase deploy --only firestore:rules`.

### Variáveis de ambiente

O build de produção não lê o `.env.development`: as variáveis ficam nas configurações do site no Netlify (Site configuration → Environment variables). Elas entram no bundle público, então nenhuma delas é um segredo do servidor. Quem protege os dados é o `firestore.rules`.

| Variável                   | De onde vem                                                          |
| -------------------------- | -------------------------------------------------------------------- |
| `VITE_API_KEY`             | Configuração do app web no console do Firebase (`apiKey`)            |
| `VITE_AUTH_DOMAIN`         | Configuração do app web no console do Firebase (`authDomain`)        |
| `VITE_PROJECT_ID`          | Configuração do app web no console do Firebase (`projectId`)         |
| `VITE_STORAGE_BUCKET`      | Configuração do app web no console do Firebase (`storageBucket`)     |
| `VITE_MESSAGING_SENDER_ID` | Configuração do app web no console do Firebase (`messagingSenderId`) |
| `VITE_APP_ID`              | Configuração do app web no console do Firebase (`appId`)             |
| `VITE_APP_MEASUREMENT_ID`  | Configuração do app web no console do Firebase (`measurementId`)     |
| `VITE_GEMINI_MODEL`        | Modelo do Gemini usado nas sugestões de referência das cotações      |
| `VITE_GEMINI_API_KEY`      | Chave da API do Gemini, gerada no Google AI Studio                   |

Para usar essas variáveis localmente (por exemplo, num script de `scripts/`), crie um `.env.production.local`, ignorado pelo git.

## Convenções do projeto

As convenções completas estão no [`AGENTS.md`](./AGENTS.md), e o fluxo do planejamento ao merge está em [`docs/development-workflow.md`](./docs/development-workflow.md). Os destaques estão abaixo.

### Idioma

- Issues, template de issue, este README e tudo que o usuário vê (interface, alertas e mensagens de erro) ficam em português.
- Código, comentários, descrições de testes, commits, branches, pull requests, `AGENTS.md`, `docs/` e `.claude/` ficam em inglês. Os documentos do VR Software em `docs/` seguem o schema do VR e não são traduzidos.

### Arquitetura

- As camadas só importam das que estão abaixo delas: `pages`, `layout` → `components`, `hooks` → `providers` → `stores` → `models` → `infra`. O ESLint garante essa direção.
- Os `models/` montam as operações de cada entidade sobre o objeto genérico `database` (`src/infra/database.ts`), com os dados de cada usuário em `users/{uid}/...`.
- O `AppProvider` busca os dados com React Query e injeta os dados e as mutations no store do Zustand, de onde qualquer componente dispara uma mutation.
- Componentes compartilhados ficam em `src/components/blocks` (de domínio) e `src/components/ui` (genéricos). Os componentes de uma única página ficam no `_components/` dela.

### Testes

- Os testes unitários (Vitest) ficam ao lado do código que testam e não usam rede nem emuladores.
- Os testes end-to-end (Playwright) ficam em `src/tests/e2e` e rodam em paralelo contra os emuladores, cada teste com o próprio usuário.
- Só testamos a lógica que escrevemos, não o comportamento de bibliotecas.

### Git hooks e CI

- **Hooks do Husky:**
  - `pre-commit` roda o `lint-staged` (ESLint, Prettier, cspell e os testes unitários relacionados aos arquivos staged).
  - `commit-msg` adiciona o emoji do prefixo e roda o `commitlint`.
  - `pre-push` roda o type-check e os testes e2e.
- **Commits** em inglês, no imperativo e em minúsculas, com prefixo semântico, por exemplo `✨ feat: add products page`. Basta digitar `feat: ...`, já que o hook adiciona o emoji.
- **Branches:** cada issue vai para uma branch nova chamada `<scope>/<title>#<issue>`, por exemplo `feat/orders-report#10`. Nenhum commit vai direto para a `main`.
- **Issues** são criadas pelo template **Task** (`.github/ISSUE_TEMPLATE/task.md`). Marque cada item concluído antes de fechar a issue.
- **GitHub Actions** (`.github/workflows/ci.yml`) roda em todo pull request: commitlint, type-check, ESLint, Prettier, cspell e os testes unitários e e2e. A `main` só aceita o merge com os checks verdes.

### Assistente de IA

- `AGENTS.md` (importado pelo `CLAUDE.md`) documenta as convenções para agentes de código.
- `.mcp.json` configura os servidores MCP `context7` (documentação de bibliotecas), `playwright` (abrir o app no browser) e `firebase` (consultar dados; usa o projeto de produção, então só para leitura).
- `.claude/` tem as skills `new-component` e `new-entity`, que criam componentes compartilhados e entidades completas, `review-copy`, que revisa nomes, comentários, descrições de testes, textos da interface e documentação, `grill-me`, para fechar as decisões de um plano, e `impeccable`, para design de interface. Tem também o subagente `ui-reviewer`, que revisa semântica, acessibilidade e convenções da interface, e um `settings.json` que pede confirmação antes de todo `git commit`, `git push` e `gh pr create`.

#### Chave da API do Context7

O `.mcp.json` lê a chave da variável de ambiente `CONTEXT7_API_KEY` (`"Authorization": "Bearer ${CONTEXT7_API_KEY}"`), então ela nunca vai para o repositório. O Claude Code expande a variável ao iniciar.

1. Gere uma chave no painel do [Context7](https://context7.com).
2. Defina a variável de uma destas formas:
   - **No shell (todos os projetos):** exporte-a no perfil do shell. No fish, rode `set -Ux CONTEXT7_API_KEY <sua-chave>`. No bash ou zsh, adicione `export CONTEXT7_API_KEY=<sua-chave>` ao `~/.bashrc` ou `~/.zshrc`.
   - **Só neste projeto:** adicione-a ao `.claude/settings.local.json`, que é ignorado pelo git:

     ```json
     {
       "env": {
         "CONTEXT7_API_KEY": "<sua-chave>"
       }
     }
     ```

3. Reinicie o Claude Code e rode `/mcp` para conferir se o `context7` está conectado.

Nunca coloque a chave no `.mcp.json` nem no `.claude/settings.json`, já que os dois vão para o repositório.

## Documentação

- [`AGENTS.md`](./AGENTS.md) — arquitetura, convenções de código, testes, git hooks, CI e deploy.
- [`docs/development-workflow.md`](./docs/development-workflow.md) — fluxo de issues, branches, commits e pull requests.
- [`docs/local-testing.md`](./docs/local-testing.md) — roteiro de teste manual contra os emuladores.
- [`docs/contexto-integracao-vr.md`](./docs/contexto-integracao-vr.md) — integração com o VR Software (ERP do supermercado), com [`query-sql.md`](./docs/query-sql.md), [`tabelas-vr.md`](./docs/tabelas-vr.md) e [`relacao-de-produtos-e-notas.md`](./docs/relacao-de-produtos-e-notas.md).

## Licença

[MIT](./LICENSE)
