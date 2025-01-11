import type { Args, Fn } from '../function'

export type Primitive = null | undefined | string | number | boolean | symbol | bigint

export type Nullable<T> = T | null | undefined

export type IsContainsType<T, U> = Extract<T, U> extends never ? false : true

export type Constructor<T> = new (...args: any[]) => T

export type MethodArgs<C, M extends keyof C> = C[M] extends Fn ? Args<C[M]> : never

export type MethodReturn<C, M extends keyof C> = C[M] extends Fn ? ReturnType<C[M]> : never

export type ExcludeNull<O> = {
    [K in keyof O]: Exclude<O[K], null>
}

export type ExcludeUndefined<O> = {
    [K in keyof O]: Exclude<O[K], undefined>
}

export type ExcludeNullish<O> = ExcludeNull<ExcludeUndefined<O>>

export type Mutable<T> = {
    -readonly [P in keyof T]: T[P];
}

export type ClassMethod<T> = { [K in keyof T]: T[K] extends Fn ? K : never }[keyof T]
