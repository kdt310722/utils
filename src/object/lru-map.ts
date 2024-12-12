export class LruMap<K extends PropertyKey, T = unknown> extends Map<K, T> {
    public constructor(public readonly maxSize: number) {
        super()

        if (!Number.isInteger(maxSize) || maxSize <= 0) {
            throw new Error('maxSize must be a positive integer')
        }
    }

    public override set(key: K, value: T) {
        if (this.has(key)) {
            this.delete(key)
        }

        super.set(key, value)

        while (this.size > this.maxSize) {
            const oldest = this.keys().next().value

            if (oldest) {
                this.delete(oldest)
            }
        }

        return this
    }
}
