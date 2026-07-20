# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Sobre o projeto

Aplicação web para gerenciamento de cotações e controle de pedidos para supermercados. Stack: React 19 + TypeScript + Vite + MUI + Firebase Firestore.

## Comandos

```bash
pnpm dev              # iniciar servidor de desenvolvimento
pnpm build            # build de produção (tsc + vite build)
pnpm test             # executar testes unitários/integração (Vitest) uma vez
pnpm test:watch       # executar testes Vitest em modo watch
pnpm test:e2e         # executar testes e2e (Playwright)
pnpm eslint:check     # verificar lint
pnpm eslint:fix       # corrigir problemas de lint automaticamente
pnpm prettier:fix     # formatar código
pnpm generate         # gerar novo componente via plop
pnpm emulators:start  # iniciar emuladores do Firebase (Auth + Firestore), necessário apenas para pnpm test:e2e
```

Para executar um único arquivo de teste:

```bash
pnpm vitest run src/tests/vitest/quote-flow.spec.tsx
```

### Estratégia de testes

```text
src/tests/
├── vitest/              # suíte mockada (Vitest)
│   ├── _mocks/          # fakes de database.ts, firebase/auth, firebase/firestore + fixtures (xlsx/xml/txt)
│   ├── _utils/          # helpers (ex: read-mock-file.ts)
│   ├── orchestrator.ts  # createUser / populateDatabase / clearData contra o fake in-memory
│   └── *.spec.tsx
└── playwright/          # suíte e2e (Playwright)
    ├── orchestrator.ts  # createUser / clearData / verifyEmail contra o emulador real do Firebase
    └── *.spec.ts
```

Cada suíte tem seu próprio `orchestrator.ts` com funções globais (criar usuário, popular e limpar dados) — mesma interface nos dois, mas implementação diferente por baixo (fake in-memory vs emulador real), já que tecnicamente não dá pra compartilhar uma única implementação entre os dois ambientes.

O projeto usa duas suítes com responsabilidades distintas:

- **Vitest** (`src/tests/vitest/*.spec.tsx`) — testes rápidos e determinísticos, sem depender de rede ou emuladores. `src/infra/database.ts` e o SDK `firebase/auth`/`firebase/firestore` são mockados (ver `_mocks/`) com um fake in-memory que persiste dados entre chamadas dentro do mesmo arquivo de teste, permitindo fluxos completos de UI (criar → editar → excluir) sem I/O real. Cada arquivo de teste é um roteiro sequencial (estado acumulado entre `test()`s via `beforeAll`), cobrindo tanto o caminho de sucesso quanto cenários de erro (ex: `databaseMock.create.mockRejectedValueOnce(...)`). Não precisa dos emuladores rodando.
- **Playwright** (`src/tests/playwright/*.spec.ts`) — poucos cenários de ponta a ponta, em browser real, contra os emuladores reais do Firebase (cadastro de conta, verificação de e-mail, import de xlsx, import de notas, criação de cotação e vínculo de pedidos). Precisa dos emuladores rodando e do `.env` preenchido. Roda separado do `pnpm test`/hook `pre-push` (mais lento), tipicamente manual ou em CI.

O hook `pre-push` roda `pnpm test` (Vitest), que **não** precisa dos emuladores. Só inicie-os quando for rodar `pnpm test:e2e`:

```bash
pnpm emulators:start > /tmp/emulators.log 2>&1 &
```

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
├── components/          # Componentes reutilizáveis
│   ├── blocks/          # Componentes reutilizáveis específicos do projeto
│   │   ├── data-view/   # Wrapper para estados de carregamento/vazio/conteúdo
│   │   ├── family-form/ # Formulários de entidades compartilhados
│   │   ├── group-form/
│   │   ├── page-header/ # Título da página + busca + botão de criação
│   │   ├── seller-form/
│   │   ├── supplier-form/
│   │   └── table/       # Tabela base com ações de editar/excluir
│   └── ui/              # Primitivos de UI genéricos (sem conhecimento de domínio)
│       ├── alert/
│       ├── autocomplete/
│       ├── currency-input/
│       ├── dialog/
│       ├── loader/
│       ├── masked-input/
│       └── modal/
├── constants/           # Constantes compartilhadas da aplicação
│   └── length.ts        # Limites de tamanho de campos e valores numéricos
├── hooks/               # React hooks compartilhados
│   ├── use-delete-handler.ts  # Estado do dialog de exclusão (itemToDelete + handlers)
│   └── use-form-state.ts      # Estado de abertura/edição/fechamento do formulário (formItem + handlers)
├── infra/               # Camada de infraestrutura (acesso ao Firestore)
├── layout/              # Shell da aplicação (AppLayout + navegação lateral)
│   ├── index.tsx        # AppLayout: sidebar + Outlet
│   ├── nav-items.ts     # Definições de rotas de navegação
│   └── style.ts
├── models/              # Modelos de domínio (operações específicas de cada entidade)
│   ├── group-model/
│   └── product-model/   # Exemplo: operações CRUD de produto
├── pages/               # Páginas no nível de rota
│   └── products/        # Página de produtos com componentes privados
│       └── _components/ # Componentes privados da página (não compartilhados)
├── providers/           # React context providers
│   └── app-provider/    # Orquestrador principal da aplicação (React Query + Zustand)
├── stores/              # Estado global com Zustand
├── themes/              # Configuração de tema MUI (dark/light)
├── types/               # Definições de tipos TypeScript
└── utils/               # Funções utilitárias
```

### Camadas

**`src/layout/`** — shell da aplicação. `AppLayout` renderiza a sidebar e o `<Outlet>` para rotas aninhadas. Importado diretamente pelo `Router.tsx` via `@/layout`, não exportado por `@/components`. Adicionar uma nova rota requer atualizar `nav-items.ts`.

**`src/hooks/`** — React hooks compartilhados usados em múltiplas páginas. `useFormState<T>` centraliza o estado de abertura/edição/fechamento do formulário; `useDeleteHandler<T>` centraliza o estado do dialog de exclusão e chama a mutation. Ambos seguem as convenções de nomenclatura definidas neste arquivo.

**`src/constants/`** — constantes da aplicação organizadas por domínio (ex: `length.ts` para limites de tamanho de campos). Centralize aqui apenas restrições compartilhadas entre múltiplos schemas ou que representam convenções da aplicação (`MAX_DESCRIPTION_LENGTH`, `MAX_NUMERIC_VALUE`). Restrições técnicas específicas de domínio (ex: `MAX_BARCODE_LENGTH`) permanecem locais ao seu schema.

**`src/infra/`** — camada de acesso ao banco de dados. `database.ts` expõe um objeto genérico `database` com métodos (`findMany`, `create`, `update`, `deleteUniqueById`, etc.) sobre o Firestore. Todos os documentos recebem automaticamente `id`, `createdAt` e `updatedAt`.

**`src/models/`** — modelos de domínio. Cada modelo (ex: `productModel`) define operações de negócio chamando `database` com o caminho da coleção Firestore. É aqui que novos tipos de entidade são adicionados. As funções não são marcadas com `async` — elas retornam diretamente a `Promise` do `database`. Parâmetros de tipo são especificados nas chamadas ao `database` somente quando o TypeScript não consegue inferí-los (ex: `findMany<T>`).

**Exemplo de estrutura de model:**

```typescript
// models/product-model/model.ts
import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const PATH = 'products'

const create = (data: TCreateData<TProduct>): Promise<TProduct> =>
  database.create({ path: PATH, data })

const findMany = (): Promise<TProduct[]> =>
  database.findMany<TProduct>({ path: PATH })

const update = (data: TUpdateData<TProduct>): Promise<TProduct> =>
  database.update({ path: PATH, data })

const deleteUniqueById = (id: string): Promise<string> =>
  database.deleteUniqueById({ path: PATH, id })

export const productModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
```

**`src/providers/app-provider/`** — orquestrador central da aplicação. Usa React Query para busca de dados e mutations. Injeta as funções de mutation diretamente no store Zustand (`useAppStore`) via `useEffect`. Isso permite que qualquer componente dispare mutations pelo store sem precisar de hooks do React Query.

**`src/stores/`** — estado global com Zustand:

- `useAppStore` — dados da aplicação (produtos, etc.); funções de mutation (`createProduct`, `updateProduct`, `deleteProduct`) são populadas pelo `AppProvider`
- `useAlertStore` — notificações globais via snackbar/alert
- `useCallbackStore` — callbacks de sucesso/erro registrados por componentes antes de disparar mutations

### Fluxo de dados

```text
Component → useAppStore.createProduct() → useMutation (React Query)
                                         → onSuccess: invalidate query + alert + callbacks
                                         → onError: alert + callbacks
```

**Padrão de callbacks** (`useCallbackStore`): permite que um componente registre o que deve acontecer após uma mutation ter sucesso ou falhar (ex: fechar modal) sem acoplar o componente ao provider.

### Exemplo de padrão de página

**`pages/products/use-products-handler.ts`** — custom hook que encapsula a lógica da página:

- Gerencia estado de UI local (formulário aberto/fechado, item a excluir, busca)
- Usa `useAppStore` para acessar dados globais e mutations
- Expõe handlers para interações do usuário seguindo as convenções de nomenclatura abaixo

**`pages/products/_components/form/use-form-handler.ts`** — lógica específica do formulário:

- Usa `react-hook-form` com validação Zod
- Registra callbacks via `useCallbackStore` para ações pós-mutation

### Padrão de formulários

Formulários seguem um padrão consistente:

1. **`schema.ts`** — schema Zod com regras de validação e constantes MAX\_\* exportadas
2. **`use-form-handler.ts`** — custom hook para lógica do formulário (defaults, validação, submissão)
3. **`style.ts`** — propriedades sx do MUI para estilização
4. **`index.tsx`** — renderização do componente com componentes MUI

**Exemplo de `use-form-handler.ts`:**

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
  const { createProduct, updateProduct, families, groups } = useAppStore()
  const { setSuccessCallbacks } = useCallbackStore()

  const defaultValues: TSchema = useMemo(
    () => ({
      description: product?.description ?? '',
      price: product?.price ?? null,
      barcode: product?.barcode ?? null,
      tax: product?.tax ?? null,
      margin: product?.margin ?? null,
      observations: product?.observations ?? null,
      familyId: product?.familyId ?? null,
      groupId: product?.groupId ?? null
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

  return {
    register,
    onSubmit,
    errors,
    control,
    families: families ?? [],
    groups: groups ?? []
  }
}
```

### Padrão de estado de carregamento e vazio

Toda página usa `null` como estado inicial dos dados (antes do primeiro fetch) e `[]` para lista vazia após o fetch. Use flags `isFetching` e `hasX` derivadas desses valores:

```typescript
const isFetching = products === null   // true apenas durante o carregamento inicial
const hasProducts = !!products?.length // false quando a lista está vazia

// No JSX:
{isFetching ? (
  <Loader />
) : hasProducts ? (
  <Table products={filteredProducts!} ... />
) : (
  <Typography>Você ainda não tem nenhum produto...</Typography>
)}
```

### Componente de tabela compartilhado

`src/components/blocks/table/` fornece um `<Table>` genérico que envolve o MUI DataGrid com colunas de ações de editar/excluir. O `_components/table/index.tsx` de cada página envolve esse componente genérico com tipagem e definições de colunas específicas da entidade:

```typescript
// pages/products/_components/table/index.tsx
import { Table as _Table } from '@/components'
import type { TProduct } from '@/models'
import { columns } from './columns'

export const Table = ({ products, handleEdit, handleDelete }: TTableProps) => (
  <_Table columns={columns} items={products} handleEdit={handleEdit} handleDelete={handleDelete} />
)
```

### Gerador de componentes

```bash
pnpm generate
```

Cria `src/components/<name>/index.tsx` e `style.ts`, e atualiza automaticamente `src/components/index.ts`. Atenção: o gerador cria na raiz de `components/` — mova o resultado para `blocks/` ou `ui/` conforme apropriado.

## Utilitários principais

- `selectOnFocus` — seleciona todo o texto quando o input recebe foco

## Sistema de tipos

**`src/types/generics.ts`** fornece tipos auxiliares:

- `TCreateData<T>` — omite `id`, `createdAt`, `updatedAt` para operações de criação
- `TUpdateData<T>` — requer `id` e dados parciais para atualizações

## Convenções

- O alias de caminho `@/` aponta para `src/`
- Cada módulo exporta via `index.ts` na sua pasta
- Estilos de componentes ficam em arquivo `style.ts` separado usando `MUI SxProps<Theme>`
- Inputs de texto usam `textTransform: 'uppercase'` (ver `style.ts`)
- Inputs numéricos têm `min`/`max` definidos a partir de constantes do schema
- Inputs de texto têm `maxLength` definido a partir de constantes do schema
- Sempre usar arrow functions
- Constantes de caminho de coleção em models usam `SCREAMING_SNAKE_CASE` (ex: `const PATH = 'products'`)
- IDs do Firestore são validados com `z.string()`, não `z.uuid()`, pois o Firestore gera IDs que não são UUIDs
- Campos anuláveis têm `null` como valor padrão em `defaultValues` do formulário (não `0` ou `''`) para preservar a semântica do banco de dados

## Convenções de nomenclatura

Nomes de handlers e variáveis seguem a ordem **`[Sujeito][Ação]`** — o sujeito (o componente ou elemento) vem antes da ação (o evento ou verbo).

### Funções de handler — `handle[Sujeito][Ação]`

| Padrão                             | Exemplo                                                                          | Regra                          |
| ---------------------------------- | -------------------------------------------------------------------------------- | ------------------------------ |
| Elemento de UI + evento DOM        | `handleAddClick`                                                                 | Add = elemento, Click = evento |
| Modal de formulário + ação         | `handleFormOpen`, `handleFormEdit`, `handleFormClose`                            | Form = o componente modal      |
| DeleteDialog + ação                | `handleDeleteDialogOpen`, `handleDeleteDialogClose`, `handleDeleteDialogConfirm` | Usar o nome do componente      |
| Props de ação de tabela            | `handleEdit`, `handleDelete`                                                     | Curto; a ação se descreve      |
| Botão de adicionar no Autocomplete | `handleAddClick`                                                                 |                                |

**Exceção:** `onSubmit` — mantido assim pois corresponde à prop nativa `<form onSubmit>` e entraria em conflito com o `handleSubmit` do react-hook-form.

### Variáveis de estado

| Padrão                  | Exemplo                                    | Regra                                         |
| ----------------------- | ------------------------------------------ | --------------------------------------------- |
| Entidade no formulário  | `formProduct`, `formSeller`                | `form[Entidade]` — contexto antes da entidade |
| Entidade sendo excluída | `productToDelete`, `sellerToDelete`        | `[entidade]ToDelete`                          |
| Estado booleano         | `isFormOpen`, `isFetching`, `hasProducts`  | `is[Sujeito][Estado]`, `has[Sujeito]`         |
| Flag de criação rápida  | `quickCreateFamily`, `quickCreateSupplier` | `quickCreate[Entidade]`                       |

### Props de componentes

Props em componentes compartilhados seguem a mesma regra `handle[Sujeito][Ação]`. Use `on*` apenas para props de eventos DOM nativos (ex: `onFocus`, `onChange`) repassados para elementos HTML subjacentes.

## Convenção de commits

Mensagens de commit devem estar em inglês e seguir este formato:

- Use os seguintes prefixos semânticos: `🎉 init, ✨ feat, 🐛 fix, 📚 docs, 💎 style, 📦 refactor, 🚀 perf, 🚨 test, 🛠 build, ⚙️ ci, ♻️ chore, 🗑 revert`
- A mensagem deve estar no imperativo e em letras minúsculas.
- Escreva o corpo do commit como uma lista
- Referencie a issue associada pelo número, se existir, usando o formato `Issue: #<número>`.

Exemplo:

```text
✨ feat: add products page

- Create products page
- Add products table
- Add products form

Issue: #1
```

## Fluxo de trabalho: issues, branches e merge requests

O projeto está em uso real — **não se trabalha mais diretamente na `main`**. Todo trabalho segue: issue → branch → commits → merge request.

### Issues

- Gerenciadas no GitLab via `glab` (CLI autenticado localmente).
- Antes de iniciar um trabalho não trivial, verifique se já existe uma issue correspondente (`glab issue list --all`); se não existir, crie uma (`glab issue create --title "..." --description "..."`).
- Branches e merge requests devem referenciar a issue relacionada.

### Branches

- Formato: **`<prefixo>/<titulo>#<issue>`** — o prefixo é o mesmo usado nos commits, sem emoji: `init, feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert`.
- Exemplos: `feat/relatorio-pedidos#10`, `fix/invoice-race-condition#12`.
- Para um esforço amplo de escopo único (ex: um code review cobrindo múltiplas áreas do projeto), prefira uma única branch para todo o trabalho a várias branches por achado — evita overhead de múltiplas MRs pequenas quando o resultado é logicamente uma única entrega.

### Git hooks (husky)

- **`pre-commit`** — roda `lint-staged`.
- **`commit-msg`** — reescreve automaticamente prefixos simples (`feat:`, `fix:`, etc.) para a versão com emoji e valida com `commitlint`. Pode-se commitar usando o prefixo sem emoji (ex: `git commit -m "feat: add x"`) que o hook adiciona o emoji.
- **`pre-push`** — roda `pnpm tsc -b --noEmit && pnpm test`. Os testes (Vitest) são mockados e não dependem dos emuladores do Firebase.

### Abrindo o merge request

1. `git push -u origin <branch>`
2. `glab mr create --source-branch <branch> --target-branch main --title "..." --description "..."`
   - Título segue a convenção de commits (prefixo + emoji, imperativo, minúsculo).
   - Descrição resume as mudanças — se for um review com múltiplos achados, agrupe por severidade/categoria — e referencia a issue com `Issue: #<número>`.
3. Reporte a URL da MR ao usuário ao final.
