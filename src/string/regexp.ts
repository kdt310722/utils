export function escapeRegExp(input: string) {
    return input.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&').replaceAll('-', '\\x2d')
}
