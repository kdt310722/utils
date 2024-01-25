import type { Nullable } from '../common'
import { push } from './elements'
import type { Arrayable } from './types'

export const isArray = <T = any>(value: unknown): value is T[] => Array.isArray(value)

export const isIterable = <T = any>(value: unknown): value is Iterable<T> => {
    return typeof value === 'object' && value !== null && Symbol.iterator in value && typeof (value)[Symbol.iterator] === 'function'
}

export function wrap<T>(array: T | T[]) {
    return isArray(array) ? array : [array]
}

export function toArray<T>(value?: Nullable<Arrayable<T>>) {
    if (isIterable(value)) {
        return [...value]
    }

    return wrap(value ?? [])
}

export function range(from: number, to: number, step = 1) {
    return Array.from({ length: Math.floor((to - from) / step) + 1 }, (_, i) => from + (i * step))
}

export function flatten<T>(array?: Nullable<Arrayable<T | T[]>>) {
    return toArray(array).flat(1) as T[]
}

export function merge<T>(...arrays: Array<Nullable<Arrayable<T>>>) {
    return arrays.flatMap((array) => toArray(array))
}

export function unique<T>(array: T[]) {
    return [...new Set(array)]
}

export function uniqueBy<T>(array: T[], equalFn: (a: T, b: T) => boolean) {
    return array.reduce<T[]>((r, c) => (r.some((v) => equalFn(v, c)) ? r : push(r, c)), [])
}

export function intersection<T>(a: T[], b: T[]) {
    return a.filter((v) => b.includes(v))
}

export function diff<T>(a: T[], b: T[]) {
    return a.filter((v) => !b.includes(v))
}

export function symmetricDiff<T>(a: T[], b: T[]) {
    return [...diff(a, b), ...diff(b, a)]
}
