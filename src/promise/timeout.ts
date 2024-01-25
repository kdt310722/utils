export function withTimeout<T>(promise: Promise<T>, ms: number, message?: Error | string): Promise<T> {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(message instanceof Error ? message : new Error(message ?? `Promise timed out after ${ms} ms`)), ms)

        promise.then(resolve).catch(reject).finally(() => {
            clearTimeout(timeoutId)
        })
    })
}
