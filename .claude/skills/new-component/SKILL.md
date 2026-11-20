---
name: new-component
description: Creates a new shared component in src/components/blocks or src/components/ui following the plop generator and the project conventions (style.ts, imports from the component's own file, MUI). Use when asked for a new component reused across pages — not for a page's private components (those live in pages/<page>/_components).
---

## Where the component goes

- `src/components/ui/` — a generic primitive, with no domain knowledge (e.g. `currency-input`, `modal`). It doesn't import from `@/models/*` or `@/stores/*`.
- `src/components/blocks/` — a domain component reused by more than one page (e.g. `family-form`, `page-header`, `catalog-import`).
- Used by a single page? It isn't shared: create it in `src/pages/<page>/_components/<name>/`.

## Steps

1. Run `pnpm generate component <blocks|ui> <kebab-case-name>`. Plop creates `src/components/<blocks|ui>/<name>/index.tsx` and `style.ts`. There is no barrel: whoever uses the component imports it from `@/components/ui/<name>` (or `@/components/blocks/<name>`).
2. Implement it following `AGENTS.md`:
   - arrow functions and props typed as `T<Name>Props`;
   - styles in `style.ts` (`SxProps<Theme>`), imported as `* as S`;
   - action props following `handle[Subject][Action]`; `on*` only for DOM events passed down;
   - text inputs with `textTransform: 'uppercase'`, `onFocus={selectOnFocus}` and a `maxLength` from constants;
   - UI copy in Portuguese;
   - non-trivial logic in a `use-<name>-handler.ts` hook (or `use-form-handler.ts` for forms, with `schema.ts`).
3. Run `pnpm eslint:check` and `pnpm prettier:check`. If the component has logic of its own (a calculation, filter or mapping), extract it into a pure function and test it in a `*.test.ts` next to it; UI flows belong in Playwright.
4. Run the `ui-reviewer` subagent on the change.
