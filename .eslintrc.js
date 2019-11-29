module.exports = {
    parserOptions: {
        parser: 'babel-eslint',
    },
    extends: [
        'airbnb-base',
        'plugin:vue/recommended',
    ],
    rules: {
        'global-require': 'off',
        'no-param-reassign': 'off',
        'no-plusplus': 'off',
        'no-underscore-dangle': 'off',
        'no-use-before-define': 'off',
        'import/no-extraneous-dependencies': 'off',
    },
};
