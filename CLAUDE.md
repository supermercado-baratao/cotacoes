# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Sobre o projeto

Aplicação web para gerenciamento de cotações e controle de pedidos para supermercados. Stack: React 19 + TypeScript + Vite + MUI + Firebase Firestore.

## Commands

```bash
pnpm dev              # start development server
pnpm build            # production build (tsc + vite build)
pnpm test             # run tests once
pnpm test:watch       # run tests in watch mode
pnpm eslint:check     # lint check
pnpm eslint:fix       # auto-fix lint issues
pnpm prettier:fix     # format code
pnpm generate         # generate new component via plop
```

To run a single test file:

```bash
pnpm vitest run src/tests/app.test.tsx
```

## Environment Setup

Copy `.env.example` to `.env` and fill in Firebase credentials:

```text
VITE_API_KEY
VITE_AUTH_DOMAIN
VITE_PROJECT_ID
VITE_STORAGE_BUCKET
VITE_MESSAGING_SENDER_ID
VITE_APP_ID
VITE_APP_MEASUREMENT_ID
```

## Architecture

### Directory Structure

```text
src/
├── components/          # Reusable UI components
│   ├── app-layout/      # Layout wrapper with navigation
│   ├── forms/           # Shared entity forms (FamilyForm, SellerForm, SupplierForm)
│   ├── page-header/     # Page title + search + create button
│   └── ui/              # Generic UI primitives (Modal, Dialog, Loader, Table, Autocomplete)
├── infra/               # Infrastructure layer (Firestore access)
├── models/              # Domain models (entity-specific operations)
│   └── product-model/   # Example: product CRUD operations
├── pages/               # Route-level pages
│   └── products/        # Products page with private components
│       └── _components/ # Page-private components (not shared)
├── providers/           # React context providers
│   └── app-provider/    # Main app orchestrator (React Query + Zustand)
├── stores/              # Zustand global state stores
├── themes/              # MUI theme configuration (dark/light)
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Layers

**`src/infra/`** — database access layer. `database.ts` exposes a generic `database` object with methods (`findMany`, `create`, `update`, `deleteUniqueById`, etc.) over Firestore. All documents automatically receive `id`, `createdAt`, and `updatedAt`.

**`src/models/`** — domain models. Each model (e.g., `productModel`) defines business operations by calling `database` with the Firestore collection path. This is where new entity types are added.

**Example model structure:**

```typescript
// models/product-model/model.ts
import { database } from '@/infra'
import type { TCreateData, TUpdateData } from '@/types'

import { type TProduct } from './types'

const PATH = 'products'

const create = async (data: TCreateData<TProduct>): Promise<TProduct> => {
  return database.create({ path: PATH, data })
}

const findMany = async (): Promise<TProduct[]> => {
  return database.findMany<TProduct>({ path: PATH })
}

const update = async (data: TUpdateData<TProduct>): Promise<TProduct> => {
  return database.update<TProduct>({ path: PATH, data })
}

const deleteUniqueById = async (id: string): Promise<string> => {
  return database.deleteUniqueById({ path: PATH, id })
}

export const productModel = {
  create,
  findMany,
  update,
  deleteUniqueById
}
```

**`src/providers/app-provider/`** — central application orchestrator. Uses React Query for data fetching and mutations. Injects mutation functions directly into Zustand store (`useAppStore`) via `useEffect`. This allows any component to trigger mutations through the store without needing React Query hooks.

**`src/stores/`** — global state with Zustand:

- `useAppStore` — application data (products, etc.); mutation functions (`createProduct`, `updateProduct`, `deleteProduct`) are populated by `AppProvider`
- `useAlertStore` — global snackbar/alert notifications
- `useCallbackStore` — success/error callbacks registered by components before triggering mutations

### Data Flow

```text
Component → useAppStore.createProduct() → useMutation (React Query)
                                         → onSuccess: invalidate query + alert + callbacks
                                         → onError: alert + callbacks
```

**Callback pattern** (`useCallbackStore`): Allows a component to register what should happen after a mutation succeeds or fails (e.g., close modal) without coupling the component to the provider.

### Page Pattern Example

**`pages/products/use-products-handler.ts`** — custom hook that encapsulates page logic:

- Manages local UI state (form open/close, item to delete, search)
- Uses `useAppStore` to access global products and mutations
- Exposes handlers for user interactions following the naming conventions below

**`pages/products/_components/form/use-form-handler.ts`** — form-specific logic:

- Uses `react-hook-form` with Zod validation
- Registers callbacks via `useCallbackStore` for post-mutation actions

### Form Pattern

Forms follow a consistent pattern:

1. **`schema.ts`** — Zod schema with validation rules and exported MAX\_\* constants
2. **`use-form-handler.ts`** — custom hook for form logic (defaults, validation, submission)
3. **`style.ts`** — MUI sx properties for styling
4. **`index.tsx`** — component rendering with MUI components

**Example `use-form-handler.ts`:**

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
      barcode: product?.barcode ?? null,
      tax: product?.tax ?? null,
      margin: product?.margin ?? null,
      observations: product?.observations ?? null,
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
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues
  })

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

### Loading and Empty State Pattern

Every page uses `null` as the initial state for data (before first fetch) and `[]` for an empty list after fetch. Use `isFetching` and `hasX` flags derived from these:

```typescript
const isFetching = products === null   // true only during initial load
const hasProducts = !!products?.length // false when empty array

// In JSX:
{isFetching ? (
  <Loader />
) : hasProducts ? (
  <Table products={filteredProducts!} ... />
) : (
  <Typography>Você ainda não tem nenhum produto...</Typography>
)}
```

### Shared Table Component

`src/components/ui/table.tsx` provides a generic `<Table>` that wraps MUI DataGrid with Edit/Delete action columns. Each page's private `_components/table/index.tsx` wraps this generic component with entity-specific typing and column definitions:

```typescript
// pages/products/_components/table/index.tsx
import { Table as _Table } from '@/components'
import type { TProduct } from '@/models'
import { columns } from './columns'

export const Table = ({ products, handleEdit, handleDelete }: TTableProps) => (
  <_Table columns={columns} items={products} handleEdit={handleEdit} handleDelete={handleDelete} />
)
```

### Component Generator

```bash
pnpm generate
```

Creates `src/components/<name>/index.tsx` and `style.ts`, and automatically updates `src/components/index.ts`.

## Key Utilities

- `selectOnFocus` — selects all text when input receives focus

## Type System

**`src/types/generics.ts`** provides helper types:

- `TCreateData<T>` — omits `id`, `createdAt`, `updatedAt` for create operations
- `TUpdateData<T>` — requires `id` and partial data for updates

## Conventions

- Path alias `@/` points to `src/`
- Each module exports via `index.ts` in its folder
- Component styles go in separate `style.ts` file using `MUI SxProps<Theme>`
- Text inputs use `textTransform: 'uppercase'` (see `style.ts`)
- Number inputs have defined `min`/`max` from schema constants
- Text inputs have defined `maxLength` from schema constants
- Always use arrow functions
- Collection path constants in models use `SCREAMING_SNAKE_CASE` (e.g., `const PATH = 'products'`)
- Firestore IDs are validated with `z.string()`, not `z.uuid()`, since Firestore generates non-UUID IDs
- Nullable fields default to `null` in form `defaultValues` (not `0` or `''`) to preserve database semantics

## Naming Conventions

Handler and variable names follow the **`[Subject][Action]`** order — subject (the component or element) comes before the action (the event or verb).

### Handler functions — `handle[Subject][Action]`

| Pattern                 | Example                                                                          | Rule                             |
| ----------------------- | -------------------------------------------------------------------------------- | -------------------------------- |
| UI element + DOM event  | `handleAddClick`                                                                 | Add = element, Click = event     |
| Form modal + action     | `handleFormOpen`, `handleFormEdit`, `handleFormClose`                            | Form = the modal component       |
| DeleteDialog + action   | `handleDeleteDialogOpen`, `handleDeleteDialogClose`, `handleDeleteDialogConfirm` | Use component name               |
| Table action props      | `handleEdit`, `handleDelete`                                                     | Short; action is self-describing |
| Autocomplete add button | `handleAddClick`                                                                 |                                  |

**Exception:** `onSubmit` — kept as-is because it matches the native `<form onSubmit>` prop and would conflict with react-hook-form's `handleSubmit`.

### State variables

| Pattern              | Example                                    | Rule                                   |
| -------------------- | ------------------------------------------ | -------------------------------------- |
| Entity in form       | `formProduct`, `formSeller`                | `form[Entity]` — context before entity |
| Entity being deleted | `productToDelete`, `sellerToDelete`        | `[entity]ToDelete`                     |
| Boolean state        | `isFormOpen`, `isFetching`, `hasProducts`  | `is[Subject][State]`, `has[Subject]`   |
| Quick-create flag    | `quickCreateFamily`, `quickCreateSupplier` | `quickCreate[Entity]`                  |

### Component props

Props on shared components follow the same `handle[Subject][Action]` rule. Use `on*` only for native DOM event props (e.g., `onFocus`, `onChange`) passed through to underlying HTML elements.

## Commit Convention

Commit messages must be in English and follow this format:

- Use the following semantic prefixes: '🎉 init, ✨ feat, 🐛 fix, 📚 docs, 💎 style, 📦 refactor, 🚀 perf, 🚨 test, 🛠 build, ⚙️ ci, ♻️ chore, 🗑 revert'
- The message must be imperative and in lowercase.
- Write the commit body as a list
- Reference the associated issue by number if exists using `Issue: #<number>` format.

Example:

```text
✨ feat: add products page

- Create products page
- Add products table
- Add products form

Issue: #1
```
