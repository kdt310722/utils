import { resolveNestedOptions } from '../object'
import { type RetryOptions, withRetry, withTimeout } from '../promise'

export interface FetchOptions {
    timeout?: number
    retry?: (RetryOptions & { enabled?: boolean }) | boolean
}

export async function fetch(input: RequestInfo | URL, init?: RequestInit, options: FetchOptions = {}) {
    const { timeout = 10_000, retry = true } = options
    const retryOptions = resolveNestedOptions(retry) || { enabled: false }

    const execute = async () => {
        return withTimeout(globalThis.fetch(input, init), timeout, 'Request timeout')
    }

    return retryOptions.enabled ? await withRetry(execute, retryOptions) : await execute()
}
