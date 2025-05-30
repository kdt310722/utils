export default import('@kdt310722/eslint-config').then((m) => m.defineFlatConfig({}, { ignores: ['test'] }, {
    rules: {
        'ts/prefer-promise-reject-errors': 'off',
    },
}))
