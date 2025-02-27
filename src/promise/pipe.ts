export type PipeFn<TInput = any, TReturn = any> = (input: TInput) => Promise<TReturn>

export async function pipe<T1, T2>(init: T1, fn1: PipeFn<T1, T2>): Promise<T2>
export async function pipe<T1, T2, T3>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>): Promise<T3>
export async function pipe<T1, T2, T3, T4>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>): Promise<T4>
export async function pipe<T1, T2, T3, T4, T5>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>): Promise<T5>
export async function pipe<T1, T2, T3, T4, T5, T6>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>, fn5: PipeFn<T5, T6>): Promise<T6>
export async function pipe<T1, T2, T3, T4, T5, T6, T7>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>, fn5: PipeFn<T5, T6>, fn6: PipeFn<T6, T7>): Promise<T7>
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>, fn5: PipeFn<T5, T6>, fn6: PipeFn<T6, T7>, fn7: PipeFn<T7, T8>): Promise<T8>
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>, fn5: PipeFn<T5, T6>, fn6: PipeFn<T6, T7>, fn7: PipeFn<T7, T8>, fn8: PipeFn<T8, T9>): Promise<T9>
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>, fn5: PipeFn<T5, T6>, fn6: PipeFn<T6, T7>, fn7: PipeFn<T7, T8>, fn8: PipeFn<T8, T9>, fn9: PipeFn<T9, T10>): Promise<T10>
export async function pipe<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(init: T1, fn1: PipeFn<T1, T2>, fn2: PipeFn<T2, T3>, fn3: PipeFn<T3, T4>, fn4: PipeFn<T4, T5>, fn5: PipeFn<T5, T6>, fn6: PipeFn<T6, T7>, fn7: PipeFn<T7, T8>, fn8: PipeFn<T8, T9>, fn9: PipeFn<T9, T10>, fn10: PipeFn<T10, T11>): Promise<T11>

export async function pipe<TInitial>(init: TInitial, ...fns: PipeFn[]) {
    let acc = init

    for (const fn of fns) {
        acc = await fn(acc)
    }

    return acc
}
