---
name: new-component
description: Cria um novo componente compartilhado em src/components/blocks ou src/components/ui seguindo o gerador plop e as convenções do projeto (style.ts, imports pelo próprio arquivo, MUI). Use quando pedirem um novo componente reutilizável entre páginas — não para componentes privados de uma página (esses ficam em pages/<pagina>/_components).
---

## Onde o componente vai

- `src/components/ui/` — primitivo genérico, sem conhecimento de domínio (ex: `currency-input`, `modal`). Não importa de `@/models/*` nem de `@/stores/*`.
- `src/components/blocks/` — componente do domínio reutilizado em mais de uma página (ex: `family-form`, `page-header`, `catalog-import`).
- Usado por uma página só? Não é compartilhado: crie em `src/pages/<pagina>/_components/<nome>/`.

## Passos

1. Rode `pnpm generate component <blocks|ui> <nome-em-kebab-case>`. O plop cria `src/components/<blocks|ui>/<nome>/index.tsx` e `style.ts`. Não há barrel: quem usa o componente importa de `@/components/ui/<nome>` (ou `@/components/blocks/<nome>`).
2. Implemente seguindo o `AGENTS.md`:
   - arrow functions e props tipadas como `T<Nome>Props`;
   - estilos em `style.ts` (`SxProps<Theme>`), importados como `* as S`;
   - props de ação no padrão `handle[Sujeito][Ação]`; `on*` só para eventos DOM repassados;
   - inputs de texto com `textTransform: 'uppercase'`, `onFocus={selectOnFocus}` e `maxLength` a partir de constantes;
   - lógica não trivial em um hook `use-<nome>-handler.ts` (ou `use-form-handler.ts` para formulários, com `schema.ts`).
3. Rode `pnpm eslint:check` e `pnpm prettier:check`. Se o componente tiver lógica própria (cálculo, filtro, mapeamento), extraia-a para uma função pura e teste em um `*.test.ts` ao lado dela; fluxos de UI ficam no Playwright.
4. Rode o subagente `ui-reviewer` sobre a mudança.
