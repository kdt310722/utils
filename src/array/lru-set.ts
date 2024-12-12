export class LruSet<T = unknown> extends Set<T> {
    public constructor(public readonly maxSize: number) {
        super()

        if (!Number.isInteger(maxSize) || maxSize <= 0) {
            throw new Error('maxSize must be a positive integer')
        }
    }

    public override add(value: T): this {
        if (this.has(value)) {
            this.delete(value)
        }

        super.add(value)

        while (this.size > this.maxSize) {
            const oldest = this.values().next().value

            if (oldest) {
                this.delete(oldest)
            }
        }

        return this
    }
}
