import type { HashOptions } from 'node:crypto'
import type { createReadStream } from 'node:fs'

export interface GetFileHashOptions {
    hash?: HashOptions
    stream?: Parameters<typeof createReadStream>[1]
}

export interface VerifyFileHashOptions extends GetFileHashOptions {
    throwOnInvalid?: boolean
}
