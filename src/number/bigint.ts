export const BigIntMath = {
    abs: (a: bigint) => (a < 0n ? -a : a),
    max: (a: bigint, b: bigint) => (a > b ? a : b),
    min: (a: bigint, b: bigint) => (a < b ? a : b),
    pow: (a: bigint, b: bigint) => a ** b,
    sign: (a: bigint) => (a === 0n ? 0n : (a < 0n ? -1n : 1n)),
}
