import { notNullish } from '../common'

export interface DeferredPromise<T> extends Promise<T> {
    resolve: (value: T | PromiseLike<T>) => void
    reject: (reason?: unknown) => void
    isSettled: boolean
    isPending: boolean
    isResolved: boolean
    isRejected: boolean
}

export interface CreateDeferredOptions<T> {
    onResolve?: (value: T | PromiseLike<T>) => void
    onReject?: (reason: unknown) => void
    onSettle?: () => void
    onError?: (error: unknown) => void
}

export function createDeferred<T>({ onResolve, onReject, onSettle, onError }: CreateDeferredOptions<T> = {}) {
    let resolveFn: (value: T | PromiseLike<T>) => void, rejectFn: (reason?: unknown) => void

    const promise = <DeferredPromise<T>> new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })

    promise.isSettled = false
    promise.isPending = true
    promise.isResolved = false
    promise.isRejected = false

    promise.resolve = (value) => {
        if (promise.isSettled) {
            return
        }

        promise.isSettled = true
        promise.isPending = false
        promise.isResolved = true

        resolveFn(value)

        if (notNullish(onResolve) || notNullish(onSettle)) {
            queueMicrotask(() => {
                try {
                    onResolve?.(value)
                    onSettle?.()
                } catch (error) {
                    onError?.(error)
                }
            })
        }
    }

    promise.reject = (reason) => {
        if (promise.isSettled) {
            return
        }

        promise.isSettled = true
        promise.isPending = false
        promise.isRejected = true

        rejectFn(reason)

        if (notNullish(onReject) || notNullish(onSettle)) {
            queueMicrotask(() => {
                try {
                    onReject?.(reason)
                    onSettle?.()
                } catch (error) {
                    onError?.(error)
                }
            })
        }
    }

    return promise
}
