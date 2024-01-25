import { deserializeError } from 'serialize-error'
import type { JsonDeserializer } from '../types'

export const errorDeserializer: JsonDeserializer = (_, value) => {
    return value?.__serialized__ && value.type === 'error' ? deserializeError(value.value) : value
}
