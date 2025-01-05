export interface ChunkAsyncIteratorOptions<T> {
    filter?: (item: T) => boolean
    transform?: (item: T) => T
}

export async function * chunkAsyncIterator<T>(iterator: AsyncIterable<T>, chunkSize: number, options: ChunkAsyncIteratorOptions<T> = {}): AsyncIterable<T[]> {
    const { filter = () => true, transform = (item) => item } = options

    if (chunkSize < 1 || chunkSize % 1 !== 0) {
        throw new Error('Invalid chunk size')
    }

    let chunk: T[] = []

    for await (const item of iterator) {
        if (!filter(item)) {
            continue
        }

        chunk.push(transform(item))

        if (chunk.length === chunkSize) {
            yield chunk
            chunk = []
        }
    }

    if (chunk.length > 0) {
        yield chunk
    }
}

export async function * mergeAsyncIterators<T>(...iterators: Array<AsyncIterable<T>>): AsyncIterable<T> {
    const asyncIterators = iterators.map((it) => it[Symbol.asyncIterator]())
    const promiseMap = new Map(asyncIterators.map((it, index) => [index, it.next().then((result) => ({ result, index }))]))

    while (promiseMap.size > 0) {
        const { result, index } = await Promise.race(promiseMap.values())

        if (result.done) {
            promiseMap.delete(index)
        } else {
            yield result.value
            promiseMap.set(index, asyncIterators[index].next().then((nextResult) => ({ result: nextResult, index })))
        }
    }
}
