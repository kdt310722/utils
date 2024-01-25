import { push } from '../array'
import type { BufferLike } from './types'

export function join(...buffers: Array<BufferLike | BufferLike[]>): string {
    return buffers.reduce<string[]>((acc, buffer) => push(acc, Array.isArray(buffer) ? join(...buffer) : toString(buffer)), []).join('')
}

export function toString(buffer: BufferLike, encoding: BufferEncoding = 'utf8') {
    if (buffer instanceof ArrayBuffer) {
        return toString(Buffer.from(buffer))
    }

    return buffer.toString(encoding)
}
