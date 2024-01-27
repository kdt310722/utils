import { sum } from '../array'
import { type Nullable, notNullish, toString } from '../common'
import type { AnyObject, FilterPredicate, PickByType, SetValueByPath } from './types'

export const isObject = (value: unknown): value is AnyObject => {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false
    }

    return !(value instanceof Date || value instanceof RegExp || value instanceof Error)
}

export const isPlainObject = (value: unknown): value is AnyObject => toString(value) === '[object Object]'

export const isEmptyObject = (value: AnyObject) => Object.keys(value).length === 0

export function isKeyOf<T extends AnyObject>(obj: T, name: PropertyKey): name is keyof T {
    return name in obj
}

export function isKeysOf<T extends string>(data: AnyObject, keys: T[]): data is Record<T, unknown> {
    return keys.every((key) => isKeyOf(data, key))
}

export function hasOwnProperty<T extends AnyObject>(obj: T, name: PropertyKey): name is keyof T {
    return Object.hasOwn(obj, name)
}

export function keys<T extends AnyObject>(obj: T) {
    return Object.keys(obj) as Array<`${keyof T & (string | number | boolean | null | undefined)}`>
}

export function entries<O extends AnyObject>(obj: O) {
    return Object.entries(obj) as Array<[keyof O, O[keyof O]]>
}

export function filter<O extends AnyObject>(obj: O, predicate: FilterPredicate<O, keyof O>) {
    return Object.fromEntries(entries(obj).filter(([key, value], index) => predicate(key, value, index)))
}

export function filterByValue<O extends AnyObject>(obj: O, predicate: (value: O[keyof O]) => boolean) {
    return filter(obj, (_, value) => predicate(value))
}

export function pick<O extends AnyObject, K extends keyof O>(obj: O, ...keys: K[]) {
    return filter(obj, (key) => keys.includes(key as K)) as Pick<O, K>
}

export function omit<O extends AnyObject, K extends keyof O>(object: O, ...keys: K[]) {
    return filter(object, (key) => !keys.includes(key as K)) as Omit<O, K>
}

export function map<K extends PropertyKey, V, NK extends PropertyKey, NV>(obj: Record<K, V>, fn: (k: K, v: V, i: number) => Nullable<[NK, NV]>) {
    return Object.fromEntries(entries(obj).map(([k, v], i) => fn(k, v, i)).filter(notNullish))
}

export function sumBy<O extends AnyObject>(objects: O[], key: keyof PickByType<O, number>) {
    return sum(objects.map((o) => o[key]))
}

export function set<O extends AnyObject, P extends string, V, D extends string = '.'>(target: O, path: P, value: V, delimiter: D = '.' as D): SetValueByPath<O, P, V, D> {
    const keys = path.split(delimiter)
    const firstKey = keys.shift()

    if (!firstKey) {
        return target as SetValueByPath<O, P, V, D>
    }

    if (keys.length === 0) {
        return Object.assign(target, { [path]: value }) as SetValueByPath<O, P, V, D>
    }

    if (!isKeyOf(target, firstKey) || !isObject(target[firstKey])) {
        target = Object.assign(target, { [firstKey]: {} })
    }

    return Object.assign(target, { [firstKey]: set(target[firstKey], keys.join(delimiter), value, delimiter) }) as SetValueByPath<O, P, V, D>
}
