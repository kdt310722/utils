import { notNullish } from '../common'
import type { ErrorCode } from './base-error'
import { buildCauseChain } from './causes'

export interface ErrorStringifyOptions {
    includeCode?: boolean
    includeCause?: boolean
    maxCauseDepth?: number
}

export function stringifyError(error: Error, { includeCode = true, includeCause = true, maxCauseDepth = 3 }: ErrorStringifyOptions = {}): string {
    if (error instanceof Error && error.toString !== Error.prototype.toString) {
        try {
            const hasCodeProperty = 'code' in error && 'timestamp' in error

            const isBaseErrorInstance = hasCodeProperty ||
                error.constructor.name === 'BaseError' ||
                Object.getPrototypeOf(error).constructor.name === 'BaseError'

            if (!isBaseErrorInstance) {
                const toStringSource = error.toString.toString()

                if (!toStringSource.includes('stringifyError')) {
                    return error.toString()
                }
            }
        } catch {
            // If we can't inspect toString, fall back to default formatting
        }
    }

    const parts: string[] = []
    const errorWithCode = error as Error & { code?: ErrorCode }

    if (includeCode && notNullish(errorWithCode.code)) {
        parts.push(`[${String(errorWithCode.code)}]`)
    }

    parts.push(`${error.name}: ${error.message}`)

    let result = parts.join(' ')

    if (includeCause && error.cause) {
        const causeChain = buildCauseChain(error.cause, maxCauseDepth)

        if (causeChain) {
            result += `\n  Caused by: ${causeChain}`
        }
    }

    return result
}
