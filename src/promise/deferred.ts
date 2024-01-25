import type { DeferredPromise } from './types'

export function createDeferred<T>() {
    let resolveFn: any, rejectFn: any

    const promise = <DeferredPromise<T>> new Promise<T>((resolve, reject) => {
        resolveFn = resolve
        rejectFn = reject
    })

    promise.resolve = resolveFn
    promise.reject = rejectFn
    promise.isSettled = false

    promise.finally(() => {
        promise.isSettled = true
    })

    return promise
}
