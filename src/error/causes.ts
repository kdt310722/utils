import { notNullish } from '../common'
import type { BaseError } from './base-error'

export function formatCause(cause: unknown, visited: WeakSet<object>, isInCauseChain = false): string {
    if (cause == null) {
        return String(cause)
    }

    if (typeof cause === 'object' && visited.has(cause)) {
        return '[Circular reference detected]'
    }

    if (typeof cause === 'object') {
        visited.add(cause)
    }

    if (cause instanceof Error) {
        const hasCodeProperty = 'code' in cause && 'timestamp' in cause

        const isBaseErrorInstance = hasCodeProperty ||
            (cause as any).constructor.name === 'BaseError' ||
            Object.getPrototypeOf(cause).constructor.name === 'BaseError'

        if (isBaseErrorInstance && isInCauseChain) {
            const parts: string[] = []
            const baseError = cause as BaseError

            if (notNullish(baseError.code)) {
                parts.push(`[${String(baseError.code)}]`)
            }

            parts.push(`${baseError.name}: ${baseError.message}`)

            return parts.join(' ')
        }

        return `${cause.name}: ${cause.message}`
    }

    try {
        return String(cause)
    } catch {
        return '[object Object]'
    }
}

export function buildCauseChain(cause: unknown, maxDepth = 3): string {
    if (!cause || maxDepth <= 0) {
        return ''
    }

    const visited = new WeakSet<object>()
    const parts: string[] = []

    let currentCause = cause
    let depth = 0

    while (currentCause && depth < maxDepth) {
        const formatted = formatCause(currentCause, visited, true)
        parts.push(formatted)

        if (currentCause instanceof Error && currentCause.cause) {
            currentCause = currentCause.cause
            depth++
        } else {
            break
        }
    }

    if (currentCause && depth >= maxDepth) {
        parts.push('[Additional causes truncated...]')
    }

    return parts.join('\n  Caused by: ')
}
