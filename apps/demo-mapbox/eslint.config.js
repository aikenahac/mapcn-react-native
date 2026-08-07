// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const tseslint = require('@typescript-eslint/eslint-plugin');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic',
        },
      ],
    }
  },
]);
