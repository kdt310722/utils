import type { Nullable } from '../common'
import type { Fn } from './types'

export const isFunction = <T extends Fn>(value: unknown): value is T => typeof value === 'function'

export const noop = () => void 0

export const invoke = <F extends Fn>(fn: F) => fn()

export function batchInvoke(functions: Array<Nullable<Fn>>) {
    for (const fn of functions) {
        fn?.()
    }
}

export function tap<T>(value: T, callback: (value: T) => void) {
    callback(value)

    return value
}

export function tryCatch<T>(fn: () => T, fallback: T, throwsIf?: (error: unknown) => boolean) {
    try {
        return fn()
    } catch (error) {
        if (throwsIf?.(error)) {
            throw error
        }

        return fallback
    }
}
