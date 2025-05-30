import type { Awaitable } from './types'

export const pTap = <T>(fn: (value: T) => Awaitable<unknown>) => async (value: T): Promise<T> => {
    return Promise.resolve(fn(value)).then(() => value)
}

pTap.catch = (fn: (error: unknown) => Awaitable<unknown>) => async (error: unknown): Promise<never> => {
    await fn(error)
    throw error
}

export const tap = pTap
