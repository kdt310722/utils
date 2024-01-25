import { typeOf } from './common'

export function isDeepEqual(a: any, b: any) {
    const [typeA, typeB] = [typeOf(a), typeOf(b)]

    if (typeA !== typeB) {
        return false
    }

    if (typeA === 'array') {
        if (a.length !== b.length) {
            return false
        }

        return a.every((item: any, index: number) => isDeepEqual(item, b[index]))
    }

    if (typeA === 'object') {
        const keysA = Object.keys(a)

        if (keysA.length !== Object.keys(b).length) {
            return false
        }

        return keysA.every((key) => isDeepEqual(a[key], b[key]))
    }

    return Object.is(a, b)
}
