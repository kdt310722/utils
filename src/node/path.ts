import type { PathLike } from 'node:fs'
import { dirname as _dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { toString as bufferToString } from '../buffer'

export function toString(path: PathLike) {
    if (Buffer.isBuffer(path)) {
        return bufferToString(path)
    }

    return path.toString()
}

export function dirname(importMeta: ImportMeta, ...path: PathLike[]) {
    return join(resolve(_dirname(fileURLToPath(importMeta.url))), ...path.map(toString))
}
