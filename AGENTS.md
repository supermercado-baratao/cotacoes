# AGENTS.md

Guidance for AI agents (Claude Code and others) working in this repository. `CLAUDE.md` only imports this file.

## Project Conventions

### Scope

This is **Cotações**, the web app Supermercado Baratão uses, **in production**, to manage purchase quotes and track purchase orders. It holds the catalog (products, suppliers, sellers, families and departments, imported from the VR Software ERP), the quotes and their orders, the incoming invoices (NF-e XML) linked to those orders, the price adjustments exported from VR and a dashboard of product margins. The stack: React 19 + TypeScript + Vite + MUI, with Firebase (Auth + Firestore) as the backend, React Query and Zustand. There is no server of our own: the browser talks to Firestore directly, and `firestore.rules` is what keeps each user's data private.

### Language

- **Portuguese (pt-BR):** GitHub issues (titles and bodies), the issue template, `README.md` and everything users see: UI copy, alerts and error messages. Routes are in English (`/signin`, `/dashboard`).
- **English:** code (identifiers and comments), test descriptions, commit messages, branch names, pull requests (title and body), `AGENTS.md`, `docs/` and the AI setup under `.claude/`. The VR Software documents in `docs/` (`contexto-integracao-vr.md`, `query-sql.md`, `tabelas-vr.md`, `relacao-de-produtos-e-notas.md`) are the exception: they follow VR's schema and stay as they are.

### Package manager

- Use **pnpm** only (never npm/yarn/npx).
- Versions are pinned exact (no `^`/`~`) for `dependencies` and `devDependencies` in `package.json`. Install new deps with `pnpm add -E <pkg>` (or `pnpm add -D -E <pkg>`) — never hand-edit version strings.
- `-E` only takes effect when no version is given. `pnpm add -E <pkg>@<version>` and packages already in `package.json` still get a `^`. In those cases, remove the carets right after (`sed -i -E 's/"\^([0-9])/"\1/' package.json`) and run `pnpm install`.
- `minimumReleaseAge` in `pnpm-workspace.yaml` (7 days, in minutes) keeps pnpm from resolving a version published less than a week ago.
- The exact-version rule does not apply to MCP servers (`.mcp.json`) or scripts, which may use `@latest` (e.g. `pnpm dlx @playwright/mcp@latest`). They must still run through `pnpm dlx`.
- The Node version is pinned in `.nvmrc`, and `engines.node` (`24.x`) in `package.json` follows its major, for hosts that ignore `.nvmrc`. The pnpm version is in `packageManager`.
- `firebase-tools` is a devDependency: run its CLI with `pnpm exec firebase`.
- `@/*` resolves to `src/*`.

### Commands

```bash
pnpm dev              # start the Firebase emulators and the dev server
pnpm build            # production build (tsc + vite build)
pnpm test             # run the Vitest unit tests once
pnpm test:watch       # run the Vitest unit tests in watch mode
pnpm test:e2e         # restart the emulators and run the Playwright e2e tests
pnpm test:e2e:ui      # restart the emulators and run the e2e tests in Playwright's UI mode
pnpm type-check       # type-check (tsc)
pnpm eslint:check     # lint
pnpm eslint:fix       # lint and auto-fix
pnpm prettier:check   # check formatting
pnpm prettier:fix     # format
pnpm spell:check      # check spelling (cspell)
pnpm generate         # generate a new component (plop)
pnpm services:up      # start the Firebase emulators (Auth + Firestore) in the background, unless they are already running
pnpm services:down    # stop the emulators
pnpm db:seed          # create a verified user with sample data in the emulators (see docs/local-testing.md)
```

To run a single test file:

```bash
pnpm vitest run src/utils/margin.test.ts
pnpm playwright test src/tests/e2e/quote.spec.ts
```

### Environment & local services

- The committed `.env.development` holds the local values and needs no secret: outside production, the app always uses the Firebase emulators and the local fallback instead of Gemini. The `demo-cotacoes` project ID makes Firebase refuse any access to real resources. The same file serves Vite in `pnpm dev`, Vitest (`test.env` in `vite.config.ts`, since the `test` mode only reads `.env.test`), Playwright and `services:up`.
- The production variables (`VITE_API_KEY`, `VITE_AUTH_DOMAIN`, `VITE_PROJECT_ID`, `VITE_STORAGE_BUCKET`, `VITE_MESSAGING_SENDER_ID`, `VITE_APP_ID`, `VITE_APP_MEASUREMENT_ID`, `VITE_GEMINI_MODEL` and `VITE_GEMINI_API_KEY`) live in Netlify and are listed in the "Variáveis de ambiente" section of `README.md`; keep that table in sync when adding one. To use them locally (e.g. a script in `scripts/`), create a git-ignored `.env.production.local`.
- The emulators need Java. `pnpm services:up` (`src/infra/scripts/emulators.ts`) starts them in the background only when they aren't running yet, writes their output to `firebase-emulators.log` and waits for Auth and Firestore to answer.
- The emulator data lives in memory while the emulators run, so it survives restarts of `pnpm dev` and is gone after `pnpm services:down` and `pnpm test:e2e`, which restarts the emulators before the suite: the Firestore emulator's memory only grows, even when documents are deleted, and makes the parallel suite slow and flaky.
- The emulator loads `firestore.rules` only on start: after changing the rules, run `pnpm services:down` and start it again.

### Production & deployment

- The app is a static SPA hosted on **Netlify**, linked to the GitHub repository: a merge to `main` deploys to production, and each pull request gets a deploy preview. `netlify.toml` sets the build (`pnpm build`, publishing `dist`) and the SPA fallback (every path rewritten to `/index.html` with status `200`, so the routes of `Router.tsx` work on a reload).
- Netlify reads the Node version from `.nvmrc` and installs with pnpm, detected from `pnpm-lock.yaml`.
- `vite build` runs in `production` mode, so `.env.development` is not loaded: the build takes the `VITE_*` variables set in the Netlify site settings, and with them the app connects to the real Firebase project and Gemini (`src/infra/firebase-config.ts` only connects to the emulators when `MODE` is not `production`). The `VITE_*` values end up in the public bundle: they identify the Firebase project, and the access control is in `firestore.rules`.
- `firestore.rules` is not deployed by Netlify: publish it with `pnpm exec firebase deploy --only firestore:rules` after merging a change to it.

### Project structure

```text
src/
├── components/          # Reusable components
│   ├── blocks/          # Domain components (entity forms, table, data-view, page-header, catalog-import...)
│   └── ui/              # Generic UI primitives, with no domain knowledge (alert, autocomplete, currency-input, dialog, loader, masked-input, modal, search-input)
├── constants/           # Shared constants (length.ts, margin.ts)
├── hooks/               # Shared React hooks (use-delete-handler.ts, use-form-state.ts)
├── infra/               # Infrastructure: Firestore (database.ts), Firebase config, Gemini, local scripts
├── layout/              # App shell (AppLayout + side navigation)
│   ├── index.tsx        # AppLayout: sidebar + Outlet
│   ├── nav-items.ts     # Navigation items
│   └── style.ts
├── models/              # Domain models, one per entity (<entity>/{model,types}.ts)
├── pages/               # Route-level pages (each with its private _components/)
├── providers/
│   └── app-provider/    # App orchestrator: queries (use-data-fetch), mutations (use-<entity>-mutation) and store injection (use-app-handler)
├── stores/              # Global state with Zustand (app, alert, auth, callback)
├── tests/               # e2e suite, orchestrator, fixtures and test helpers (see Testing)
├── themes/              # MUI theme (dark/light)
├── types/               # Generic types
├── utils/               # Utility functions
└── Router.tsx           # Routes
```

Outside `src/`: `docs/` (project docs and the VR Software integration docs), `generators/` (plop templates) and `scripts/` (migration scripts run by hand).

#### Layers

Layers only import from the ones below them, and ESLint (`no-restricted-imports`) enforces the direction:

```text
pages, layout → components, hooks → providers → stores → models → infra
```

- `constants`, `types` and `utils` are leaves: they import from no layer, only from other leaves.
- `infra` and the leaves may import types from `@/models/*/types` (`import type`), but not code.
- `providers` may import from `components/ui` (the provider's `Loader` and `Alert`), but not from `components/blocks`.
- Tests (`*.test.ts(x)` and `src/tests/`) are outside the layer rule.

**`src/layout/`** — the app shell. `AppLayout` renders the sidebar and the `<Outlet>` for nested routes, imported by `Router.tsx` through `@/layout`. A new page needs the route in `Router.tsx` and the item in `nav-items.ts`.

**`src/hooks/`** — hooks shared across pages. `useFormState<T>` holds the form's open/edit/close state; `useDeleteHandler<T>` holds the delete dialog's state and calls the mutation.

**`src/constants/`** — constants grouped by domain. Only centralize here constraints shared by several schemas or that stand for an app-wide convention (`MAX_DESCRIPTION_LENGTH`, `MAX_NUMERIC_VALUE`). Technical constraints of a single domain (e.g. `MAX_BARCODE_LENGTH`) stay local to their schema.

**`src/infra/`** — `database.ts` exposes a generic `database` object (`findMany`, `create`, `update`, `deleteUniqueById`, `upsertManyWithIds`, etc.) over Firestore. Every document automatically gets `id`, `createdAt` and `updatedAt`. Data is per user: the models build the path with `getUserPath(PATH)`.

**`firestore.rules`** — the Firestore security rules, applied by the emulator (through `firebase.json`) and published to production by hand (see Production & deployment). Only the user, with a verified email, reads and writes `users/{uid}/...`. Since the rule reads the `email_verified` claim from the ID token, refresh the token (`getIdToken(true)`) whenever the email is verified during the session — `reload()` is not enough.

**`src/models/`** — domain models. Each model defines the business operations by calling `database` with the collection path. The functions are not marked `async` — they return the `database` `Promise` directly. Type parameters are only passed to `database` when TypeScript can't infer them.

```typescript
// models/department/model.ts
import { database } from '@/infra/database'
import { getUserPath } from '@/infra/firebase-config'
import type { TCreateData, TUpdateData } from '@/types/generics'

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

**`src/providers/app-provider/`** — the central orchestrator. `use-data-fetch.ts` fetches the data with React Query; each `use-<entity>-mutation.ts` creates the mutations (simple CRUD entities use `useEntityMutation`, which already handles invalidation, alerts and callbacks); `use-app-handler.ts` injects data and mutations into the Zustand store through `useEffect`. Any component then fires mutations through the store, with no React Query hooks.

**`src/stores/`** — global state with Zustand:

- `useAppStore` — app data and mutation functions (`createProduct`, `updateProduct`, ...), filled in by the `AppProvider`
- `useAlertStore` — global snackbar/alert notifications
- `useAuthStore` — the signed-in user
- `useCallbackStore` — success/error callbacks registered by components before firing mutations

### Data flow

```text
Component → useAppStore.createProduct() → useMutation (React Query)
                                         → onSuccess: invalidate query + alert + callbacks
                                         → onError: alert + callbacks
```

**Callback pattern** (`useCallbackStore`): the component registers what must happen after a mutation succeeds or fails (e.g. closing the modal) without coupling itself to the provider.

### Pages

- **`pages/<entity>/use-<entity>-handler.ts`** — a custom hook with the page logic: local UI state (form, item to delete, search), data and mutations from `useAppStore` and handlers following the naming conventions.
- **`pages/<entity>/_components/`** — the page's private components (e.g. `table/`).
- Entity forms reused by more than one page (quick create in the Autocomplete) live in `components/blocks/<entity>-form/`.

#### Loading and empty states

Data starts as `null` (before the first fetch) and becomes `[]` when the list is empty. Derive the `isFetching` and `hasX` flags from these values and use `DataView`:

```tsx
const isFetching = products === null
const hasProducts = !!products?.length

<DataView isFetching={isFetching} isEmpty={!hasProducts} emptyMessage="Você ainda não tem nenhum produto...">
  <Table products={filteredProducts ?? []} handleEdit={handleFormOpen} />
</DataView>
```

#### Shared table

`components/blocks/table/` provides a generic `<Table>` over the MUI DataGrid, with edit/delete action columns. Each page's `_components/table/` wraps it with the entity's typing and columns (`columns.ts`).

### Forms

1. **`schema.ts`** — Zod schema with the validation rules and exported `MAX_*` constants; when the schema mirrors the entity, use `satisfies z.ZodType<TCreateData<T>>`
2. **`use-form-handler.ts`** — defaults, validation and submission
3. **`style.ts`** — MUI `sx` props
4. **`index.tsx`** — rendering with MUI components

```typescript
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'

import type { TProduct } from '@/models/product/types'
import { useAppStore } from '@/stores/use-app-store'
import { useCallbackStore } from '@/stores/use-callback-store'

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

- Text inputs use `textTransform: 'uppercase'` (in `style.ts`) and `onFocus={selectOnFocus}`.
- Text inputs have a `maxLength`, and numeric inputs a `min`/`max`, set from the schema constants.
- Firestore IDs are validated with `z.string()`, not `z.uuid()`: Firestore doesn't generate UUIDs.
- Nullable fields default to `null` in `defaultValues` (not `0` or `''`), to keep the database semantics.

### Code style

- `./` imports are only for the same folder or a direct subfolder (`./style`, `./_components/table`); use `@/` for everything else. ESLint forbids `../`.
- No barrels: don't create an `index.ts` that only re-exports. Import each module from its own file through `@/` (`@/models/product/types`, `@/stores/use-app-store`, `@/components/blocks/data-view`), or by relative path inside the same page or component. Barrels caused circular imports (`infra` → `utils` → `models` → `infra`).
- Always use arrow functions.
- Component styles live in `style.ts`, typed as `SxProps<Theme>` and imported as `* as S`.
- Collection path constants in models use `SCREAMING_SNAKE_CASE` (e.g. `const PATH = 'products'`).
- Type aliases start with `T` (`TProduct`, `TSchema`, `TTableProps`).
- `pnpm generate` asks whether the component goes in `blocks/` or `ui/` and creates `src/components/<blocks|ui>/<name>/index.tsx` and `style.ts` (see the `new-component` skill).

#### Naming

Handler and variable names follow the **`[Subject][Action]`** order — the subject (component or element) comes before the action (event or verb).

**Handlers — `handle[Subject][Action]`**

| Pattern                        | Example                                                                          | Rule                           |
| ------------------------------ | -------------------------------------------------------------------------------- | ------------------------------ |
| UI element + DOM event         | `handleAddClick`                                                                 | Add = element, Click = event   |
| Form modal + action            | `handleFormOpen`, `handleFormEdit`, `handleFormClose`                            | Form = the modal component     |
| DeleteDialog + action          | `handleDeleteDialogOpen`, `handleDeleteDialogClose`, `handleDeleteDialogConfirm` | Use the component name         |
| Table action props             | `handleEdit`, `handleDelete`                                                     | Short; the action describes it |
| Add button in the Autocomplete | `handleAddClick`                                                                 |                                |

**Exception:** `onSubmit` — it matches the native `<form onSubmit>` prop and doesn't clash with react-hook-form's `handleSubmit`.

**State variables**

| Pattern              | Example                                    | Rule                                       |
| -------------------- | ------------------------------------------ | ------------------------------------------ |
| Entity in the form   | `formProduct`, `formSeller`                | `form[Entity]` — context before the entity |
| Entity being deleted | `productToDelete`, `sellerToDelete`        | `[entity]ToDelete`                         |
| Boolean state        | `isFormOpen`, `isFetching`, `hasProducts`  | `is[Subject][State]`, `has[Subject]`       |
| Quick create flag    | `quickCreateFamily`, `quickCreateSupplier` | `quickCreate[Entity]`                      |

**Component props** follow the same `handle[Subject][Action]` rule. Use `on*` only for native DOM events (e.g. `onFocus`, `onChange`) passed down to HTML elements.

### Linting & formatting

- ESLint uses flat config (`eslint.config.js`): `typescript-eslint`, `react-hooks`, `react-refresh`, `simple-import-sort`, `prefer-arrow-functions` (config `all`, as errors), `promise` (`flat/recommended`), `unicorn` (`recommended`), `@eslint/markdown`, `@eslint/json` and `eslint-config-prettier`.
- `unicorn`: the rules that clash with the project conventions are off in `eslint.config.js` (e.g. `no-null`, `prefer-default-parameters`, `prefer-ternary` and `prefer-smaller-scope`, which would move the `T*` types into the functions). Names don't use abbreviations (`index`, `event`, `error`, `previous`...); the only accepted ones are `props`, `ref`, `params`, `utils` and `env`. Files are kebab-case, except `App.tsx` and `Router.tsx`.
- `@eslint/json` reads `tsconfig*.json` and `.vscode/*.json` as JSONC (comments allowed) and the other `*.json` as strict JSON. The fixtures in `src/tests/_mocks/` are not linted.
- Spelling: `cspell` (`cspell.config.yaml`) with the `en` and `pt_BR` dictionaries. Project terms (VR tables and columns, tax acronyms, product names from the fixtures) go in `.cspell/project-words.txt`, one per line, lowercase. `flagWords` flags common Portuguese words written without their accents. The fixtures, the SQL query, the VR Software docs and `.claude/` are skipped.
- The `review-copy` skill (`.claude/skills/review-copy/`) reviews the text in the code (naming, comments, test descriptions, UI copy, docs); use it on a diff before opening a pull request.
- Prettier: single quotes, no semicolons, no trailing commas (`.prettierrc`). Base whitespace rules (2 spaces, LF) are in `.editorconfig`.
- `pnpm-lock.yaml` is ignored by Prettier: pnpm generates it.
- `.claude/` is ignored by ESLint and Prettier: the third-party skills installed there don't follow the project style.
- The Playwright outputs (`test-results/`, `playwright-report/`, `blob-report/`, `.playwright-mcp/`) are also ignored by ESLint, which runs over the whole repository.

### Code comments

- Comments only record **why** a decision was made, ideally with a reference (docs link, issue number, upstream bug). Never write comments that explain what the code does or how it works.
- Default to no comment. Add one only for a non-obvious choice that someone might "fix" by mistake.
- Write comments in English.

### Git hooks (husky)

- `pre-commit`: runs `lint-staged` (`lint-staged.config.js`) on the staged files only: ESLint, Prettier and cspell on code, Markdown and JSON files, Prettier and cspell on YAML, and `vitest related` to run the unit tests affected by the code files.
- `commit-msg`: rewrites plain prefixes (`feat:`, `fix:`...) to the emoji version from the Commit Rules below and validates them with `commitlint`. Type the plain word and let the hook add the emoji.
- `pre-push`: runs `pnpm type-check` and `pnpm test:e2e` (Playwright), which restarts the emulators.

### Testing

```text
src/
├── **/*.test.ts(x)      # unit tests (Vitest), next to the code they test
└── tests/
    ├── _mocks/          # fixtures shared by both suites (xlsx/xml/txt)
    ├── _utils/          # unit test helpers (e.g. read-mock-file.ts, create-query-wrapper.tsx)
    ├── e2e/             # e2e suite (Playwright), *.spec.ts
    ├── orchestrator.ts  # createUserData / createUser / populateDatabase / verifyEmail against the real Firebase emulator
    └── seed.ts          # data of `pnpm db:seed`, loaded by src/infra/scripts/seed.ts through Vite's runnerImport
```

`orchestrator.ts` reuses the real models (`@/models`) and the import parser (`getData`) in plain Node against the emulators — much faster than filling the data through the UI. This only works because `src/infra/firebase-config.ts` and `src/infra/gemini.ts` fall back to `process.env` when `import.meta.env` doesn't exist (outside Vite).

- **Vitest** (`*.test.ts(x)` next to the module it tests, with the same name: `utils.ts` → `utils.test.ts`; one test file per module) — unit tests only, which run in seconds: pure functions (`evaluateMargin`, `groupInvoiceItemsForBatch`, `extractPackingInfo`...) and error scenarios that need to force a database rejection, which can't be simulated against the emulator. Those test the hook (an `AppProvider` mutation or a page handler) with `renderHook` and `vi.spyOn(<model>, '<method>').mockRejectedValueOnce(...)` — never render the `App` or whole pages. No network and no emulators.
  - Each file mocks only what it uses (`vi.spyOn` on the model or a local `vi.mock`); there are no global mocks. `vitest.setup.ts` resets and restores every mock before each test.
  - Every file runs in the `jsdom` environment (the default in `vite.config.ts`); don't declare `// @vitest-environment` per file.
- **Playwright** (`src/tests/e2e/*.spec.ts`) — every end-to-end UI flow (create → edit → delete), in a real browser, against the Firebase emulators. One file per page; each `test()` creates its own user (`createUser`, or `createUserData` when the sign-up goes through the UI) and seeds only the data it needs (through the orchestrator or by calling the models) — independent tests, not a sequential script. Since each user's data is isolated under `users/{uid}`, the tests run in parallel (`fullyParallel`) and never clear the emulator. There are no global retries: use `test.describe.configure({ mode: 'serial' })` or `retries` only on the test that needs it, with a comment explaining why. `pnpm test:e2e` restarts the emulators first.
- Only test logic we wrote (calculations, filters, mappings, parsers, business rules). Don't test library behavior (MUI, zod, React Query), and drop a test whose main cost is a mock needed only to render.

### CI (GitHub Actions)

`.github/workflows/ci.yml` runs only on pull requests and repeats the hooks' checks, which can be skipped with `--no-verify`. A ruleset on `main` requires the three jobs to pass before merging. The jobs use the committed `.env.development`, with no secrets.

- **`commitlint`** — validates every commit of the PR (`--from` the base SHA, `--to` the head SHA).
- **`check`** — `pnpm type-check`, `pnpm eslint:check`, `pnpm prettier:check`, `pnpm spell:check` and `pnpm test`.
- **`e2e`** — installs Java and Playwright's Chromium on `ubuntu-latest` and runs `pnpm test:e2e`. On failure, `test-results/` and `firebase-emulators.log` are kept as artifacts of the run.

When renaming a job, update the required checks in the `main` ruleset (Settings → Rules).

### AI tooling

- **MCPs** (`.mcp.json`): **Context7** for library docs (MUI, React Query, Firebase, Zod, Vite...); **Playwright** to open the app in the browser and check a change; **Firebase** (`firestore`, `auth`) to inspect data. The Firebase MCP uses the account signed in to the `firebase` CLI, that is, the **production** project: only read data when the user asks, and never write or delete anything on their behalf.
- **Skills** (`.claude/skills/`):
  - `grill-me` — a round of questions to settle the decisions of a plan before creating issues.
  - `impeccable` — interface design, review and polish (`/impeccable audit`, `polish`, `critique`...). Update it with `.claude/skills/impeccable/scripts/impeccable update`.
  - `new-component` — a new shared component in `components/blocks` or `components/ui`.
  - `new-entity` — a new end-to-end entity (model, provider, store, page, form, route and tests).
  - `review-copy` — reviews naming, comments, test descriptions, UI copy and docs.
- **Subagents** (`.claude/agents/`): `ui-reviewer` reviews the changed components and pages against the conventions in this file; the `impeccable-*` ones are used by the `impeccable` skill.
- `grill-me` and `grilling` are installed by the `skills` CLI (`pnpm dlx skills add mattpocock/skills --skill <name> -a claude-code`) and pinned in `skills-lock.json`. `impeccable` uses its own installer and downloads its binary (`scripts/bin/`, git-ignored) on first use. These third-party skills and agents are committed as they come: don't edit or translate them.
- `.claude/settings.json` asks for confirmation before every `git commit`, `git push`, `gh pr create` and Firebase MCP call.

## Development Workflow

The end-to-end flow (planning with `/grill-me`, issues, branches, commits, pull requests and closing) is described in [`docs/development-workflow.md`](./docs/development-workflow.md). Follow it for any issue. The rules below are mandatory.

## Branch Rules

Work for an issue is committed on a new branch, never directly on `main`. Branch names follow `<scope>/<title>#<issue>`:

- `<scope>` is one of the semantic prefixes from the Commit Rules below, without the emoji (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`, ...).
- `<title>` is a short, lowercase, hyphen-separated summary in English.
- `#<issue>` is the number of the associated issue.

Examples: `feat/orders-report#10`, `fix/invoice-race-condition#12`. `#` is special in shells, so quote the branch name in commands (e.g. `git switch -c 'feat/orders-report#10'`).

For a broad effort with a single scope (e.g. a code review covering several areas), prefer a single branch and a single pull request.

## Issue Rules

Before closing an issue, tick every completed checklist item (`- [x]`) in its body, e.g. with `gh issue edit <number> --body-file <file>`. Don't close an issue that still has unchecked items unless they were dropped or moved, and say so in the closing comment.

## Documentation Rules

`AGENTS.md` and `README.md` record only project conventions: what to do, where things live and how to handle a given case. Answers to the user's one-off questions (e.g. "why don't we use X?") stay in the conversation. Keep a "why" only when it prevents a likely mistaken "fix". If a task changes a convention, update `AGENTS.md` (and `README.md`, when it covers it) in the same branch.

If a task changes what the user sees or does (a page, a flow, a button, an imported file), update [`docs/local-testing.md`](./docs/local-testing.md) in the same branch. If it changes the data the manual test needs, also update `src/tests/seed.ts`.

## Task Rules

Never start working on a task on your own, even when asked to move on to the next one or in auto/agentic mode. First present a summary of the plan (the issue, branch name, steps, files touched and any open decisions) and wait for explicit approval before creating the branch, installing dependencies or editing code. Read-only investigation (issues, docs, code) needs no approval.

## Commit Rules

Never run `git commit` on your own, even in auto/agentic mode. Only propose a commit message when the user asks for one, and create the commit only after explicit approval of that message. The same applies to `git push` and to opening the pull request.

Commit messages must be in English and follow this format:

- Use the following semantic prefixes: `🎉 init, ✨ feat, 🐛 fix, 📚 docs, 💎 style, 📦 refactor, 🚀 perf, 🚨 test, 🛠 build, ⚙️ ci, ♻️ chore, 🗑 revert`
- The subject must be in the imperative mood and in lowercase.
- Write the body as a list.
- Reference an associated issue by number, if it exists, using the format `Issue: #<number>`.

Example:

```text
✨ feat: add products page

- Create products page
- Add products table
- Add products form

Issue: #1
```
