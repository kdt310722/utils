import { safeRace } from './race'

export function abortable<T>(promise: Promise<T>, abortSignal?: AbortSignal): Promise<T> {
    if (!abortSignal) {
        return promise
    }

    return safeRace([
        // This promise only ever rejects if the signal is aborted. Otherwise it idles forever.
        // It's important that this come before the input promise; in the event of an abort, we
        // want to throw even if the input promise's result is ready
        // eslint-disable-next-line promise/param-names
        new Promise<never>((_, reject) => {
            if (abortSignal.aborted) {
                // eslint-disable-next-line ts/prefer-promise-reject-errors
                reject(abortSignal.reason)
            } else {
                abortSignal.addEventListener('abort', function () {
                    // eslint-disable-next-line ts/prefer-promise-reject-errors
                    reject(this.reason)
                })
            }
        }),
        promise,
    ])
}
