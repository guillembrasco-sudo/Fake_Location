import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'
import { defineConfig, globalIgnores } from 'eslint/config'

const tsPlugin = tseslint.default ?? tseslint
const reactHooksPlugin = reactHooks.default ?? reactHooks
const reactRefreshPlugin = reactRefresh.default ?? reactRefresh

export default defineConfig([
  globalIgnores(['dist/**', 'android/**', 'node_modules/**']),
  js.configs.recommended,
  tsPlugin.configs['flat/recommended'],
  reactHooksPlugin.configs.flat.recommended,
  reactRefreshPlugin.configs.vite,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
