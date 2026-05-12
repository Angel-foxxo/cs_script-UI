import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import stylistic from '@stylistic/eslint-plugin'

export default defineConfig([

  { ignores: ["**/*.js", "**/*.mjs", "**/*.cjs"] },
  js.configs.recommended,
  {
    plugins: {
      '@stylistic': stylistic
    },
    files: ["src/**/*.ts"],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/eol-last': ['error', 'always'],
      '@stylistic/no-multiple-empty-lines': ['error', { max: 1 }],
      '@stylistic/type-annotation-spacing': 'error',
      '@stylistic/comma-spacing': ['error', { before: false, after: true }],
      '@stylistic/array-bracket-spacing': ['error', 'never'],
      '@stylistic/object-curly-spacing': ['error', 'always'],
      '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/no-multi-spaces': 'error',
      '@stylistic/space-before-function-paren': ['error', 'never'],
      '@stylistic/indent': ['error', 4],
      '@stylistic/brace-style': ['error', 'allman'],
      '@stylistic/keyword-spacing': ['error', { before: true, after: true }],
      "@stylistic/semi": ["error", "always"],
      "prefer-const": "error",
      "@typescript-eslint/array-type": ["error", { "default": "array" }],
      "@typescript-eslint/await-thenable": "error",
    },
  },
  {
    // eslint config file gets non-type-checked rules only
    files: ["eslint.config.ts"],
    extends: [...tseslint.configs.recommended],
  },
]);