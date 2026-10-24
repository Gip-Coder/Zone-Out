import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // scratch/ holds untracked local benchmarking scripts, not application code
  globalIgnores(['dist', 'coverage', 'scratch']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // Core no-unused-vars does not see JSX usage such as <motion.div> or a
      // destructured `icon: Icon` rendered as <Icon />, so allow those names.
      'no-unused-vars': ['error', {
        varsIgnorePattern: '^([A-Z_]|motion$)',
        argsIgnorePattern: '^[A-Z_]',
        caughtErrors: 'none',
      }],
    },
  },
  // Context modules intentionally co-locate the context object, provider and
  // hook; this only affects Fast Refresh granularity in development.
  {
    files: ['src/**/context/**/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
  // Node.js code: the Express API, scripts, tooling and test setup
  {
    files: ['server/**/*.js', 'test/**/*.js', 'e2e/**/*.{js,mjs}', '*.config.js', '*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['*.cjs'],
    languageOptions: { sourceType: 'commonjs' },
  },
])
