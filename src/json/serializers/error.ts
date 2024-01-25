import { isErrorLike, serializeError } from 'serialize-error'
import type { JsonSerializer } from '../types'

export const errorSerializer: JsonSerializer = (_, value) => {
    return isErrorLike(value) ? { __serialized__: true, type: 'error', value: serializeError(value) } : value
}
