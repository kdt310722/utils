export function pipe<TInitial>(init: TInitial): TInitial
export function pipe<TInitial, R1>(init: TInitial, init_r1: (init: TInitial) => R1): R1
export function pipe<TInitial, R1, R2>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2): R2
export function pipe<TInitial, R1, R2, R3>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3): R3
export function pipe<TInitial, R1, R2, R3, R4>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4): R4
export function pipe<TInitial, R1, R2, R3, R4, R5>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4, r4_r5: (r4: R4) => R5): R5
export function pipe<TInitial, R1, R2, R3, R4, R5, R6>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4, r4_r5: (r4: R4) => R5, r5_r6: (r5: R5) => R6): R6
export function pipe<TInitial, R1, R2, R3, R4, R5, R6, R7>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4, r4_r5: (r4: R4) => R5, r5_r6: (r5: R5) => R6, r6_r7: (r6: R6) => R7): R7
export function pipe<TInitial, R1, R2, R3, R4, R5, R6, R7, R8>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4, r4_r5: (r4: R4) => R5, r5_r6: (r5: R5) => R6, r6_r7: (r6: R6) => R7, r7_r8: (r7: R7) => R8): R8
export function pipe<TInitial, R1, R2, R3, R4, R5, R6, R7, R8, R9>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4, r4_r5: (r4: R4) => R5, r5_r6: (r5: R5) => R6, r6_r7: (r6: R6) => R7, r7_r8: (r7: R7) => R8, r8_r9: (r8: R8) => R9): R9
export function pipe<TInitial, R1, R2, R3, R4, R5, R6, R7, R8, R9, R10>(init: TInitial, init_r1: (init: TInitial) => R1, r1_r2: (r1: R1) => R2, r2_r3: (r2: R2) => R3, r3_r4: (r3: R3) => R4, r4_r5: (r4: R4) => R5, r5_r6: (r5: R5) => R6, r6_r7: (r6: R6) => R7, r7_r8: (r7: R7) => R8, r8_r9: (r8: R8) => R9, r9_r10: (r9: R9) => R10): R10

export function pipe<TInitial>(init: TInitial, ...fns: CallableFunction[]) {
    return fns.reduce((acc, fn) => fn(acc), init)
}
