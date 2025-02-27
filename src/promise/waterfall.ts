import { type PipeFn, pipe } from './pipe'

export async function waterfall<T1, T2>(fns: [PipeFn<T1, T2>], init?: T1): Promise<T2>
export async function waterfall<T1, T2, T3>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>], init?: T1): Promise<T3>
export async function waterfall<T1, T2, T3, T4>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>], init?: T1): Promise<T4>
export async function waterfall<T1, T2, T3, T4, T5>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>], init?: T1): Promise<T5>
export async function waterfall<T1, T2, T3, T4, T5, T6>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>, PipeFn<T5, T6>], init?: T1): Promise<T6>
export async function waterfall<T1, T2, T3, T4, T5, T6, T7>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>, PipeFn<T5, T6>, PipeFn<T6, T7>], init?: T1): Promise<T7>
export async function waterfall<T1, T2, T3, T4, T5, T6, T7, T8>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>, PipeFn<T5, T6>, PipeFn<T6, T7>, PipeFn<T7, T8>], init?: T1): Promise<T8>
export async function waterfall<T1, T2, T3, T4, T5, T6, T7, T8, T9>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>, PipeFn<T5, T6>, PipeFn<T6, T7>, PipeFn<T7, T8>, PipeFn<T8, T9>], init?: T1): Promise<T9>
export async function waterfall<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>, PipeFn<T5, T6>, PipeFn<T6, T7>, PipeFn<T7, T8>, PipeFn<T8, T9>, PipeFn<T9, T10>], init?: T1): Promise<T10>
export async function waterfall<T1, T2, T3, T4, T5, T6, T7, T8, T9, T10, T11>(fns: [PipeFn<T1, T2>, PipeFn<T2, T3>, PipeFn<T3, T4>, PipeFn<T4, T5>, PipeFn<T5, T6>, PipeFn<T6, T7>, PipeFn<T7, T8>, PipeFn<T8, T9>, PipeFn<T9, T10>, PipeFn<T10, T11>], init?: T1): Promise<T11>

export async function waterfall(fns: PipeFn[], init?: any) {
    return pipe(init, ...(fns as [PipeFn]))
}
