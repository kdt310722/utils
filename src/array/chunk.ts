import { isArray, isIterable } from './array'

export function chunk<T>(arr: Iterable<T>, size: number): Iterable<T[]> {
    if (!isIterable(arr)) {
        throw new Error('Expected an iterable as the first argument')
    }

    if (!Number.isSafeInteger(size) || size < 1) {
        throw new Error('Expected `size` to be a positive integer')
    }

    return {
        * [Symbol.iterator]() {
            if (isArray(arr)) {
                for (let i = 0; i < arr.length; i += size) {
                    yield arr.slice(i, i + size)
                }

                return
            }

            let chunk: T[] = []

            for (const value of arr) {
                chunk.push(value)

                if (chunk.length === size) {
                    yield chunk
                    chunk = []
                }
            }

            if (chunk.length > 0) {
                yield chunk
            }
        },
    }
}
