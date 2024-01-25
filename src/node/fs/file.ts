import { type PathLike, createReadStream, lstatSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { toString } from '../path'
import type { GetFileHashOptions, VerifyFileHashOptions } from './types'

export function isFile(path: PathLike) {
    return lstatSync(path).isFile()
}

export async function verifyFileHash(path: PathLike, hash: string, algorithm: string, options?: VerifyFileHashOptions) {
    const fileHash = await getFileHash(path, algorithm, options)
    const isValid = fileHash === hash
    const { throwOnInvalid = true } = options ?? {}

    if (!isValid && throwOnInvalid) {
        throw new Error(`File ${toString(path)} is corrupted, hash: ${fileHash}, expected: ${hash}`)
    }

    return isValid
}

export async function getFileHash(path: PathLike, algorithm: string, options: GetFileHashOptions = {}) {
    const hash = createHash(algorithm, options.hash).setEncoding('hex')
    const stream = createReadStream(path, options.stream)

    return new Promise<string>((resolve, reject) => {
        stream.on('error', (error) => reject(error))
        stream.on('data', (data) => hash.update(data))
        stream.on('end', () => resolve(hash.digest('hex')))
    })
}
