module.exports = {
  env: {
    "browser": true,
    "es6": true,
    "node": true,
    "commonjs": true
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended"
  ],
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    // 'import/no-extraneous-dependencies': 'off',
    'react/jsx-filename-extension': 'off',
    'no-case-declarations': 'off',
    'react/prop-types': 'off'
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.js'),
      },
    }
  },
};