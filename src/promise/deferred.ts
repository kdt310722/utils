import type { DeferredPromise } from './types'

export function createDeferred<T>() {
    let resolveFn: any, rejectFn: any

    const promise = <DeferredPromise<T>> new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })

    promise.isSettled = false

    promise.resolve = (value) => {
        resolveFn(value)
        promise.isSettled = true
    }

    promise.reject = (reason) => {
        rejectFn(reason)
        promise.isSettled = true
    }

    return promise
}
