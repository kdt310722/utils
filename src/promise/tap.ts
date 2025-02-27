import type { Awaitable } from './types'

export const tap = <T>(fn: (value: T) => Awaitable<unknown>) => async (value: T): Promise<T> => {
    return Promise.resolve(fn(value)).then(() => value)
}

tap.catch = (fn: (error: unknown) => Awaitable<unknown>) => async (error: unknown): Promise<never> => {
    await fn(error)
    throw error
}
