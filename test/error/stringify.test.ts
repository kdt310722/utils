import { describe, expect, test } from 'vitest'
import { BaseError } from '../../src/error/base-error'
import { stringifyError, type ErrorStringifyOptions } from '../../src/error/stringify'

class TestError extends BaseError {
    constructor(message?: string, code?: string | number | symbol, cause?: unknown) {
        super(message, { code, cause })
    }
}

describe('stringifyError', () => {
    describe('basic functionality', () => {
        test('should stringify simple error without options', () => {
            const error = new Error('Test error message')
            const result = stringifyError(error)

            expect(result).toBe('Error: Test error message')
        })

        test('should stringify error with empty message', () => {
            const error = new Error('')
            const result = stringifyError(error)

            expect(result).toBe('Error: ')
        })

        test('should stringify custom error types', () => {
            const typeError = new TypeError('Type error message')
            const rangeError = new RangeError('Range error message')

            expect(stringifyError(typeError)).toBe('TypeError: Type error message')
            expect(stringifyError(rangeError)).toBe('RangeError: Range error message')
        })
    })

    describe('error code handling', () => {
        test('should include string error code by default', () => {
            const error = new TestError('Test message', 'ERROR_CODE')
            const result = stringifyError(error)

            expect(result).toBe('[ERROR_CODE] TestError: Test message')
        })

        test('should include number error code by default', () => {
            const error = new TestError('Test message', 500)
            const result = stringifyError(error)

            expect(result).toBe('[500] TestError: Test message')
        })

        test('should exclude error code when includeCode is false', () => {
            const error = new TestError('Test message', 'ERROR_CODE')
            const result = stringifyError(error, { includeCode: false })

            expect(result).toBe('TestError: Test message')
        })

        test('should handle error without code', () => {
            const error = new Error('Test message')
            const result = stringifyError(error)

            expect(result).toBe('Error: Test message')
        })

        test('should handle falsy but valid codes', () => {
            const error1 = new Error('Test message')
            const error2 = new Error('Test message')

            ;(error1 as any).code = 0
            ;(error2 as any).code = false

            expect(stringifyError(error1)).toBe('[0] Error: Test message')
            expect(stringifyError(error2)).toBe('[false] Error: Test message')
        })
    })

    describe('cause handling', () => {
        test('should include cause by default', () => {
            const cause = new Error('Original error')
            const error = new TestError('Main error', 'ERROR_CODE', cause)
            const result = stringifyError(error)

            expect(result).toContain('TestError: Main error')
            expect(result).toContain('Caused by: Error: Original error')
        })

        test('should exclude cause when includeCause is false', () => {
            const cause = new Error('Original error')
            const error = new TestError('Main error', 'ERROR_CODE', cause)
            const result = stringifyError(error, { includeCause: false })

            expect(result).toBe('[ERROR_CODE] TestError: Main error')
            expect(result).not.toContain('Caused by')
        })

        test('should handle nested causes', () => {
            const rootCause = new Error('Root cause')
            const middleCause = new Error('Middle cause', { cause: rootCause })
            const topError = new TestError('Top error', 'TOP_CODE', middleCause)

            const result = stringifyError(topError)

            expect(result).toContain('[TOP_CODE] TestError: Top error')
            expect(result).toContain('Caused by: Error: Middle cause')
            expect(result).toContain('Caused by: Error: Root cause')
        })

        test('should respect maxCauseDepth', () => {
            const cause1 = new Error('Cause 1')
            const cause2 = new Error('Cause 2', { cause: cause1 })
            const cause3 = new Error('Cause 3', { cause: cause2 })
            const topError = new TestError('Top error', 'TOP_CODE', cause3)

            const result = stringifyError(topError, { maxCauseDepth: 2 })

            expect(result).toContain('TestError: Top error')
            expect(result).toContain('Error: Cause 3')
            expect(result).toContain('Error: Cause 2')
            expect(result).not.toContain('Error: Cause 1')
            expect(result).toContain('[Additional causes truncated...]')
        })

        test('should handle non-Error causes', () => {
            const stringCause = 'String error cause'
            const error = new TestError('Main error', 'ERROR_CODE', stringCause)
            const result = stringifyError(error)

            expect(result).toContain('[ERROR_CODE] TestError: Main error')
            expect(result).toContain('Caused by: String error cause')
        })
    })

    describe('options combinations', () => {
        test('should handle all options enabled', () => {
            const cause = new Error('Original error')
            const error = new TestError('Main error', 'ERROR_CODE', cause)
            const options: ErrorStringifyOptions = {
                includeCode: true,
                includeCause: true,
                maxCauseDepth: 5,
            }
            const result = stringifyError(error, options)

            expect(result).toContain('[ERROR_CODE] TestError: Main error')
            expect(result).toContain('Caused by: Error: Original error')
        })

        test('should handle all options disabled', () => {
            const cause = new Error('Original error')
            const error = new TestError('Main error', 'ERROR_CODE', cause)
            const options: ErrorStringifyOptions = {
                includeCode: false,
                includeCause: false,
                maxCauseDepth: 0,
            }
            const result = stringifyError(error, options)

            expect(result).toBe('TestError: Main error')
        })

        test('should handle empty options object', () => {
            const error = new TestError('Test message', 'ERROR_CODE')
            const result = stringifyError(error, {})

            expect(result).toBe('[ERROR_CODE] TestError: Test message')
        })
    })

    describe('edge cases', () => {
        test('should handle error with special characters in message', () => {
            const specialMessage = 'Error with\nnewlines\tand\ttabs'
            const error = new TestError(specialMessage, 'SPECIAL_CODE')
            const result = stringifyError(error)

            expect(result).toBe('[SPECIAL_CODE] TestError: Error with\nnewlines\tand\ttabs')
        })

        test('should handle circular references in cause chain', () => {
            const error1 = new Error('Error 1')
            const error2 = new Error('Error 2', { cause: error1 })
            ;(error1 as any).cause = error2

            const result = stringifyError(error2)

            expect(result).toContain('Error: Error 2')
            expect(result).toContain('Error: Error 1')
            expect(result).toContain('[Circular reference detected]')
        })

        test('should handle zero maxCauseDepth', () => {
            const cause = new Error('Original error')
            const error = new TestError('Main error', 'ERROR_CODE', cause)
            const result = stringifyError(error, { maxCauseDepth: 0 })

            expect(result).toBe('[ERROR_CODE] TestError: Main error')
        })
    })

    describe('BaseError integration', () => {
        test('should properly format BaseError with all properties', () => {
            const cause = new TestError('Cause error', 'CAUSE_CODE')
            const error = new TestError('Main error', 'MAIN_CODE', cause)
            const result = stringifyError(error)

            expect(result).toContain('[MAIN_CODE] TestError: Main error')
            expect(result).toContain('Caused by: [CAUSE_CODE] TestError: Cause error')
        })

        test('should handle BaseError without code', () => {
            const error = new TestError('Test message')
            const result = stringifyError(error)

            expect(result).toBe('TestError: Test message')
        })

        test('should handle mixed BaseError and regular Error', () => {
            const regularError = new Error('Regular error')
            const baseError = new TestError('Base error', 'BASE_CODE', regularError)
            const result = stringifyError(baseError)

            expect(result).toContain('[BASE_CODE] TestError: Base error')
            expect(result).toContain('Caused by: Error: Regular error')
        })
    })

    describe('type safety', () => {
        test('should handle Error objects with additional properties', () => {
            const error = new Error('Test message')
            ;(error as any).code = 'CUSTOM_CODE'
            const result = stringifyError(error)

            expect(result).toBe('[CUSTOM_CODE] Error: Test message')
        })

        test('should handle objects that look like errors', () => {
            const errorLike = {
                name: 'CustomError',
                message: 'Custom message',
                code: 'CUSTOM_CODE',
            }
            const result = stringifyError(errorLike as any)

            expect(result).toBe('[CUSTOM_CODE] CustomError: Custom message')
        })
    })

    describe('integration with toString', () => {
        test('should match BaseError toString output', () => {
            const error = new TestError('Test message', 'TEST_CODE')
            const stringifyResult = stringifyError(error)
            const toStringResult = error.toString()

            expect(stringifyResult).toBe(toStringResult)
        })

        test('should be consistent across multiple calls', () => {
            const error = new TestError('Test message', 'TEST_CODE')
            const result1 = stringifyError(error)
            const result2 = stringifyError(error)
            const result3 = stringifyError(error)

            expect(result1).toBe(result2)
            expect(result2).toBe(result3)
        })
    })
})
