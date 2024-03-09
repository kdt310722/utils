export function withTimeout<T>(promise: Promise<T>, ms: number, message?: Error | string) {
    return new Promise<T>((resolve, reject) => {
        const timeoutId = setTimeout(() => reject(message instanceof Error ? message : new Error(message ?? `Promise timed out after ${ms} ms`)), ms)

        promise.then(resolve).finally(() => clearTimeout(timeoutId)).catch((error) => {
            clearTimeout(timeoutId)
            reject(error as Error)
        })
    })
}
