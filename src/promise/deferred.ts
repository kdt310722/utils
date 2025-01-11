import type { DeferredPromise } from './types'

export interface CreateDeferredOptions {
    onResolve?: (value: any) => void
    onReject?: (reason: any) => void
    onSettle?: () => void
}

export function createDeferred<T>({ onResolve, onReject, onSettle }: CreateDeferredOptions = {}) {
    let resolveFn: any, rejectFn: any

    const promise = <DeferredPromise<T>> new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })

    promise.isSettled = false

    promise.resolve = (value) => {
        onResolve?.(value)
        onSettle?.()
        promise.isSettled = true
        resolveFn(value)
    }

    promise.reject = (reason) => {
        onReject?.(reason)
        onSettle?.()
        promise.isSettled = true
        rejectFn(reason)
    }

    return promise
}
