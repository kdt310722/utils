export type AnyObject = Record<PropertyKey, any>

export type PickByType<T, Value> = {
    [P in keyof T as T[P] extends Value | undefined ? P : never]: T[P]
}

export type FilterPredicate<O, K extends keyof O> = (key: K, value: O[K], index: number) => boolean
