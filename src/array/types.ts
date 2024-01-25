export type Arrayable<T> = T | T[] | Iterable<T>

export type ElementOf<T> = T extends Array<infer E> ? E : never

export type NonEmpty<T = any> = [T, ...T[]]
