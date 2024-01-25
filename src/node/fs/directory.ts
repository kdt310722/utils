import { type MakeDirectoryOptions, type PathLike, existsSync, lstatSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { toString } from '../path'
import { isFile } from './file'
import { isWritable } from './fs'

export function isDirectory(path: PathLike) {
    try {
        return lstatSync(path).isDirectory()
    } catch {
        return false
    }
}

export function isWritableDirectory(path: PathLike, recursive = true, falseIfNotExists = false) {
    const exists = existsSync(path)

    if ((!exists && falseIfNotExists) || (exists && isFile(path))) {
        return false
    }

    if (recursive && !exists) {
        return isWritableDirectory(dirname(toString(path)))
    }

    return isWritable(path)
}

export function ensureDirectory(path: PathLike, options: MakeDirectoryOptions = {}) {
    if (!existsSync(path)) {
        mkdirSync(path, { recursive: true, ...options })
    }
}
