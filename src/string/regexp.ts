export function escapeRegExp(input: string) {
    return input.replaceAll(/[$()*+.?[\\\]^{|}]/g, String.raw`\$&`).replaceAll('-', String.raw`\x2d`)
}
