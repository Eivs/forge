// eslint.config.js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';

export default [
  // 忽略特定文件和目录
  {
    ignores: ['dist/**', 'build/**', 'node_modules/**', '.prisma/**', 'prisma/migrations/**', './.*', './*.config.js'],
  },

  // 基础 JavaScript 规则
  js.configs.recommended,

  // TypeScript 规则
  ...tseslint.configs.recommended,

  // React 规则
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Prettier 规则
      'prettier/prettier': 'error',

      // React 规则
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // TypeScript 规则
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'off',

      // 通用规则
      'no-console': 'off',
      // 'no-console': ['warn', { allow: ['warn', 'error'] }],

      // React Hooks 规则
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
