import { notNullish } from '../common'
import { stringifyError } from './stringify'

export type ErrorCode = string | number | symbol

export interface BaseErrorOptions extends ErrorOptions {
    name?: string
    code?: ErrorCode
    retryable?: boolean
}

export abstract class BaseError extends Error {
    public readonly timestamp: Date
    public readonly code?: ErrorCode
    public readonly retryable?: boolean

    public constructor(message?: string, { name, code, retryable, ...options }: BaseErrorOptions = {}) {
        super(message, options)

        this.name = name ?? this.constructor.name
        this.timestamp = new Date()
        this.code = code
        this.retryable = retryable

        Object.setPrototypeOf(this, new.target.prototype)

        if (notNullish(Error.captureStackTrace)) {
            Error.captureStackTrace(this, this.constructor)
        }
    }

    protected withValue<T>(key: string, value?: T): this {
        if (value !== undefined) {
            Object.defineProperty(this, key, { value, writable: false, enumerable: true, configurable: false })
        }

        return this
    }

    public toJSON() {
        const result: Record<string, unknown> = {}

        for (const key of Object.keys(this)) {
            result[key] = this[key as keyof this]
        }

        result.code = this.code
        result.timestamp = this.timestamp.toISOString()
        result.name = this.name
        result.message = this.message
        result.stack = this.stack

        if (this.cause) {
            result.cause = this.cause instanceof Error ? (this.cause as Error & { toJSON?(): unknown }).toJSON?.() ?? this.cause : this.cause
        }

        return result
    }

    public override toString(): string {
        return stringifyError(this)
    }
}
