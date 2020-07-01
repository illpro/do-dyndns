module.exports = {
    'extends': 'eslint:recommended',
    'env': {
        'node': true,
        'browser': false,
        'es6': true,
    },
    'parserOptions': {
        'ecmaVersion': 2019,
        'sourceType': 'module',
    },
    'rules': {
        'no-undef': 'warn',
        'semi': ['error', 'never'],
        'quotes': ['error', 'single'],
    }
}
