import type { Options } from 'p-retry'

export type Awaitable<T> = T | PromiseLike<T>

export interface PromiseLock {
    run: <T = void>(fn: () => Promise<T>) => Promise<T>
    wait: () => Promise<void>
    clear: () => void
    isWaiting: () => boolean
}

export type RetryOptions = Exclude<Options, number[]> & {
    delay?: number
}
