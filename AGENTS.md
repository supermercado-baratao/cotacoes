# AGENTS.md

Orientações para agentes de IA (Claude Code e outros) ao trabalhar neste repositório. O `CLAUDE.md` apenas importa este arquivo.

## Sobre o projeto

Aplicação web para gerenciamento de cotações e controle de pedidos para supermercados, **em uso real**. Stack: React 19 + TypeScript + Vite + MUI + Firebase (Auth + Firestore), com React Query e Zustand.

## Comandos

```bash
pnpm dev              # iniciar servidor de desenvolvimento
pnpm build            # build de produção (tsc + vite build)
pnpm test             # executar testes unitários (Vitest) uma vez
pnpm test:watch       # executar testes Vitest em modo watch
pnpm test:e2e         # executar testes e2e (Playwright)
pnpm test:e2e:ui      # executar testes e2e no modo UI do Playwright
pnpm eslint:check     # verificar tipos (tsc) e lint
pnpm eslint:fix       # corrigir problemas de lint automaticamente
pnpm prettier:check   # verificar formatação
pnpm prettier:fix     # formatar código
pnpm generate         # gerar novo componente via plop
pnpm emulators:start  # iniciar emuladores do Firebase (Auth + Firestore), necessário apenas para pnpm test:e2e
```

Para executar um único arquivo de teste:

```bash
pnpm vitest run src/tests/vitest/margin-utils.spec.ts
pnpm playwright test src/tests/playwright/quote.spec.ts
```

## Gerenciador de pacotes

- Use apenas **pnpm** (nunca npm/yarn/npx).
- Versões de `dependencies` e `devDependencies` são fixas (sem `^`/`~`). Instale com `pnpm add -E <pkg>` (ou `pnpm add -D -E <pkg>`) — nunca edite as versões à mão.
- A regra de versão fixa não vale para servidores MCP (`.mcp.json`) nem para scripts, que podem usar `@latest` (ex: `pnpm dlx @playwright/mcp@latest`), sempre via `pnpm dlx`.
- A versão do Node fica em `.nvmrc`.

## Configuração do ambiente

Copie `.env.example` para `.env` e preencha as credenciais do Firebase:

```text
VITE_API_KEY
VITE_AUTH_DOMAIN
VITE_PROJECT_ID
VITE_STORAGE_BUCKET
VITE_MESSAGING_SENDER_ID
VITE_APP_ID
VITE_APP_MEASUREMENT_ID
```

## Arquitetura

### Estrutura de diretórios

```text
src/
├── components/          # Componentes reutilizáveis (exportados por components/index.ts)
│   ├── blocks/          # Componentes específicos do domínio (formulários de entidades, table, data-view, page-header, catalog-import...)
│   └── ui/              # Primitivos de UI genéricos, sem conhecimento de domínio (alert, autocomplete, currency-input, dialog, loader, masked-input, modal, search-input)
├── constants/           # Constantes compartilhadas (length.ts, margin.ts)
├── hooks/               # React hooks compartilhados (use-delete-handler.ts, use-form-state.ts)
├── infra/               # Infraestrutura: Firestore (database.ts), Firebase config, Gemini
├── layout/              # Shell da aplicação (AppLayout + navegação lateral)
│   ├── index.tsx        # AppLayout: sidebar + Outlet
│   ├── nav-items.ts     # Itens de navegação
│   └── style.ts
├── models/              # Modelos de domínio, um por entidade (<entidade>-model/{index,model,types}.ts)
├── pages/               # Páginas no nível de rota (cada uma com _components/ privados)
├── providers/
│   └── app-provider/    # Orquestrador da aplicação: queries (use-data-fetch), mutations (use-<entidade>-mutation) e injeção no store (use-app-handler)
├── stores/              # Estado global com Zustand (app, alert, auth, callback)
├── tests/               # Suítes Vitest e Playwright (ver Testes)
├── themes/              # Tema MUI (dark/light)
├── types/               # Tipos genéricos
├── utils/               # Funções utilitárias
└── Router.tsx           # Rotas
```

Fora de `src/`: `docs/` (documentação do projeto e da integração com o VR Software), `generators/` (templates do plop) e `scripts/` (scripts de migração executados manualmente).

### Camadas

**`src/layout/`** — shell da aplicação. `AppLayout` renderiza a sidebar e o `<Outlet>` para rotas aninhadas. Importado diretamente pelo `Router.tsx` via `@/layout`, não exportado por `@/components`. Uma nova página exige a rota em `Router.tsx` e o item em `nav-items.ts`.

**`src/hooks/`** — hooks compartilhados entre páginas. `useFormState<T>` centraliza o estado de abertura/edição/fechamento do formulário; `useDeleteHandler<T>` centraliza o estado do dialog de exclusão e chama a mutation.

**`src/constants/`** — constantes organizadas por domínio. Centralize aqui apenas restrições compartilhadas entre múltiplos schemas ou que representam convenções da aplicação (`MAX_DESCRIPTION_LENGTH`, `MAX_NUMERIC_VALUE`). Restrições técnicas específicas de domínio (ex: `MAX_BARCODE_LENGTH`) permanecem locais ao seu schema.

**`src/infra/`** — `database.ts` expõe um objeto genérico `database` (`findMany`, `create`, `update`, `deleteUniqueById`, `upsertManyWithIds`, etc.) sobre o Firestore. Todos os documentos recebem automaticamente `id`, `createdAt` e `updatedAt`. Os dados ficam por usuário: os models montam o caminho com `getUserPath(PATH)`.

**`firestore.rules`** — regras de segurança do Firestore, aplicadas pelo emulador (via `firebase.json`) e publicadas em produção com `firebase deploy --only firestore:rules`. Só o próprio usuário, com e-mail verificado, lê e escreve em `users/{uid}/...`. Como a regra lê a claim `email_verified` do ID token, renove o token (`getIdToken(true)`) sempre que o e-mail for verificado durante a sessão — `reload()` não basta.

**`src/models/`** — modelos de domínio. Cada model define as operações de negócio chamando `database` com o caminho da coleção. As funções não são marcadas com `async` — retornam diretamente a `Promise` do `database`. Parâmetros de tipo só são passados ao `database` quando o TypeScript não consegue inferi-los.

```typescript
// models/department-model/model.ts
import { database, getUserPath } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TDepartment } from './types'

const PATH = 'departments'

const create = (data: TCreateData<TDepartment>): Promise<TDepartment> =>
  database.create({ path: getUserPath(PATH), data })

const findMany = (): Promise<TDepartment[]> =>
  database.findMany({ path: getUserPath(PATH) })

const update = (data: TUpdateData<TDepartment>): Promise<TDepartment> =>
  database.update({ path: getUserPath(PATH), data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: getUserPath(PATH), id })

export const departmentModel = { create, findMany, update, deleteUniqueById }
```

**`src/providers/app-provider/`** — orquestrador central. `use-data-fetch.ts` busca os dados com React Query; cada `use-<entidade>-mutation.ts` cria as mutations (entidades de CRUD simples usam `useEntityMutation`, que já cuida de invalidação, alertas e callbacks); `use-app-handler.ts` injeta dados e mutations no store Zustand via `useEffect`. Assim qualquer componente dispara mutations pelo store, sem hooks do React Query.

**`src/stores/`** — estado global com Zustand:

- `useAppStore` — dados da aplicação e funções de mutation (`createProduct`, `updateProduct`, ...), populadas pelo `AppProvider`
- `useAlertStore` — notificações globais via snackbar/alert
- `useAuthStore` — usuário autenticado
- `useCallbackStore` — callbacks de sucesso/erro registrados por componentes antes de disparar mutations

### Fluxo de dados

```text
Component → useAppStore.createProduct() → useMutation (React Query)
                                         → onSuccess: invalidate query + alert + callbacks
                                         → onError: alert + callbacks
```

**Padrão de callbacks** (`useCallbackStore`): o componente registra o que deve acontecer após o sucesso ou a falha de uma mutation (ex: fechar o modal) sem se acoplar ao provider.

### Padrão de página

- **`pages/<entidade>/use-<entidade>-handler.ts`** — custom hook com a lógica da página: estado de UI local (formulário, item a excluir, busca), dados e mutations do `useAppStore` e handlers seguindo as convenções de nomenclatura.
- **`pages/<entidade>/_components/`** — componentes privados da página (ex: `table/`), exportados por `_components/index.ts`.
- Formulários de entidades reutilizados em mais de uma página (criação rápida no Autocomplete) ficam em `components/blocks/<entidade>-form/`.

### Padrão de formulários

1. **`schema.ts`** — schema Zod com regras de validação e constantes `MAX_*` exportadas; quando o schema espelha a entidade, use `satisfies z.ZodType<TCreateData<T>>`
2. **`use-form-handler.ts`** — defaults, validação e submissão
3. **`style.ts`** — propriedades `sx` do MUI
4. **`index.tsx`** — renderização com componentes MUI

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TProduct } from '@/models'
import { useAppStore, useCallbackStore } from '@/stores'

import { schema, type TSchema } from './schema'

export const useFormHandler = (
  product: TProduct | null,
  setFormProduct: (product: TProduct | null) => void,
  handleClose: () => void
) => {
  const { createProduct, updateProduct, families } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: product?.description ?? '',
      price: product?.price ?? null,
      familyId: product?.familyId ?? null
    }),
    [product]
  )

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm({ resolver: zodResolver(schema), defaultValues })

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onSubmit = handleSubmit((data) => {
    if (product) {
      setSuccessCallbacks([handleClose, () => setFormProduct(null)])
      updateProduct({ ...product, ...data })
      return
    }
    setSuccessCallbacks([handleClose, () => reset(defaultValues)])
    createProduct(data)
  })

  return { register, onSubmit, errors, control, families: families ?? [] }
}
```

### Estado de carregamento e vazio

Os dados começam como `null` (antes do primeiro fetch) e viram `[]` quando a lista está vazia. Derive as flags `isFetching` e `hasX` desses valores e use o `DataView`:

```tsx
const isFetching = products === null
const hasProducts = !!products?.length

<DataView isFetching={isFetching} isEmpty={!hasProducts} emptyMessage="Você ainda não tem nenhum produto...">
  <Table products={filteredProducts ?? []} handleEdit={handleFormOpen} />
</DataView>
```

### Tabela compartilhada

`components/blocks/table/` fornece um `<Table>` genérico sobre o MUI DataGrid, com colunas de ações de editar/excluir. O `_components/table/` de cada página envolve esse componente com a tipagem e as colunas (`columns.ts`) da entidade.

### Gerador de componentes

`pnpm generate` cria `src/components/<name>/index.tsx` e `style.ts` e atualiza `src/components/index.ts`. Ele cria na raiz de `components/`: mova o resultado para `blocks/` ou `ui/` e corrija o export (ver a skill `new-component`).

## Convenções

- O alias `@/` aponta para `src/`.
- Cada módulo exporta via `index.ts` na sua pasta, e o código importa pelo barrel (`@/components`, `@/models`, `@/stores`...).
- Sempre usar arrow functions.
- Estilos de componentes ficam em `style.ts`, com `SxProps<Theme>`, importados como `* as S`.
- Inputs de texto usam `textTransform: 'uppercase'` (no `style.ts`) e `onFocus={selectOnFocus}`.
- Inputs de texto têm `maxLength`, e inputs numéricos têm `min`/`max`, definidos a partir das constantes do schema.
- Constantes de caminho de coleção em models usam `SCREAMING_SNAKE_CASE` (ex: `const PATH = 'products'`).
- IDs do Firestore são validados com `z.string()`, não `z.uuid()`: o Firestore não gera UUIDs.
- Campos anuláveis têm `null` como padrão em `defaultValues` (não `0` nem `''`), para preservar a semântica do banco.
- Tipos começam com `T` (`TProduct`, `TSchema`, `TTableProps`).
- Textos da interface em português; código, nomes e commits em inglês.

### Nomenclatura

Nomes de handlers e variáveis seguem a ordem **`[Sujeito][Ação]`** — o sujeito (componente ou elemento) vem antes da ação (evento ou verbo).

**Handlers — `handle[Sujeito][Ação]`**

| Padrão                             | Exemplo                                                                          | Regra                          |
| ---------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| Elemento de UI + evento DOM        | `handleAddClick`                                                                 | Add = elemento, Click = evento |
| Modal de formulário + ação         | `handleFormOpen`, `handleFormEdit`, `handleFormClose`                            | Form = o componente modal      |
| DeleteDialog + ação                | `handleDeleteDialogOpen`, `handleDeleteDialogClose`, `handleDeleteDialogConfirm` | Usar o nome do componente      |
| Props de ação de tabela            | `handleEdit`, `handleDelete`                                                     | Curto; a ação se descreve      |
| Botão de adicionar no Autocomplete | `handleAddClick`                                                                 |                                |

**Exceção:** `onSubmit` — corresponde à prop nativa `<form onSubmit>` e não conflita com o `handleSubmit` do react-hook-form.

**Variáveis de estado**

| Padrão                  | Exemplo                                    | Regra                                         |
| ----------------------- | ------------------------------------------ | --------------------------------------------- |
| Entidade no formulário  | `formProduct`, `formSeller`                | `form[Entidade]` — contexto antes da entidade |
| Entidade sendo excluída | `productToDelete`, `sellerToDelete`        | `[entidade]ToDelete`                          |
| Estado booleano         | `isFormOpen`, `isFetching`, `hasProducts`  | `is[Sujeito][Estado]`, `has[Sujeito]`         |
| Flag de criação rápida  | `quickCreateFamily`, `quickCreateSupplier` | `quickCreate[Entidade]`                       |

**Props de componentes:** seguem a mesma regra `handle[Sujeito][Ação]`. Use `on*` apenas para eventos DOM nativos (ex: `onFocus`, `onChange`) repassados a elementos HTML.

### Comentários no código

- Comentários registram apenas **por que** uma decisão foi tomada, de preferência com uma referência (link de documentação, número de issue, bug upstream). Nunca explique o que o código faz ou como funciona.
- O padrão é não comentar. Comente só uma escolha não óbvia que alguém poderia "corrigir" por engano.
- Comentários em inglês.

### Lint e formatação

- ESLint em flat config (`eslint.config.js`): `typescript-eslint`, `react-hooks`, `react-refresh`, `simple-import-sort`, `@eslint/markdown` e `eslint-config-prettier`.
- Prettier: aspas simples, sem ponto e vírgula, sem vírgula final (`.prettierrc`).
- Indentação e espaços (2 espaços, LF) via `.editorconfig`.
- `.claude/` é ignorado pelo ESLint e pelo Prettier: as skills instaladas de terceiros não seguem o estilo do projeto.
- As saídas do Playwright (`test-results/`, `playwright-report/`, `blob-report/`, `.playwright-mcp/`) também são ignoradas pelo ESLint: o hook de `pre-commit` roda o lint no repositório inteiro.

## Testes

```text
src/tests/
├── _mocks/              # fixtures compartilhadas entre as duas suítes (xlsx/xml/txt)
├── vitest/              # suíte unitária (Vitest)
│   ├── _utils/          # helpers (ex: read-mock-file.ts, create-query-wrapper.tsx)
│   └── *.spec.ts(x)
└── playwright/          # suíte e2e (Playwright)
    ├── orchestrator.ts  # createUser / populateDatabase / clearData / verifyEmail contra o emulador real do Firebase
    └── *.spec.ts
```

O `orchestrator.ts` do Playwright reaproveita os models reais (`@/models`) e o parser de import (`getData`) em Node puro contra os emuladores — bem mais rápido que popular via UI. Isso só funciona porque `src/infra/firebase-config.ts` e `src/infra/gemini.ts` caem para `process.env` quando `import.meta.env` não existe (fora do Vite).

- **Vitest** (`src/tests/vitest/*.spec.ts(x)`) — só testes unitários, que rodam em segundos: funções puras (`evaluateMargin`, `groupInvoiceItemsForBatch`, `extractPackingInfo`...) e cenários de erro que precisam forçar uma rejeição do banco, que não dá para simular contra o emulador. Esses testam o hook (mutation do `AppProvider` ou handler da página) com `renderHook` e `vi.spyOn(<model>, '<método>').mockRejectedValueOnce(...)` — nunca renderize o `App` nem páginas inteiras. Sem rede nem emuladores.
  - Cada arquivo mocka só o que usa (`vi.spyOn` no model ou `vi.mock` local); não há mocks globais. O `vitest.setup.ts` reseta e restaura todos os mocks antes de cada teste.
  - Todos os arquivos rodam no ambiente `jsdom` (padrão do `vite.config.ts`); não declare `// @vitest-environment` por arquivo.
- **Playwright** (`src/tests/playwright/*.spec.ts`) — todos os fluxos de UI de ponta a ponta (criar → editar → excluir), em browser real, contra os emuladores do Firebase. Um arquivo por página; cada `test()` cria seu próprio usuário e semeia só os dados de que precisa (via orchestrator ou chamando os models) — testes independentes, não um roteiro sequencial. Precisa dos emuladores rodando e do `.env` preenchido.
- Teste apenas a lógica que escrevemos (cálculos, filtros, mapeamentos, parsers, regras de negócio). Não teste comportamento de bibliotecas (MUI, zod, React Query) e descarte um teste cujo custo principal é um mock necessário só para renderizar.

Os emuladores só são necessários para `pnpm test:e2e`:

```bash
pnpm emulators:start > /tmp/emulators.log 2>&1 &
```

O emulador carrega o `firestore.rules` só ao iniciar: reinicie-o depois de alterar as regras.

## Git hooks (husky)

- **`pre-commit`** — roda `lint-staged` (ESLint + Prettier nos arquivos staged).
- **`commit-msg`** — reescreve prefixos simples (`feat:`, `fix:`...) para a versão com emoji e valida com `commitlint`. Pode-se commitar com o prefixo sem emoji que o hook adiciona o emoji.
- **`pre-push`** — roda `pnpm tsc -b --noEmit && pnpm test` (Vitest, sem emuladores).

## Ferramentas de IA

- **MCPs** (`.mcp.json`): **Context7** para a documentação de bibliotecas (MUI, React Query, Firebase, Zod, Vite...); **Playwright** para abrir o app no browser e conferir uma mudança; **Firebase** (`firestore`, `auth`) para inspecionar dados. O Firebase MCP usa a conta logada no `firebase` CLI, ou seja, o projeto **de produção**: só leia dados quando o usuário pedir e nunca escreva ou exclua nada por ele.
- **Skills** (`.claude/skills/`):
  - `grill-me` — sessão de perguntas para fechar as decisões de um plano antes de criar issues.
  - `impeccable` — design, revisão e polimento de interface (`/impeccable audit`, `polish`, `critique`...). Atualize com `.claude/skills/impeccable/scripts/impeccable update`.
  - `new-component` — novo componente compartilhado em `components/blocks` ou `components/ui`.
  - `new-entity` — nova entidade de ponta a ponta (model, provider, store, página, formulário, rota e testes).
- **Subagentes** (`.claude/agents/`): `ui-reviewer` revisa componentes e páginas alterados contra as convenções deste arquivo; os `impeccable-*` são usados pela skill `impeccable`.
- `grill-me` e `grilling` são instaladas pelo CLI `skills` (`pnpm dlx skills add mattpocock/skills --skill <nome> -a claude-code`), registradas em `skills-lock.json`. A `impeccable` usa o próprio instalador e baixa seu binário (`scripts/bin/`, ignorado no git) no primeiro uso.

## Fluxo de trabalho

O fluxo completo (planejamento com `/grill-me`, issues, branches, commits, merge requests e fechamento) está em [`docs/development-workflow.md`](./docs/development-workflow.md). Siga-o para qualquer issue. As regras abaixo são obrigatórias.

### Regras de tarefa

Nunca comece uma tarefa por conta própria, mesmo quando pedido para seguir para a próxima ou em modo automático. Primeiro apresente um resumo do plano (issue, nome da branch, passos, arquivos afetados e decisões em aberto) e espere aprovação explícita antes de criar a branch, instalar dependências ou editar código. Investigação somente leitura (issues, docs, código) não precisa de aprovação.

### Regras de branch

Todo trabalho é feito em uma branch nova, nunca direto na `main`. Formato: `<prefixo>/<titulo>#<issue>` — o prefixo é o dos commits, sem emoji (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`...); o título é curto, minúsculo e separado por hífens. Exemplos: `feat/relatorio-pedidos#10`, `fix/invoice-race-condition#12`. Use aspas no shell, porque `#` é especial (ex: `git switch -c 'feat/relatorio-pedidos#10'`).

Para um esforço amplo de escopo único (ex: um code review cobrindo várias áreas), prefira uma única branch e uma única MR.

### Regras de commit

Nunca rode `git commit` por conta própria, mesmo em modo automático. Proponha a mensagem de commit apenas quando o usuário pedir e crie o commit só depois que ele aprovar essa mensagem. O mesmo vale para `git push` e para abrir a merge request.

Mensagens de commit em inglês, neste formato:

- Prefixos semânticos: `🎉 init, ✨ feat, 🐛 fix, 📚 docs, 💎 style, 📦 refactor, 🚀 perf, 🚨 test, 🛠 build, ⚙️ ci, ♻️ chore, 🗑 revert`
- Assunto no imperativo e em letras minúsculas.
- Corpo como lista.
- Referência à issue no formato `Issue: #<número>`, se existir.

```text
✨ feat: add products page

- Create products page
- Add products table
- Add products form

Issue: #1
```

### Regras de issue

Antes de fechar uma issue, marque como concluído (`- [x]`) cada item do checklist da descrição (ex: `glab issue update <número> --description "..."`). Não feche uma issue com itens desmarcados, a menos que tenham sido descartados ou movidos — e diga isso no comentário de fechamento.

### Regras de documentação

`AGENTS.md` e `README.md` registram apenas convenções do projeto: o que fazer, onde as coisas ficam e como lidar com cada caso. Respostas a perguntas pontuais do usuário (ex: "por que não usamos X?") ficam na conversa. Mantenha um "porquê" apenas quando ele evita uma "correção" equivocada provável. Se uma tarefa muda uma convenção, atualize o `AGENTS.md` na mesma branch.
