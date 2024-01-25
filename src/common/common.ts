import type { Nullable } from './types'

export const toString = (value: unknown) => Object.prototype.toString.call(value)

export function typeOf(v: unknown) {
    if (v === null) {
        return 'null'
    }

    return typeof v === 'object' || typeof v === 'function' ? toString(v).slice(8, -1).toLowerCase() : typeof v
}

export const isNull = (value: unknown): value is null => value === null
export const isUndefined = (value?: unknown): value is undefined => value === undefined
export const isNullish = (value?: unknown): value is null | undefined => isNull(value) || isUndefined(value)
export const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean'

export const notNull = <T>(value: T | null): value is Exclude<T, null> => !isNull(value)
export const notUndefined = <T>(value: T | undefined): value is Exclude<T, undefined> => !isUndefined(value)
export const notNullish = <T>(value: Nullable<T>): value is NonNullable<T> => !isNullish(value)

export function isEmpty(value: any) {
    const valueType = typeOf(value)

    if (valueType === 'string' || valueType === 'array') {
        return value.length === 0
    }

    if (valueType === 'object') {
        return Object.keys(value).length === 0
    }

    return !value && value !== 0 && value !== 0n && value !== false
}

export function isTrueLike(value: unknown) {
    if (isBoolean(value)) {
        return value
    }

    if (typeof value === 'string') {
        return ['true', 't', 'yes', 'y', 'on', '1'].includes(value.trim().toLowerCase())
    }

    return value === 1 || value === 1n
}
