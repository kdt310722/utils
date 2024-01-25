export type Fn = (...args: any[]) => any

export type Args<F extends Fn> = F extends (...args: infer A) => any ? A : never
