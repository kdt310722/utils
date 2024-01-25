import pRetry from 'p-retry'
import type { Fn } from '../function'
import { sleep } from './sleep'
import type { RetryOptions } from './types'

export function withRetry<T extends Fn>(fn: T, maxAttempts?: number, delay?: number): Promise<ReturnType<T>>

export function withRetry<T extends Fn>(fn: T, options?: RetryOptions): Promise<ReturnType<T>>

export function withRetry<T extends Fn>(fn: T, params: RetryOptions | number = {}, delay?: number): Promise<ReturnType<T>> {
    const options: RetryOptions = typeof params === 'number' ? { retries: params, delay } : params

    return pRetry(fn, {
        ...options,
        onFailedAttempt: async (error) => {
            await sleep(options.delay ?? 0)
            await options.onFailedAttempt?.(error)
        },
    })
}
