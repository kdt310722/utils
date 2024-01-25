export function assert(condition: boolean, message: string | Error): asserts condition {
    if (!condition) {
        if (message instanceof Error) {
            throw message
        }

        throw new Error(message)
    }
}
