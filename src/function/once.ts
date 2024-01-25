import type { Args, Fn } from './types'

export function once<T extends Fn>(fn: T) {
    let called = false
    let result: ReturnType<T>

    return (...args: Args<T>) => {
        if (called) {
            return result
        }

        called = true
        result = fn(...args)

        return result
    }
}
