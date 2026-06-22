// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      'no-console': [
        'error',
        {
          allow: ['error', 'warn', 'info', 'debug', 'table', 'trace'], // Only block console.log, allow other methods
        },
      ],
      'react/display-name': 'off', // Disable display name warning
      'no-unused-expressions': 'off',
      'import/no-named-as-default-member': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      'react/no-unknown-property': 'off',
      'eqeqeq': 'off',
      '@typescript-eslint/no-useless-constructor': 'off',
    },
  },
]);
