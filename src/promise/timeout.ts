import { isFunction } from '../function'

export function withTimeout<T>(promise: Promise<T>, ms: number, message?: Error | (() => Error) | string) {
    return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            if (isFunction(message)) {
                return reject(message())
            }

            if (message instanceof Error) {
                return reject(message)
            }

            reject(new Error(message ?? `Promise timed out after ${ms} ms`))
        }, ms)

        promise.then(resolve).finally(() => clearTimeout(timeoutId)).catch((error: unknown) => {
            clearTimeout(timeoutId)
            reject(error as Error)
        })
    })
}
