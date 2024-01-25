export type JsonSerializer = (key: string, value: any) => any

export type JsonDeserializer = (key: string, value: any) => any

export interface StringifyJsonOptions {
    indent?: number
    serializers?: JsonSerializer | JsonSerializer[]
    json5?: boolean
}
