import { ensurePrefix, equalsIgnoreCase, hasPrefix, isString, stripPrefix } from './string'
import type { Hex } from './types'

export function isHexString(value: unknown, length?: number): value is string {
    const len = length ? `{${length * 2}}` : '+'
    const regex = new RegExp(`^(?:0x)?[0-9a-f]${len}$`, 'iu')

    return isString(value) && regex.test(value)
}

export function isStrictHexString(value: unknown, length?: number): value is Hex {
    return isString(value) && hasPrefix(value, '0x') && isHexString(value, length)
}

export function stripHexPrefix(value: string): string {
    return stripPrefix(value, '0x')
}

export function ensureHexPrefix(value: string) {
    return ensurePrefix(value, '0x') as Hex
}

export function hexEquals(hex: string, ...others: string[]) {
    return equalsIgnoreCase(stripHexPrefix(hex), ...others.map((i) => stripHexPrefix(i)))
}
