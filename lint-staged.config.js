const eslint = 'pnpm exec eslint --fix --no-warn-ignored'
const prettier = 'pnpm exec prettier --write --ignore-unknown'

export default {
  '*.{js,jsx,ts,tsx,mjs,cjs}': [
    eslint,
    prettier,
    'pnpm exec vitest related --run --passWithNoTests'
  ],
  '*.md': [eslint, prettier],
  '*.{json,yml,yaml}': prettier
}
