export function push<T>(array: T[], ...values: T[]) {
    array.push(...values)

    return array
}

export function insert<T>(array: T[], index: number, ...values: T[]) {
    array.splice(index, 0, ...values)

    return array
}

export function remove<T>(array: T[], value: T) {
    const index = array.indexOf(value)

    if (index !== -1) {
        array.splice(index, 1)
    }

    return array
}

export function removeAt<T>(array: T[], index: number) {
    array.splice(index, 1)

    return array
}

export function move<T>(array: T[], from: number, to: number) {
    if (from < array.length && to < array.length && from !== to) {
        array.splice(to, 0, array.splice(from, 1)[0])
    }

    return array
}

export function swap<T>(array: T[], a: number, b: number) {
    const temp = array[a]

    if (a < array.length && b < array.length && a !== b) {
        array[a] = array[b]
        array[b] = temp
    }

    return array
}

export function at(array: [], index: number): undefined
export function at<T>(array: T[], index: number): T

export function at<T>(array: T[] | [], index: number): T | undefined {
    return array.at(index)
}

export function last(array: []): undefined
export function last<T>(array: T[]): T

export function last<T>(array: T[]): T | undefined {
    return at(array, -1)
}

export function shuffle<T>(input: T[]): T[] {
    const array = [...input]

    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]
    }

    return array
}

export function sample<T>(array: T[], quantity = 1) {
    return Array.from({ length: quantity }, () => array[Math.round(Math.random() * (array.length - 1))])
}
