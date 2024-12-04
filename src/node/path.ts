import type { PathLike } from 'node:fs'
import nodePath from 'node:path'
import { fileURLToPath } from 'node:url'
import { toString as bufferToString } from '../buffer'

export function toString(path: PathLike) {
    if (Buffer.isBuffer(path)) {
        return bufferToString(path)
    }

    return path.toString()
}

export function dirname(importMeta: ImportMeta, ...path: PathLike[]) {
    return nodePath.join(nodePath.resolve(nodePath.dirname(fileURLToPath(importMeta.url))), ...path.map(toString))
}
