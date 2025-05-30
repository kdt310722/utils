import { createAbortError } from '../error'

export async function abortable<T>(promise: Promise<T>, signal?: AbortSignal) {
    if (!signal) {
        return promise
    }

    if (signal.aborted) {
        throw signal.reason ?? createAbortError()
    }

    return new Promise<T>((resolve, reject) => {
        let isSettled = false
        let onAbort: () => void

        const cleanup = (afterCleanup?: () => void) => {
            if (!isSettled) {
                isSettled = true
                signal.removeEventListener('abort', onAbort)
                afterCleanup?.()
            }
        }

        onAbort = () => {
            cleanup(() => reject(signal.reason ?? createAbortError()))
        }

        signal.addEventListener('abort', onAbort)

        promise.then((value) => cleanup(() => resolve(value))).catch((error) => {
            cleanup(() => reject(error))
        })
    })
}
