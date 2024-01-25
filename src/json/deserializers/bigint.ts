import type { JsonDeserializer } from '../types'

export const bigintDeserializer: JsonDeserializer = (_, value) => {
    return value?.__serialized__ && value.type === 'bigint' ? BigInt(value.value) : value
}
