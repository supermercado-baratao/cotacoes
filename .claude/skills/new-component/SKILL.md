---
name: new-component
description: Cria um novo componente compartilhado em src/components/blocks ou src/components/ui seguindo o gerador plop e as convenções do projeto (style.ts, barrel index.ts, MUI). Use quando pedirem um novo componente reutilizável entre páginas — não para componentes privados de uma página (esses ficam em pages/<pagina>/_components).
---

## Onde o componente vai

- `src/components/ui/` — primitivo genérico, sem conhecimento de domínio (ex: `currency-input`, `modal`). Não importa de `@/models` nem de `@/stores`.
- `src/components/blocks/` — componente do domínio reutilizado em mais de uma página (ex: `family-form`, `page-header`, `catalog-import`).
- Usado por uma página só? Não é compartilhado: crie em `src/pages/<pagina>/_components/<nome>/` e exporte por `_components/index.ts`.

## Passos

1. Rode `pnpm generate component <nome-em-kebab-case>`. O plop cria `src/components/<nome>/index.tsx` e `style.ts` e adiciona `export * from './<nome>'` em `src/components/index.ts`.
2. Mova a pasta para `src/components/ui/<nome>` ou `src/components/blocks/<nome>` e corrija a linha em `src/components/index.ts` para `export * from './ui/<nome>'` (ou `./blocks/<nome>`), mantendo a ordem alfabética.
3. Implemente seguindo o `AGENTS.md`:
   - arrow functions e props tipadas como `T<Nome>Props`;
   - estilos em `style.ts` (`SxProps<Theme>`), importados como `* as S`;
   - props de ação no padrão `handle[Sujeito][Ação]`; `on*` só para eventos DOM repassados;
   - inputs de texto com `textTransform: 'uppercase'`, `onFocus={selectOnFocus}` e `maxLength` a partir de constantes;
   - lógica não trivial em um hook `use-<nome>-handler.ts` (ou `use-form-handler.ts` para formulários, com `schema.ts`).
4. Dentro de `src/components`, importe outros componentes pelo caminho relativo (ex: `../../ui/loader`) quando o barrel `@/components` causar import circular.
5. Rode `pnpm eslint:check` e `pnpm prettier:check`. Se o componente tiver lógica própria (cálculo, filtro, mapeamento), extraia-a para uma função pura e teste em `src/tests/vitest`; fluxos de UI ficam no Playwright.
6. Rode o subagente `ui-reviewer` sobre a mudança.
