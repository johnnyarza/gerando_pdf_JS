module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
    ],
    'class-methods-use-this': 'off',
    'no-param-reassign': 'off',
    camelcase: 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: 'next' }],
    'no-unused-vars': ['warn', { argsIgnorePattern: '_' }],
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/__mocks__/**'],
      env: {
        jest: true,
      },
    },
  ],
};
