module.exports = {
  env: {
    jest: true,
    commonjs: true,
    es6: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    document: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
  rules: {
  },
};
