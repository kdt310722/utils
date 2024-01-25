export function sum(array: number[]) {
    return array.reduce((a, b) => a + b, 0)
}

export function sumBigint(array: bigint[]) {
    return array.reduce((a, b) => a + b, 0n)
}

export function avg(array: number[]) {
    return sum(array) / array.length
}

export function avgBigint(array: bigint[]) {
    if (array.length === 0) {
        return 0n
    }

    return sumBigint(array) / BigInt(array.length)
}
