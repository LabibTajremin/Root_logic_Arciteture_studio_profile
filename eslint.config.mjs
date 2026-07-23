import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';
import importPlugin from 'eslint-plugin-import';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: __dirname });

const layerBoundaries = {
  plugins: { import: importPlugin },
  settings: {
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
    },
  },
  rules: {
    // Clean-architecture dependency rule: domain and application must not depend
    // on infrastructure, framework, or delivery layers.
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          {
            target: './src/domain',
            from: './src/infrastructure',
            message: 'domain must not import from infrastructure.',
          },
          {
            target: './src/domain',
            from: './src/application',
            message: 'domain must not import from application.',
          },
          {
            target: './src/domain',
            from: './src/app',
            message: 'domain must not import from app (Next.js layer).',
          },
          {
            target: './src/domain',
            from: './src/presentation',
            message: 'domain must not import from presentation.',
          },
          {
            target: './src/application',
            from: './src/infrastructure',
            message: 'application must not import from infrastructure.',
          },
          {
            target: './src/application',
            from: './src/app',
            message: 'application must not import from app (Next.js layer).',
          },
          {
            target: './src/application',
            from: './src/presentation',
            message: 'application must not import from presentation.',
          },
        ],
      },
    ],
  },
};

const eslintConfig = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'playwright-report/**',
      'test-results/**',
      'drizzle/**',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  layerBoundaries,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
];

export default eslintConfig;
