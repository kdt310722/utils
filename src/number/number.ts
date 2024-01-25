import { isString } from '../string'
import type { Numberish } from './types'

export const isNumber = (value: unknown): value is number => typeof value === 'number'

export const isBigInt = (value: unknown): value is bigint => typeof value === 'bigint'

export const isNumberString = (value: string) => /^([+-])?(\d+)(\.\d+)?$/.test(value)

export function isNumberish(input: unknown): input is Numberish {
    return isNumber(input) || isBigInt(input) || (isString(input) && isNumberString(input))
}

export function toBigInt(input: unknown) {
    return BigInt(String(input))
}

export function toNumber(input: unknown) {
    return Number(String(input))
}

export function random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}
