---
name: new-entity
description: Adds a new end-to-end entity to this app (Firestore model, query and mutations in the AppProvider, Zustand store, page with a table, form, route, navigation item and tests), following the pattern of the existing entities. Use when asked for a new record type/collection/CRUD (e.g. "add a brands page", "new entity X").
---

Take an existing simple CRUD entity as the reference and mirror its structure: `department` (description only) or `family`/`seller` (more fields). Read the reference's equivalent files before writing each step. In the examples below, `<entity>`/`<Entity>`/`<entities>` are the English name (singular, PascalCase, plural), and the UI copy (`<Entidade>`) is in Portuguese.

## 1. Model — `src/models/<entity>/`

- `types.ts`: `T<Entity>` with `id: string`, the domain fields (nullable ones as `T | null`), `createdAt: Timestamp` and `updatedAt: Timestamp`.
- `model.ts`: `const PATH = '<entities>'` and the `create`, `findMany`, `update` and `deleteUniqueById` functions calling `database` with `getUserPath(PATH)`; no `async`, returning the `database` `Promise`.
- No `index.ts`: import from `@/models/<entity>/model` and `@/models/<entity>/types`.

## 2. Mutations and query — `src/providers/app-provider/`

- `use-<entity>-mutation.ts`: use `useEntityMutation` with `queryKey: ['<entities>']`, the model functions and the `labels` in Portuguese (`'<Entidade> criado com sucesso!'`, `'Erro ao criar <entidade>'`...). Return `{ create<Entity>, update<Entity>, delete<Entity> }`.
- `use-data-fetch.ts`: add the query `{ queryKey: ['<entities>'], queryFn: <entity>Model.findMany, enabled: !!user }` and expose `<entities>`.
- `use-app-handler.ts`: call the mutation hook, add `set<Entities>` to the store selector and the `useEffect` that syncs `<entities>` into the store, and inject the three mutations into the store (in both places where the other entities appear).

## 3. Store — `src/stores/use-app-store.ts`

In the `TAppStore` type: `<entities>: T<Entity>[] | null`, `set<Entities>`, `create<Entity>`, `update<Entity>` and `delete<Entity>`. In the initial state: `<entities>: null`, the setter and the mutations as `() => {}` (replaced by the `AppProvider`).

## 4. Form — `src/components/blocks/<entity>-form/`

It lives in `blocks` because entity forms are reused by the quick create in the Autocomplete. Follow Forms in `AGENTS.md`:

- `schema.ts`: Zod with length constants (`MAX_DESCRIPTION_LENGTH` from `@/constants/length` or local `MAX_*`) and `satisfies z.ZodType<TCreateData<T<Entity>>>`.
- `use-form-handler.ts`: `defaultValues` with `?? null` on nullable fields, `reset` in the `useEffect`, `setSuccessCallbacks` before `create<Entity>`/`update<Entity>`.
- `style.ts`: `Wrapper` with `'.MuiInputBase-input': { textTransform: 'uppercase' }` and `Actions`.
- `index.tsx`: `<Modal>` titled `Novo <Entidade>`/`Editar <Entidade>`, `TextField`s with a `label`, `onFocus={selectOnFocus}` and `slotProps={{ htmlInput: { maxLength } }}`.

## 5. Page — `src/pages/<entities>/`

- `utils.ts`: `filter<Entities>(search, items)` with `matchesSearch` from `@/utils/search`.
- `use-<entities>-handler.ts`: `useFormState<T<Entity>>()` (renamed to `form<Entity>`/`setForm<Entity>`), `search`, `filtered<Entities>` through `useMemo`, `isFetching = <entities> === null` and `has<Entities> = !!<entities>?.length`.
- `_components/table/columns.ts` and `_components/table/index.tsx` wrapping the `Table` from `@/components/blocks/table` (with `useDeleteHandler<T<Entity>>` + a confirmation `Dialog`, if it can be deleted — see `pages/families/_components/table`).
- `index.tsx`: `PageHeader` + `DataView` + `Table` + `<Entity>Form`.

## 6. Route and navigation

- `src/Router.tsx`: import the page from `@/pages/<entities>` and add `<Route path="/<entities>" element={<<Entities> />} />` inside the authenticated routes block (next to `/dashboard`).
- `src/layout/nav-items.ts`: `{ label: '<Entidades>', path: '/<entities>', icon: <Icon> }` with an icon from `@mui/icons-material`, wherever it makes sense in the sidebar.

## 7. Tests

- **Vitest** (`*.test.ts` next to the code, e.g. `src/pages/<entities>/utils.test.ts`): only the entity's own logic (e.g. a non-trivial filter or calculation). If the search only uses `matchesSearch`, there is nothing to test.
- **Playwright** (`src/tests/e2e/<entities>.spec.ts`): the create → edit → delete flow through the UI. Each `test()` calls the orchestrator's `createUser()`, signs in and seeds only what it needs (calling the model directly). The tests never clear the emulator: each user's data is isolated.

## 8. Verification

1. `pnpm type-check && pnpm eslint:check && pnpm prettier:check && pnpm spell:check && pnpm test`.
2. `pnpm test:e2e`, which restarts the emulators (or `pnpm playwright test src/tests/e2e/<entities>.spec.ts` with the emulators running).
3. Run the `ui-reviewer` subagent on the change.
4. Update `docs/local-testing.md` with the new page, and `src/tests/seed.ts` if the manual test needs its data.
5. If the entity created a new convention, update `AGENTS.md`.
