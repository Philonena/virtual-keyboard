module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
    'import/extensions': ['error', { js: 'always' }],
    'no-param-reassign': ['error', { props: false }],
    'no-unused-expressions': ['error', { allowTernary: true }],
  },
};
