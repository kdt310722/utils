import { describe, expect, test } from 'vitest'
import { isAbortError } from '../../src/error/errors'

describe('isAbortError', () => {
    describe('positive cases', () => {
        test('should return true for DOMException with AbortError name', () => {
            const abortError = new DOMException('Operation was aborted', 'AbortError')
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should return true for AbortController signal abort error', () => {
            const controller = new AbortController()
            controller.abort()

            const abortError = new DOMException('This operation was aborted', 'AbortError')
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should return true for manually created AbortError', () => {
            const abortError = new DOMException('Manual abort', 'AbortError')
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should return true for AbortError with different message', () => {
            const abortError = new DOMException('Custom abort message', 'AbortError')
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should return true for AbortError with empty message', () => {
            const abortError = new DOMException('', 'AbortError')
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should return true for AbortError with undefined message', () => {
            const abortError = new DOMException(undefined as any, 'AbortError')
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })
    })

    describe('negative cases - DOMException with different names', () => {
        test('should return false for DOMException with different name', () => {
            const domError = new DOMException('Some error', 'NotFoundError')
            const result = isAbortError(domError)

            expect(result).toBe(false)
        })

        test('should return false for DOMException with TimeoutError name', () => {
            const timeoutError = new DOMException('Timeout occurred', 'TimeoutError')
            const result = isAbortError(timeoutError)

            expect(result).toBe(false)
        })

        test('should return false for DOMException with NetworkError name', () => {
            const networkError = new DOMException('Network failed', 'NetworkError')
            const result = isAbortError(networkError)

            expect(result).toBe(false)
        })

        test('should return false for DOMException with InvalidStateError name', () => {
            const stateError = new DOMException('Invalid state', 'InvalidStateError')
            const result = isAbortError(stateError)

            expect(result).toBe(false)
        })

        test('should return false for DOMException with case-sensitive name mismatch', () => {
            const caseError = new DOMException('Case mismatch', 'aborterror')
            const result = isAbortError(caseError)

            expect(result).toBe(false)
        })

        test('should return false for DOMException with partial name match', () => {
            const partialError = new DOMException('Partial match', 'Abort')
            const result = isAbortError(partialError)

            expect(result).toBe(false)
        })
    })

    describe('negative cases - other Error types', () => {
        test('should return false for regular Error', () => {
            const error = new Error('Regular error')
            const result = isAbortError(error)

            expect(result).toBe(false)
        })

        test('should return false for TypeError', () => {
            const error = new TypeError('Type error')
            const result = isAbortError(error)

            expect(result).toBe(false)
        })

        test('should return false for RangeError', () => {
            const error = new RangeError('Range error')
            const result = isAbortError(error)

            expect(result).toBe(false)
        })

        test('should return false for SyntaxError', () => {
            const error = new SyntaxError('Syntax error')
            const result = isAbortError(error)

            expect(result).toBe(false)
        })

        test('should return false for ReferenceError', () => {
            const error = new ReferenceError('Reference error')
            const result = isAbortError(error)

            expect(result).toBe(false)
        })

        test('should return false for custom Error with AbortError name', () => {
            const error = new Error('Custom error')
            error.name = 'AbortError'
            const result = isAbortError(error)

            expect(result).toBe(false)
        })
    })

    describe('negative cases - non-Error values', () => {
        test('should return false for null', () => {
            const result = isAbortError(null)

            expect(result).toBe(false)
        })

        test('should return false for undefined', () => {
            const result = isAbortError(undefined)

            expect(result).toBe(false)
        })

        test('should return false for string', () => {
            const result = isAbortError('AbortError')

            expect(result).toBe(false)
        })

        test('should return false for number', () => {
            const result = isAbortError(42)

            expect(result).toBe(false)
        })

        test('should return false for boolean', () => {
            const result = isAbortError(true)

            expect(result).toBe(false)
        })

        test('should return false for array', () => {
            const result = isAbortError([])

            expect(result).toBe(false)
        })

        test('should return false for plain object', () => {
            const result = isAbortError({})

            expect(result).toBe(false)
        })

        test('should return false for object with error-like properties', () => {
            const errorLike = {
                name: 'AbortError',
                message: 'Operation was aborted',
            }
            const result = isAbortError(errorLike)

            expect(result).toBe(false)
        })

        test('should return false for function', () => {
            const func = () => 'AbortError'
            const result = isAbortError(func)

            expect(result).toBe(false)
        })

        test('should return false for symbol', () => {
            const symbol = Symbol('AbortError')
            const result = isAbortError(symbol)

            expect(result).toBe(false)
        })

        test('should return false for Date', () => {
            const date = new Date()
            const result = isAbortError(date)

            expect(result).toBe(false)
        })

        test('should return false for RegExp', () => {
            const regex = /AbortError/
            const result = isAbortError(regex)

            expect(result).toBe(false)
        })
    })

    describe('edge cases', () => {
        test('should handle DOMException with modified prototype', () => {
            const abortError = new DOMException('Test', 'AbortError')
            Object.setPrototypeOf(abortError, Error.prototype)
            const result = isAbortError(abortError)

            expect(result).toBe(false)
        })

        test('should handle object that inherits from DOMException', () => {
            class CustomDOMException extends DOMException {
                constructor(message: string, name: string) {
                    super(message, name)
                }
            }

            const customAbortError = new CustomDOMException('Custom abort', 'AbortError')
            const result = isAbortError(customAbortError)

            expect(result).toBe(true)
        })

        test('should handle DOMException with additional properties', () => {
            const abortError = new DOMException('Test', 'AbortError')
            ;(abortError as any).customProperty = 'custom value'
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should handle DOMException with overridden name property', () => {
            const abortError = new DOMException('Test', 'AbortError')
            Object.defineProperty(abortError, 'name', {
                value: 'OverriddenError',
                writable: true,
                enumerable: true,
                configurable: true,
            })
            const result = isAbortError(abortError)

            expect(result).toBe(false)
        })

        test('should handle DOMException with getter name property', () => {
            const abortError = new DOMException('Test', 'AbortError')
            Object.defineProperty(abortError, 'name', {
                get() {
                    return 'AbortError'
                },
                enumerable: true,
                configurable: true,
            })
            const result = isAbortError(abortError)

            expect(result).toBe(true)
        })

        test('should handle DOMException with name property that throws', () => {
            const abortError = new DOMException('Test', 'AbortError')
            Object.defineProperty(abortError, 'name', {
                get() {
                    throw new Error('Name access error')
                },
                enumerable: true,
                configurable: true,
            })

            expect(() => isAbortError(abortError)).toThrow('Name access error')
        })
    })

    describe('type guard behavior', () => {
        test('should narrow type to DOMException when true', () => {
            const error: unknown = new DOMException('Test', 'AbortError')

            if (isAbortError(error)) {
                expect(error.name).toBe('AbortError')
                expect(error.message).toBe('Test')
                expect(error).toBeInstanceOf(DOMException)
            }
        })

        test('should work with union types', () => {
            const errors: Array<Error | DOMException> = [
                new Error('Regular error'),
                new DOMException('Abort error', 'AbortError'),
                new TypeError('Type error'),
                new DOMException('Network error', 'NetworkError'),
            ]

            const abortErrors = errors.filter(isAbortError)

            expect(abortErrors).toHaveLength(1)
            expect(abortErrors[0].name).toBe('AbortError')
            expect(abortErrors[0].message).toBe('Abort error')
        })

        test('should work in conditional statements', () => {
            const handleError = (error: unknown) => {
                if (isAbortError(error)) {
                    return `Abort: ${error.message}`
                }

                return 'Other error'
            }

            const abortError = new DOMException('Operation aborted', 'AbortError')
            const regularError = new Error('Regular error')

            expect(handleError(abortError)).toBe('Abort: Operation aborted')
            expect(handleError(regularError)).toBe('Other error')
        })
    })

    describe('real-world scenarios', () => {
        test('should work with fetch abort scenarios', async () => {
            const controller = new AbortController()
            const signal = controller.signal

            controller.abort()

            try {
                await fetch('https://example.com', { signal })
            } catch (error) {
                if (isAbortError(error)) {
                    expect(error.name).toBe('AbortError')
                    expect(error).toBeInstanceOf(DOMException)
                }
            }
        })

        test('should work with AbortController.abort() with reason', () => {
            const controller = new AbortController()
            const customReason = new DOMException('Custom abort reason', 'AbortError')

            controller.abort(customReason)

            const signal = controller.signal
            if (signal.aborted && signal.reason) {
                expect(isAbortError(signal.reason)).toBe(true)
            }
        })

        test('should distinguish between different abort scenarios', () => {
            const timeoutAbort = new DOMException('Timeout', 'TimeoutError')
            const userAbort = new DOMException('User cancelled', 'AbortError')
            const networkAbort = new DOMException('Network failed', 'NetworkError')

            expect(isAbortError(timeoutAbort)).toBe(false)
            expect(isAbortError(userAbort)).toBe(true)
            expect(isAbortError(networkAbort)).toBe(false)
        })
    })
})
