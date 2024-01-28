import { isPlainObject, set } from './object'
import type { AnyObject, Flatten } from './types'

export function flatten<O extends AnyObject, D extends string = '.'>(obj: O, delimiter: D = '.' as D) {
    const result: AnyObject = {}

    for (const [key, value] of Object.entries(obj)) {
        if (isPlainObject(value)) {
            const flatObject = flatten(value, delimiter)

            for (const [subKey, subValue] of Object.entries(flatObject)) {
                result[`${key}${delimiter}${subKey}`] = subValue
            }
        } else {
            result[key] = value
        }
    }

    return result as Flatten<O, D>
}

export function unflatten<R>(obj: AnyObject, delimiter = '.'): R {
    let result: AnyObject = {}

    for (const [key, value] of Object.entries(obj)) {
        result = set(result, key, isPlainObject(value) ? unflatten(value, delimiter) : value, delimiter)
    }

    return result
}
