export function createAbortError(message = 'This operation was aborted') {
    return new DOMException(message, 'AbortError')
}

export function isAbortError(error: unknown): error is DOMException {
    return error instanceof DOMException && error.name === 'AbortError'
}
