import { isBigInt } from '../../number'
import type { JsonSerializer } from '../types'

export const bigIntSerializer: JsonSerializer = (_, value) => {
    return isBigInt(value) ? { __serialized__: true, type: 'bigint', value: value.toString() } : value
}
