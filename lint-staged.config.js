const eslint = 'pnpm exec eslint --fix --no-warn-ignored'
const prettier = 'pnpm exec prettier --write --ignore-unknown'
const cspell = 'pnpm exec cspell --no-progress --dot --no-must-find-files'

export default {
  '*.{js,jsx,ts,tsx,mjs,cjs}': [
    eslint,
    prettier,
    cspell,
    'pnpm exec vitest related --run --passWithNoTests'
  ],
  '*.{md,json}': [eslint, prettier, cspell],
  '*.{yml,yaml}': [prettier, cspell]
}
