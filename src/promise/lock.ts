import type { PromiseLock } from './types'

export function createLock(): PromiseLock {
    const locks = new Set<Promise<any>>()

    async function run<T = void>(fn: () => Promise<T>): Promise<T> {
        const promise = fn()

        locks.add(promise)

        try {
            return await promise
        } finally {
            locks.delete(promise)
        }
    }

    async function wait() {
        await Promise.allSettled(locks)
    }

    function isWaiting() {
        return locks.size > 0
    }

    function clear() {
        locks.clear()
    }

    return { run, wait, clear, isWaiting }
}
