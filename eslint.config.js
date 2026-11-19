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
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const relativeImportPatterns = [
  {
    regex: String.raw`^\.\./`,
    message: 'Use `@/` to import from outside the current folder.'
  },
  {
    regex: String.raw`^\./[^/]+/[^/]+/`,
    message: 'Use `./` only for the same folder or a direct subfolder.'
  }
]

const layerImportPatterns = (layer, forbiddenLayers, typeOnlyLayers = []) => [
  ...relativeImportPatterns,
  ...forbiddenLayers.map((forbiddenLayer) => ({
    group: [`@/${forbiddenLayer}`, `@/${forbiddenLayer}/**`],
    message: `\`${layer}\` must not import from \`${forbiddenLayer}\`.`
  })),
  ...typeOnlyLayers.map((typeOnlyLayer) => ({
    group: [`@/${typeOnlyLayer}`, `@/${typeOnlyLayer}/**`],
    allowTypeImports: true,
    message: `\`${layer}\` may only import types from \`${typeOnlyLayer}\`.`
  }))
]

const layerRules = (layer, forbiddenLayers, typeOnlyLayers) => ({
  files: [`src/${layer}/**/*.{ts,tsx}`],
  ignores: ['src/**/*.test.{ts,tsx}'],
  rules: {
    '@typescript-eslint/no-restricted-imports': [
      'error',
      { patterns: layerImportPatterns(layer, forbiddenLayers, typeOnlyLayers) }
    ]
  }
})

const UPPER_LAYERS = ['pages', 'layout']

export default defineConfig([
  globalIgnores([
    'dist',
    '.claude',
    'test-results',
    'playwright-report',
    'blob-report',
    '.playwright-mcp',
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
      unicorn.configs.recommended,
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
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'unicorn/name-replacements': [
        'error',
        {
          replacements: {
            env: false,
            params: false,
            props: false,
            ref: false,
            utils: false
          }
        }
      ],
      'unicorn/filename-case': [
        'error',
        {
          case: 'kebabCase',
          ignore: [String.raw`^App\.tsx$`, String.raw`^Router\.tsx$`]
        }
      ],
      'unicorn/consistent-boolean-name': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/max-nested-calls': 'off',
      'unicorn/no-array-callback-reference': 'off',
      'unicorn/no-asterisk-prefix-in-documentation-comments': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-top-level-side-effects': 'off',
      'unicorn/prefer-await': 'off',
      'unicorn/prefer-default-parameters': 'off',
      'unicorn/prefer-iterator-to-array': 'off',
      'unicorn/prefer-smaller-scope': 'off',
      'unicorn/prefer-ternary': 'off',
      'unicorn/single-line-block-comment-style': 'off'
    }
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: relativeImportPatterns }
      ]
    }
  },
  layerRules('components', UPPER_LAYERS),
  layerRules('hooks', UPPER_LAYERS),
  layerRules('providers', [...UPPER_LAYERS, 'components/blocks', 'hooks']),
  layerRules('stores', [...UPPER_LAYERS, 'components', 'hooks', 'providers']),
  layerRules('models', [
    ...UPPER_LAYERS,
    'components',
    'hooks',
    'providers',
    'stores'
  ]),
  layerRules(
    'infra',
    [...UPPER_LAYERS, 'components', 'hooks', 'providers', 'stores'],
    ['models']
  ),
  ...['constants', 'types', 'utils'].map((leaf) =>
    layerRules(
      leaf,
      [...UPPER_LAYERS, 'components', 'hooks', 'providers', 'stores', 'infra'],
      ['models']
    )
  ),
  {
    files: ['src/tests/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: {
      'unicorn/no-unnecessary-parameters': 'off',
      'unicorn/prefer-dom-node-text-content': 'off'
    }
  }
])
