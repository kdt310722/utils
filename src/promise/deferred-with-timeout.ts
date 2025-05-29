import { isFunction, transform } from '../function'
import { type CreateDeferredOptions, type DeferredPromise, createDeferred } from './deferred'

export type TimeoutErrorOrFactory = string | Error | (() => string | Error)

export function createDeferredWithTimeout<T>(timeout: number, errorOrFactory: TimeoutErrorOrFactory, options?: CreateDeferredOptions<T>): DeferredPromise<T> {
    let timeoutId: NodeJS.Timeout | undefined

    const deferred = createDeferred<T>(options)
    const createTimeoutError = () => transform(isFunction(errorOrFactory) ? errorOrFactory() : errorOrFactory, (result) => (result instanceof Error ? result : new Error(result)))

    const clearTimer = () => {
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId)
            timeoutId = undefined
        }
    }

    const originalResolve = deferred.resolve
    const originalReject = deferred.reject

    deferred.resolve = (value: T | PromiseLike<T>) => {
        clearTimer()
        originalResolve(value)
    }

    deferred.reject = (reason?: unknown) => {
        clearTimer()
        originalReject(reason)
    }

    if (timeout > 0) {
        timeoutId = setTimeout(() => deferred.isSettled || deferred.reject(createTimeoutError()), timeout)
    }

    return deferred
}
