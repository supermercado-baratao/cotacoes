import js from '@eslint/js'
import json from '@eslint/json'
import markdown from '@eslint/markdown'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import preferArrowFunctions from 'eslint-plugin-prefer-arrow-functions'
import pluginPromise from 'eslint-plugin-promise'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores([
    'dist',
    '.claude',
    'test-results',
    'playwright-report',
    'blob-report',
    '.playwright-mcp',
    '.pnpm-store',
    'src/tests/_mocks'
  ]),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      preferArrowFunctions.configs.all,
      pluginPromise.configs['flat/recommended'],
      eslintConfigPrettier
    ],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      'prefer-arrow-functions/prefer-arrow-functions': 'error'
    }
  },
  { plugins: { 'simple-import-sort': simpleImportSort } },
  {
    files: ['**/*.md'],
    plugins: { markdown },
    language: 'markdown/gfm',
    extends: ['markdown/recommended']
  },
  {
    files: ['**/*.json'],
    ignores: ['**/tsconfig*.json', '.vscode/*.json'],
    plugins: { json },
    language: 'json/json',
    extends: ['json/recommended']
  },
  {
    files: ['**/tsconfig*.json', '.vscode/*.json'],
    plugins: { json },
    language: 'json/jsonc',
    languageOptions: { allowTrailingCommas: true },
    extends: ['json/recommended']
  },
  {
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-expressions': 'off'
    }
  }
])
