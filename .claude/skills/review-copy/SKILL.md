---
name: review-copy
description: Review the text in the code — identifier naming, comments, test descriptions, UI copy and the docs — for spelling, grammar, consistency and the project's conventions, and report findings to accept. Use when asked to review naming, comments, wording or copy in a file, a diff or the whole project, and on a diff before opening a pull request.
---

Talk to the user in the language they write in. Report findings and propose exact replacements; apply only the ones the user accepts.

## Scope

Work on what the user names: a path, the current diff (`git diff main...HEAD` plus uncommitted changes), or the whole project. For the whole project, cover `src/`, `scripts/`, `generators/`, the configuration files at the root, `.github/`, `.claude/`, `.husky/`, `docs/`, `AGENTS.md` and `README.md`. Skip generated, vendored and third-party files: `dist`, `node_modules`, `pnpm-lock.yaml`, the fixtures in `src/tests/_mocks/`, the VR Software docs and query (`docs/contexto-integracao-vr.md`, `docs/query-sql.md`, `docs/tabelas-vr.md`, `docs/relacao-de-produtos-e-notas.md`, `src/components/blocks/catalog-import/_components/sql-query/query.ts`, which follow VR's schema) and the third-party skills and agents (`.claude/skills/impeccable/`, `grill-me`, `grilling` and `.claude/agents/impeccable-*`). Read the files before reporting.

The Language section in `AGENTS.md` says which texts are in English and which are in pt-BR: the code, comments, test descriptions and docs are in English; the UI copy, alerts, the issue template and `README.md` are in pt-BR. Check each text in its own language.

## Check

1. **Spelling**: run `pnpm spell:check` first and report what it finds (it skips `.claude/`, so read those files yourself), then read for what a dictionary can't catch (a real word in the wrong place). Typos in identifiers, comments, strings and docs, in both languages, including pt-BR diacritics (`não`, never `nao`). A legitimate term goes in `.cspell/project-words.txt`.
2. **Naming** (see Naming in `AGENTS.md`):
   - Correct English, including each word of a compound identifier and its grammatical number (`filterProducts` returns a list).
   - The name says what the thing is or does, at the level of the caller: no vague names (`data`, `handle`, `info`, `temp`) where a specific one fits, no names that lie about the type or the behavior, and no abbreviations beyond `props`, `ref`, `params`, `utils` and `env`.
   - Consistent patterns across the codebase: handlers `handle[Subject][Action]` (`on*` only for native DOM events, `onSubmit` the only exception), `form[Entity]`, `[entity]ToDelete`, `is*`/`has*` for booleans, `quickCreate[Entity]`, `use*` only for hooks (`use-<page>-handler.ts`, `use-<entity>-mutation.ts`), `<entity>Model` for models, `T*` for types, `SCREAMING_SNAKE_CASE` for collection paths and `MAX_*` constants, components in PascalCase and files in kebab-case.
   - The same concept has the same name everywhere (e.g. `invoice` vs `note`, `quote` vs `quotation`, `supplier` vs `vendor`), in code, tests and docs.
3. **Comments**: grammar, and the project rule from `AGENTS.md`: a comment only records why a decision was made, ideally with a reference; flag comments that explain what the code does or how it works, comments not in English, and comments that are stale (the reason no longer applies or the reference is gone).
4. **Test descriptions**: grammar, and whether each `describe`/`it`/`test` reads as a sentence that states the expected behavior (`test('flags products below the minimum margin')`), consistent in tense and person within a file.
5. **UI copy (pt-BR)**: grammar and standard pt-BR, a consistent tone across pages, the same term for the same thing everywhere (e.g. "nota" vs "nota fiscal", "cotação", "pedido", "fornecedor"), alerts and error messages that say what happened and what to do next (the `labels` of the mutations, `useAlertStore`), accessible names (`aria-label`, `Tooltip` titles, `TextField` labels, dialog titles) that describe the purpose, and empty-state messages (`DataView`'s `emptyMessage`).
6. **Docs** (`AGENTS.md`, `README.md`, `docs/`, `.claude/`, the issue and PR templates): grammar, consistency with the code (paths, script names and file names that still exist), consistency between `AGENTS.md` and `README.md` (the commands and the environment variables table), and the Documentation Rules in `AGENTS.md`.

## Report

Group findings by severity, most severe first:

- **Error**: typos, grammar mistakes, names or comments that are wrong or misleading, docs that contradict the code.
- **Improvement**: unclear or inconsistent naming, comments that break the project rule, test descriptions that don't state the behavior.
- **Suggestion**: optional wording.

For each finding: `path:line`, the current text, the proposed text and a one-line reason. Mark renames of exported symbols or files, since they touch other files; list where they're used. Skip categories with no findings.

Then ask which findings to apply. Apply renames across every usage (code, tests, docs), then run `pnpm type-check`, `pnpm eslint:check`, `pnpm prettier:check`, `pnpm spell:check` and `pnpm test`.
