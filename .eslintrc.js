module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
    project: ['./tsconfig.json'],
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'next/core-web-vitals', // Next.js recommended rules
    'eslint:recommended', // ESLint core rules
    'plugin:@typescript-eslint/recommended', // TS rules
    'plugin:prettier/recommended', // Enables eslint-plugin-prettier & displays Prettier errors as ESLint errors
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // your custom overrides go here, for example:
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
}
