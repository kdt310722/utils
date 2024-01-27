export type AnyObject = Record<PropertyKey, any>

export type PickByType<T, Value> = {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

export type FilterPredicate<O, K extends keyof O> = (key: K, value: O[K], index: number) => boolean

export type Paths<T, D extends string = '.'> = T extends AnyObject ? { [K in keyof T]: `${Exclude<K, symbol>}${'' | `${D}${Paths<T[K]>}`}` }[keyof T] : never

export type FlattenKeys<T, D extends string = '.'> = T extends AnyObject ? { [K in keyof T]: `${Exclude<K, symbol>}${FlattenKeys<T[K], D> extends never ? '' : `${D}${FlattenKeys<T[K], D>}`}` }[keyof T] : never

export type GetValue<T, P, D extends string = '.'> = P extends `${infer U}${D}${infer R}` ? (U extends keyof T ? GetValue<T[U], R, D> : never) : (P extends keyof T ? T[P] : never)

export type FromPath<P extends string, V, D extends string = '.'> = P extends `${infer U}${D}${infer R}` ? { [K in U]: FromPath<R, V, D> } : { [K in P]: V }

export type SetValue<O extends AnyObject, P extends string, V> = P extends keyof O ? { [K in keyof O]: K extends P ? V : O[K] } : (O & { [K in P]: V })

export type SetValueByPath<O extends AnyObject, P extends string, V, D extends string = '.'> = P extends `${infer U}${D}${infer R}` ? U extends keyof O ? { [K in keyof O]: K extends U ? O[K] extends AnyObject ? SetValueByPath<O[K], R, V, D> : FromPath<R, V, D> : O[K] } : (O & { [K in U]: FromPath<R, V, D> }) : SetValue<O, P, V>

export type Flatten<O extends AnyObject, D extends string = '.'> = {
    [P in FlattenKeys<O, D>]: GetValue<O, P, D>
}
