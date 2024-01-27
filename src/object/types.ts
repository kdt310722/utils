export type AnyObject = Record<PropertyKey, any>

export type PickByType<T, Value> = {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

export type FilterPredicate<O, K extends keyof O> = (key: K, value: O[K], index: number) => boolean

export type FlattenKeys<T, D extends string = '.'> = T extends AnyObject ? { [K in keyof T]: `${Exclude<K, symbol>}${FlattenKeys<T[K], D> extends never ? '' : `${D}${FlattenKeys<T[K], D>}`}` }[keyof T] : never

export type FollowPath<T, P, D extends string = '.'> = P extends `${infer U}${D}${infer R}` ? U extends keyof T ? FollowPath<T[U], R, D> : never : P extends keyof T ? T[P] : never

export type Flatten<O extends AnyObject, D extends string = '.'> = {
    [P in FlattenKeys<O, D>]: FollowPath<O, P, D>
}
