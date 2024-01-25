import JSON5 from 'json5'
import { toArray } from '../array'
import type { JsonDeserializer, StringifyJsonOptions } from './types'
import { bigIntSerializer, errorSerializer } from './serializers'
import { bigintDeserializer, errorDeserializer } from './deserializers'

export function parseJson<T = any>(json: string, deserializers?: JsonDeserializer | JsonDeserializer[]): T {
    const revivers = toArray(deserializers ?? [
        bigintDeserializer,
        errorDeserializer,
    ])

    return JSON5.parse(json, (key, value) => revivers.reduce((v, deserializer) => deserializer(key, v), value))
}

export function stringifyJson<T = any>(value: T, options: StringifyJsonOptions = {}) {
    const { indent, json5 = false } = options
    const serializers = toArray(options.serializers ?? [bigIntSerializer, errorSerializer])
    const replacer = (key: string, value: any) => serializers.reduce((v, serializer) => serializer(key, v), value)

    return json5 ? JSON5.stringify(value, replacer, indent) : JSON.stringify(value, replacer, indent)
}
