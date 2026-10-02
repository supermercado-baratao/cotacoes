---
name: new-entity
description: Adiciona uma nova entidade de ponta a ponta neste app (model no Firestore, query e mutations no AppProvider, store Zustand, página com tabela, formulário, rota, item de navegação e testes), seguindo o padrão das entidades existentes. Use quando pedirem um novo cadastro/coleção/CRUD (ex: "criar cadastro de marcas", "nova entidade X").
---

Use uma entidade de CRUD simples já existente como referência e espelhe a estrutura dela: `department` (só descrição) ou `family`/`seller` (mais campos). Leia os arquivos equivalentes da referência antes de escrever cada passo. Nos exemplos abaixo, `<entity>`/`<Entity>`/`<entities>` são o nome em inglês (singular, PascalCase, plural) e o texto de interface fica em português.

## 1. Model — `src/models/<entity>-model/`

- `types.ts`: `T<Entity>` com `id: string`, os campos de domínio (anuláveis como `T | null`), `createdAt: Timestamp` e `updatedAt: Timestamp`.
- `model.ts`: `const PATH = '<entities>'` e as funções `create`, `findMany`, `update` e `deleteUniqueById` chamando `database` com `getUserPath(PATH)`; sem `async`, retornando a `Promise` do `database`.
- `index.ts`: `export * from './model'` e `export * from './types'`.
- Adicione `export * from './<entity>-model'` em `src/models/index.ts`.

## 2. Mutations e query — `src/providers/app-provider/`

- `use-<entity>-mutation.ts`: use `useEntityMutation` com `queryKey: ['<entities>']`, as funções do model e as `labels` em português (`'<Entidade> criado com sucesso!'`, `'Erro ao criar <entidade>'`...). Retorne `{ create<Entity>, update<Entity>, delete<Entity> }`.
- `use-data-fetch.ts`: adicione a query `{ queryKey: ['<entities>'], queryFn: <entity>Model.findMany, enabled: !!user }` e exponha `<entities>`.
- `use-app-handler.ts`: chame o hook de mutation, adicione `set<Entities>` ao seletor do store, o `useEffect` que sincroniza `<entities>` no store e injete as três mutations no store (nos dois lugares em que as outras entidades aparecem).

## 3. Store — `src/stores/use-app-store.ts`

No tipo `TAppStore`: `<entities>: T<Entity>[] | null`, `set<Entities>`, `create<Entity>`, `update<Entity>` e `delete<Entity>`. No estado inicial: `<entities>: null`, o setter e as mutations como `() => {}` (substituídas pelo `AppProvider`).

## 4. Formulário — `src/components/blocks/<entity>-form/`

Fica em `blocks` porque formulários de entidade são reutilizados na criação rápida pelo Autocomplete. Siga o Padrão de formulários do `AGENTS.md`:

- `schema.ts`: Zod com constantes de tamanho (`MAX_DESCRIPTION_LENGTH` de `@/constants` ou `MAX_*` locais) e `satisfies z.ZodType<TCreateData<T<Entity>>>`.
- `use-form-handler.ts`: `defaultValues` com `?? null` nos anuláveis, `reset` no `useEffect`, `setSuccessCallbacks` antes de `create<Entity>`/`update<Entity>`.
- `style.ts`: `Wrapper` com `'.MuiInputBase-input': { textTransform: 'uppercase' }` e `Actions`.
- `index.tsx`: `<Modal>` com título `Novo <Entidade>`/`Editar <Entidade>`, `TextField`s com `label`, `onFocus={selectOnFocus}` e `slotProps={{ htmlInput: { maxLength } }}`.
- Exporte em `src/components/index.ts` (`export * from './blocks/<entity>-form'`, em ordem alfabética).

## 5. Página — `src/pages/<entities>/`

- `utils.ts`: `filter<Entities>(search, items)` com `matchesSearch` de `@/utils`.
- `use-<entities>-handler.ts`: `useFormState<T<Entity>>()` (renomeando para `form<Entity>`/`setForm<Entity>`), `search`, `filtered<Entities>` via `useMemo`, `isFetching = <entities> === null` e `has<Entities> = !!<entities>?.length`.
- `_components/table/columns.ts` e `_components/table/index.tsx` envolvendo o `Table` de `@/components` (com `useDeleteHandler<T<Entity>>` + `Dialog` de confirmação, se houver exclusão — ver `pages/families/_components/table`); `_components/index.ts` exportando a tabela.
- `index.tsx`: `PageHeader` + `DataView` + `Table` + `<Entity>Form`.
- Exporte a página em `src/pages/index.ts`.

## 6. Rota e navegação

- `src/Router.tsx`: `<Route path="/<entities>" element={<<Entities> />} />` dentro do bloco de rotas autenticadas (junto de `/dashboard`).
- `src/layout/nav-items.ts`: `{ label: '<Entidades>', path: '/<entities>', icon: <Ícone> }` com um ícone de `@mui/icons-material`, na posição que fizer sentido na sidebar.

## 7. Testes

- **Vitest** (`src/tests/vitest/`): apenas a lógica própria da entidade (ex: um filtro ou cálculo não trivial). Se a busca só usa `matchesSearch`, não há o que testar. Se a entidade entra no import do catálogo ou no `populateDatabase`, ajuste `src/tests/vitest/orchestrator.ts`.
- **Playwright** (`src/tests/playwright/<entities>.spec.ts`): o fluxo criar → editar → excluir pela UI. Cada `test()` chama `createUser()` do orchestrator, faz login e semeia só o que precisa (chamando o model direto); `clearData()` no `test.beforeAll`. Rode com os emuladores ligados (`pnpm emulators:start`).

## 8. Verificação

1. `pnpm eslint:check && pnpm prettier:check && pnpm test`.
2. `pnpm test:e2e src/tests/playwright/<entities>.spec.ts` com os emuladores rodando.
3. Rode o subagente `ui-reviewer` sobre a mudança.
4. Se a entidade criou uma convenção nova, atualize o `AGENTS.md`.
