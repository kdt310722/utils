import { describe, expect, test } from 'vitest'
import { BaseError } from '../../src/error/base-error'
import { buildCauseChain, formatCause } from '../../src/error/causes'

class TestBaseError extends BaseError {
    constructor(message?: string, code?: string, cause?: unknown) {
        super(message, { code, cause })
    }
}

describe('formatCause', () => {
    describe('null and undefined handling', () => {
        test('should format null cause', () => {
            const visited = new WeakSet()
            const result = formatCause(null, visited)

            expect(result).toBe('null')
        })

        test('should format undefined cause', () => {
            const visited = new WeakSet()
            const result = formatCause(undefined, visited)

            expect(result).toBe('undefined')
        })
    })

    describe('circular reference detection', () => {
        test('should detect circular references in objects', () => {
            const visited = new WeakSet()
            const obj = { message: 'test' }
            visited.add(obj)

            const result = formatCause(obj, visited)

            expect(result).toBe('[Circular reference detected]')
        })

        test('should detect circular references in arrays', () => {
            const visited = new WeakSet()
            const arr = [1, 2, 3]
            visited.add(arr)

            const result = formatCause(arr, visited)

            expect(result).toBe('[Circular reference detected]')
        })

        test('should not detect circular reference for new objects', () => {
            const visited = new WeakSet()
            const obj = { message: 'test' }

            const result = formatCause(obj, visited)

            expect(result).toBe('[object Object]')
        })

        test('should add objects to visited set', () => {
            const visited = new WeakSet()
            const obj = { message: 'test' }

            formatCause(obj, visited)

            expect(visited.has(obj)).toBe(true)
        })
    })

    describe('Error object formatting', () => {
        test('should format standard Error objects', () => {
            const visited = new WeakSet()
            const error = new Error('Test error message')
            const result = formatCause(error, visited)

            expect(result).toBe('Error: Test error message')
        })

        test('should format custom Error objects', () => {
            const visited = new WeakSet()
            const error = new TypeError('Type error message')
            const result = formatCause(error, visited)

            expect(result).toBe('TypeError: Type error message')
        })

        test('should format BaseError objects in cause chain', () => {
            const visited = new WeakSet()
            const error = new TestBaseError('Base error message', 'TEST_CODE')
            const result = formatCause(error, visited, true)

            expect(result).toBe('[TEST_CODE] TestBaseError: Base error message')
        })

        test('should format BaseError objects without code in cause chain', () => {
            const visited = new WeakSet()
            const error = new TestBaseError('Base error message')
            const result = formatCause(error, visited, true)

            expect(result).toBe('TestBaseError: Base error message')
        })

        test('should format BaseError objects not in cause chain', () => {
            const visited = new WeakSet()
            const error = new TestBaseError('Base error message', 'TEST_CODE')
            const result = formatCause(error, visited, false)

            expect(result).toBe('TestBaseError: Base error message')
        })

        test('should handle Error objects with empty message', () => {
            const visited = new WeakSet()
            const error = new Error('')
            const result = formatCause(error, visited)

            expect(result).toBe('Error: ')
        })

        test('should handle Error objects with undefined message', () => {
            const visited = new WeakSet()
            const error = new Error()
            const result = formatCause(error, visited)

            expect(result).toBe('Error: ')
        })
    })

    describe('primitive value formatting', () => {
        test('should format string values', () => {
            const visited = new WeakSet()
            const result = formatCause('string cause', visited)

            expect(result).toBe('string cause')
        })

        test('should format number values', () => {
            const visited = new WeakSet()
            const result = formatCause(42, visited)

            expect(result).toBe('42')
        })

        test('should format boolean values', () => {
            const visited = new WeakSet()
            const trueResult = formatCause(true, visited)
            const falseResult = formatCause(false, visited)

            expect(trueResult).toBe('true')
            expect(falseResult).toBe('false')
        })

        test('should format symbol values', () => {
            const visited = new WeakSet()
            const symbol = Symbol('test')
            const result = formatCause(symbol, visited)

            expect(result).toBe('Symbol(test)')
        })

        test('should format bigint values', () => {
            const visited = new WeakSet()
            const result = formatCause(BigInt(123), visited)

            expect(result).toBe('123')
        })
    })

    describe('object value formatting', () => {
        test('should format plain objects', () => {
            const visited = new WeakSet()
            const obj = { key: 'value' }
            const result = formatCause(obj, visited)

            expect(result).toBe('[object Object]')
        })

        test('should format arrays', () => {
            const visited = new WeakSet()
            const arr = [1, 2, 3]
            const result = formatCause(arr, visited)

            expect(result).toBe('1,2,3')
        })

        test('should format Date objects', () => {
            const visited = new WeakSet()
            const date = new Date('2023-01-01T00:00:00.000Z')
            const result = formatCause(date, visited)

            expect(result).toBe(date.toString())
        })

        test('should format RegExp objects', () => {
            const visited = new WeakSet()
            const regex = /test/gi
            const result = formatCause(regex, visited)

            expect(result).toBe('/test/gi')
        })
    })

    describe('edge cases', () => {
        test('should handle functions', () => {
            const visited = new WeakSet()
            const func = () => 'test'
            const result = formatCause(func, visited)

            expect(result).toBe('() => "test"')
        })

        test('should handle objects with custom toString', () => {
            const visited = new WeakSet()
            const obj = {
                toString() {
                    return 'custom string representation'
                },
            }
            const result = formatCause(obj, visited)

            expect(result).toBe('custom string representation')
        })

        test('should handle objects with null prototype', () => {
            const visited = new WeakSet()
            const obj = Object.create(null)
            obj.message = 'test'
            const result = formatCause(obj, visited)

            expect(result).toBe('[object Object]')
        })
    })
})

describe('buildCauseChain', () => {
    describe('basic functionality', () => {
        test('should return empty string for null cause', () => {
            const result = buildCauseChain(null)

            expect(result).toBe('')
        })

        test('should return empty string for undefined cause', () => {
            const result = buildCauseChain(undefined)

            expect(result).toBe('')
        })

        test('should return empty string for zero maxDepth', () => {
            const cause = new Error('test')
            const result = buildCauseChain(cause, 0)

            expect(result).toBe('')
        })

        test('should return empty string for negative maxDepth', () => {
            const cause = new Error('test')
            const result = buildCauseChain(cause, -1)

            expect(result).toBe('')
        })

        test('should format single cause', () => {
            const cause = new Error('Single error')
            const result = buildCauseChain(cause, 3)

            expect(result).toBe('Error: Single error')
        })
    })

    describe('cause chain building', () => {
        test('should build chain with multiple Error causes', () => {
            const rootCause = new Error('Root cause')
            const middleCause = new Error('Middle cause', { cause: rootCause })
            const topCause = new Error('Top cause', { cause: middleCause })

            const result = buildCauseChain(topCause, 5)

            expect(result).toContain('Error: Top cause')
            expect(result).toContain('Error: Middle cause')
            expect(result).toContain('Error: Root cause')
            expect(result).toContain('Caused by:')
        })

        test('should build chain with BaseError causes', () => {
            const rootCause = new TestBaseError('Root error', 'ROOT_CODE')
            const middleCause = new TestBaseError('Middle error', 'MIDDLE_CODE', rootCause)
            const topCause = new TestBaseError('Top error', 'TOP_CODE', middleCause)

            const result = buildCauseChain(topCause, 5)

            expect(result).toContain('[TOP_CODE] TestBaseError: Top error')
            expect(result).toContain('[MIDDLE_CODE] TestBaseError: Middle error')
            expect(result).toContain('[ROOT_CODE] TestBaseError: Root error')
        })

        test('should respect maxDepth limit', () => {
            const cause1 = new Error('Cause 1')
            const cause2 = new Error('Cause 2', { cause: cause1 })
            const cause3 = new Error('Cause 3', { cause: cause2 })
            const cause4 = new Error('Cause 4', { cause: cause3 })

            const result = buildCauseChain(cause4, 2)

            expect(result).toContain('Error: Cause 4')
            expect(result).toContain('Error: Cause 3')
            expect(result).not.toContain('Error: Cause 2')
            expect(result).not.toContain('Error: Cause 1')
            expect(result).toContain('[Additional causes truncated...]')
        })

        test('should use default maxDepth of 3', () => {
            const cause1 = new Error('Cause 1')
            const cause2 = new Error('Cause 2', { cause: cause1 })
            const cause3 = new Error('Cause 3', { cause: cause2 })
            const cause4 = new Error('Cause 4', { cause: cause3 })
            const cause5 = new Error('Cause 5', { cause: cause4 })

            const result = buildCauseChain(cause5)

            expect(result).toContain('Error: Cause 5')
            expect(result).toContain('Error: Cause 4')
            expect(result).toContain('Error: Cause 3')
            expect(result).not.toContain('Error: Cause 2')
            expect(result).not.toContain('Error: Cause 1')
            expect(result).toContain('[Additional causes truncated...]')
        })

        test('should handle non-Error causes in chain', () => {
            const stringCause = 'String error'
            const errorWithStringCause = new Error('Error with string cause', { cause: stringCause })

            const result = buildCauseChain(errorWithStringCause, 3)

            expect(result).toContain('Error: Error with string cause')
            expect(result).toContain('String error')
        })

        test('should stop at non-Error cause', () => {
            const stringCause = 'String cause'
            const errorCause = new Error('Error cause', { cause: stringCause })
            const topError = new Error('Top error', { cause: errorCause })

            const result = buildCauseChain(topError, 5)

            expect(result).toContain('Error: Top error')
            expect(result).toContain('Error: Error cause')
            expect(result).toContain('String cause')
        })
    })

    describe('circular reference protection', () => {
        test('should handle circular references in cause chain', () => {
            const error1 = new Error('Error 1')
            const error2 = new Error('Error 2', { cause: error1 })
            // Create circular reference
            ;(error1 as any).cause = error2

            const result = buildCauseChain(error2, 5)

            expect(result).toContain('Error: Error 2')
            expect(result).toContain('Error: Error 1')
            expect(result).toContain('[Circular reference detected]')
        })

        test('should handle self-referencing error', () => {
            const error = new Error('Self-referencing error')
            ;(error as any).cause = error

            const result = buildCauseChain(error, 3)

            expect(result).toContain('Error: Self-referencing error')
            expect(result).toContain('[Circular reference detected]')
        })
    })

    describe('edge cases', () => {
        test('should handle empty error messages', () => {
            const cause = new Error('')
            const result = buildCauseChain(cause, 3)

            expect(result).toBe('Error: ')
        })

        test('should handle mixed error types', () => {
            const typeError = new TypeError('Type error')
            const rangeError = new RangeError('Range error', { cause: typeError })
            const syntaxError = new SyntaxError('Syntax error', { cause: rangeError })

            const result = buildCauseChain(syntaxError, 5)

            expect(result).toContain('SyntaxError: Syntax error')
            expect(result).toContain('RangeError: Range error')
            expect(result).toContain('TypeError: Type error')
        })

        test('should handle causes with falsy values', () => {
            const error1 = new Error('Error with false cause', { cause: false })
            const error2 = new Error('Error with 0 cause', { cause: 0 })
            const error3 = new Error('Error with empty string cause', { cause: '' })

            expect(buildCauseChain(error1, 3)).toContain('false')
            expect(buildCauseChain(error2, 3)).toContain('0')
            expect(buildCauseChain(error3, 3)).toContain('Error with empty string cause')
        })

        test('should handle very deep cause chains', () => {
            let currentError = new Error('Root error')

            for (let i = 1; i <= 100; i++) {
                currentError = new Error(`Error ${i}`, { cause: currentError })
            }

            const result = buildCauseChain(currentError, 3)

            expect(result).toContain('Error 100')
            expect(result).toContain('Error 99')
            expect(result).toContain('Error 98')
            expect(result).toContain('[Additional causes truncated...]')
        })

        test('should handle object causes without toString method', () => {
            const objCause = Object.create(null)
            objCause.message = 'object cause'
            const error = new Error('Error with object cause', { cause: objCause })

            const result = buildCauseChain(error, 3)

            expect(result).toContain('Error: Error with object cause')
            expect(result).toContain('[object Object]')
        })
    })

    describe('formatting consistency', () => {
        test('should maintain consistent formatting across chain levels', () => {
            const baseError1 = new TestBaseError('Base error 1', 'CODE1')
            const baseError2 = new TestBaseError('Base error 2', 'CODE2', baseError1)
            const baseError3 = new TestBaseError('Base error 3', 'CODE3', baseError2)

            const result = buildCauseChain(baseError3, 5)

            const lines = result.split('\n  Caused by: ')
            expect(lines[0]).toBe('[CODE3] TestBaseError: Base error 3')
            expect(lines[1]).toBe('[CODE2] TestBaseError: Base error 2')
            expect(lines[2]).toBe('[CODE1] TestBaseError: Base error 1')
        })

        test('should handle mixed BaseError and regular Error in chain', () => {
            const regularError = new Error('Regular error')
            const baseError = new TestBaseError('Base error', 'BASE_CODE', regularError)

            const result = buildCauseChain(baseError, 3)

            expect(result).toContain('[BASE_CODE] TestBaseError: Base error')
            expect(result).toContain('Error: Regular error')
        })
    })
})
