module.exports = {
    'extends': 'eslint:recommended',
    'env': {
        'node': true,
        'browser': false,
    },
    'parserOptions': {
        'ecmaVersion': 8,
        'sourceType': 'module',
    },
    'rules': {
        'no-undef': 'warn',
        'semi': ['error', 'never'],
        'quotes': ['error', 'single'],
    }
}
