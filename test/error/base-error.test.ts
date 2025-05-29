import { describe, expect, test, vi } from 'vitest'
import { BaseError, type BaseErrorOptions } from '../../src/error/base-error'

class TestError extends BaseError {
    constructor(message?: string, options?: BaseErrorOptions) {
        super(message, options)
    }
}

class CustomError extends BaseError {
    public readonly customProperty: string

    constructor(message?: string, customProperty = 'default', options?: BaseErrorOptions) {
        super(message, options)
        this.customProperty = customProperty
    }
}

describe('BaseError', () => {
    describe('basic functionality', () => {
        test('should create error with default values', () => {
            const error = new TestError()

            expect(error).toBeInstanceOf(Error)
            expect(error).toBeInstanceOf(BaseError)
            expect(error.name).toBe('TestError')
            expect(error.message).toBe('')
            expect(error.timestamp).toBeInstanceOf(Date)
            expect(error.code).toBeUndefined()
            expect(error.retryable).toBeUndefined()
            expect(error.cause).toBeUndefined()
        })

        test('should create error with message', () => {
            const message = 'Test error message'
            const error = new TestError(message)

            expect(error.message).toBe(message)
            expect(error.name).toBe('TestError')
        })

        test('should create error with custom name', () => {
            const customName = 'CustomErrorName'
            const error = new TestError('message', { name: customName })

            expect(error.name).toBe(customName)
        })

        test('should create error with string code', () => {
            const code = 'ERROR_CODE'
            const error = new TestError('message', { code })

            expect(error.code).toBe(code)
        })

        test('should create error with number code', () => {
            const code = 500
            const error = new TestError('message', { code })

            expect(error.code).toBe(code)
        })

        test('should create error with symbol code', () => {
            const code = Symbol('error')
            const error = new TestError('message', { code })

            expect(error.code).toBe(code)
        })

        test('should create error with retryable flag', () => {
            const retryableError = new TestError('message', { retryable: true })
            const nonRetryableError = new TestError('message', { retryable: false })

            expect(retryableError.retryable).toBe(true)
            expect(nonRetryableError.retryable).toBe(false)
        })

        test('should create error with cause', () => {
            const cause = new Error('Original error')
            const error = new TestError('message', { cause })

            expect(error.cause).toBe(cause)
        })

        test('should set timestamp on creation', () => {
            const before = new Date()
            const error = new TestError()
            const after = new Date()

            expect(error.timestamp.getTime()).toBeGreaterThanOrEqual(before.getTime())
            expect(error.timestamp.getTime()).toBeLessThanOrEqual(after.getTime())
        })
    })

    describe('inheritance and prototype chain', () => {
        test('should maintain correct prototype chain', () => {
            const error = new TestError()

            expect(error).toBeInstanceOf(TestError)
            expect(error).toBeInstanceOf(BaseError)
            expect(error).toBeInstanceOf(Error)
        })

        test('should work with instanceof checks', () => {
            const error = new TestError()

            expect(error instanceof Error).toBe(true)
            expect(error instanceof BaseError).toBe(true)
            expect(error instanceof TestError).toBe(true)
        })

        test('should have correct constructor name', () => {
            const error = new TestError()

            expect(error.constructor.name).toBe('TestError')
        })

        test('should work with subclasses', () => {
            const error = new CustomError('message', 'custom')

            expect(error).toBeInstanceOf(CustomError)
            expect(error).toBeInstanceOf(BaseError)
            expect(error).toBeInstanceOf(Error)
            expect(error.customProperty).toBe('custom')
        })
    })

    describe('stack trace handling', () => {
        test('should capture stack trace when available', () => {
            const originalCaptureStackTrace = Error.captureStackTrace
            const mockCaptureStackTrace = vi.fn()
            Error.captureStackTrace = mockCaptureStackTrace

            new TestError()

            expect(mockCaptureStackTrace).toHaveBeenCalled()

            Error.captureStackTrace = originalCaptureStackTrace
        })

        test('should handle missing captureStackTrace gracefully', () => {
            const originalCaptureStackTrace = Error.captureStackTrace
            // @ts-expect-error - Testing runtime behavior
            Error.captureStackTrace = undefined

            expect(() => new TestError()).not.toThrow()

            Error.captureStackTrace = originalCaptureStackTrace
        })

        test('should have stack trace', () => {
            const error = new TestError('message')

            expect(error.stack).toBeDefined()
            expect(typeof error.stack).toBe('string')
        })
    })

    describe('withValue method', () => {
        test('should add property with value', () => {
            const error = new TestError()
            const result = error['withValue']('testProp', 'testValue')

            expect(result).toBe(error)
            expect((error as any).testProp).toBe('testValue')
        })

        test('should not add property when value is undefined', () => {
            const error = new TestError()
            error['withValue']('testProp', undefined)

            expect((error as any).testProp).toBeUndefined()
            expect('testProp' in error).toBe(false)
        })

        test('should make property non-writable', () => {
            const error = new TestError()
            error['withValue']('testProp', 'initial')

            const descriptor = Object.getOwnPropertyDescriptor(error, 'testProp')
            expect(descriptor?.writable).toBe(false)
            expect(descriptor?.enumerable).toBe(true)
            expect(descriptor?.configurable).toBe(false)
        })

        test('should make property enumerable', () => {
            const error = new TestError()
            error['withValue']('testProp', 'value')

            const descriptor = Object.getOwnPropertyDescriptor(error, 'testProp')
            expect(descriptor?.enumerable).toBe(true)
        })

        test('should make property non-configurable', () => {
            const error = new TestError()
            error['withValue']('testProp', 'value')

            const descriptor = Object.getOwnPropertyDescriptor(error, 'testProp')
            expect(descriptor?.configurable).toBe(false)
        })

        test('should return this for method chaining', () => {
            const error = new TestError()
            const result = error['withValue']('prop1', 'value1')['withValue']('prop2', 'value2')

            expect(result).toBe(error)
            expect((error as any).prop1).toBe('value1')
            expect((error as any).prop2).toBe('value2')
        })
    })

    describe('toJSON method', () => {
        test('should serialize basic properties', () => {
            const error = new TestError('test message', { code: 'TEST_CODE', retryable: true })
            const json = error.toJSON()

            expect(json.name).toBe('TestError')
            expect(json.message).toBe('test message')
            expect(json.code).toBe('TEST_CODE')
            expect(json.timestamp).toBe(error.timestamp.toISOString())
            expect(json.stack).toBe(error.stack)
        })

        test('should serialize custom properties', () => {
            const error = new CustomError('message', 'custom value')
            const json = error.toJSON()

            expect(json.customProperty).toBe('custom value')
        })

        test('should serialize cause when it is an Error', () => {
            const cause = new Error('Original error')
            const error = new TestError('message', { cause })
            const json = error.toJSON()

            expect(json.cause).toBeDefined()
            expect(typeof json.cause).toBe('object')
        })

        test('should serialize cause when it has toJSON method', () => {
            const cause = new TestError('cause message', { code: 'CAUSE_CODE' })
            const error = new TestError('message', { cause })
            const json = error.toJSON()

            expect(json.cause).toBeDefined()
            expect((json.cause as any).code).toBe('CAUSE_CODE')
        })

        test('should serialize cause when it does not have toJSON method', () => {
            const cause = new Error('simple error')
            const error = new TestError('message', { cause })
            const json = error.toJSON()

            expect(json.cause).toBe(cause)
        })

        test('should serialize non-Error cause', () => {
            const cause = { message: 'custom cause', code: 500 }
            const error = new TestError('message', { cause })
            const json = error.toJSON()

            expect(json.cause).toBe(cause)
        })

        test('should handle undefined cause', () => {
            const error = new TestError('message')
            const json = error.toJSON()

            expect('cause' in json).toBe(false)
        })

        test('should include all enumerable properties', () => {
            const error = new TestError()
            error['withValue']('customProp', 'customValue')
            const json = error.toJSON()

            expect(json.customProp).toBe('customValue')
        })
    })

    describe('toString method', () => {
        test('should return formatted string representation', () => {
            const error = new TestError('test message', { code: 'TEST_CODE' })
            const result = error.toString()

            expect(typeof result).toBe('string')
            expect(result).toContain('TEST_CODE')
            expect(result).toContain('TestError')
            expect(result).toContain('test message')
        })

        test('should handle error without code', () => {
            const error = new TestError('test message')
            const result = error.toString()

            expect(result).toContain('TestError')
            expect(result).toContain('test message')
        })

        test('should handle error with cause', () => {
            const cause = new Error('Original error')
            const error = new TestError('test message', { cause })
            const result = error.toString()

            expect(result).toContain('test message')
            expect(result).toContain('Caused by')
        })
    })

    describe('error code types', () => {
        test('should handle string error codes', () => {
            const codes: string[] = ['ERROR_CODE', 'VALIDATION_ERROR', 'NETWORK_ERROR']

            for (const code of codes) {
                const error = new TestError('message', { code })
                expect(error.code).toBe(code)
            }
        })

        test('should handle number error codes', () => {
            const codes: number[] = [400, 404, 500, 0, -1]

            for (const code of codes) {
                const error = new TestError('message', { code })
                expect(error.code).toBe(code)
            }
        })

        test('should handle symbol error codes', () => {
            const codes: symbol[] = [Symbol('error1'), Symbol('error2'), Symbol.for('global')]

            for (const code of codes) {
                const error = new TestError('message', { code })
                expect(error.code).toBe(code)
            }
        })
    })

    describe('edge cases and error conditions', () => {
        test('should handle empty message', () => {
            const error = new TestError('')

            expect(error.message).toBe('')
        })

        test('should handle null message', () => {
            // @ts-expect-error - Testing runtime behavior
            const error = new TestError(null)

            expect(error.message).toBe('null')
        })

        test('should handle undefined message', () => {
            const error = new TestError(undefined)

            expect(error.message).toBe('')
        })

        test('should handle complex options object', () => {
            const options: BaseErrorOptions = {
                name: 'ComplexError',
                code: Symbol('complex'),
                retryable: true,
                cause: new Error('nested'),
            }

            const error = new TestError('message', options)

            expect(error.name).toBe('ComplexError')
            expect(error.code).toBe(options.code)
            expect(error.retryable).toBe(true)
            expect(error.cause).toBe(options.cause)
        })

        test('should handle empty options object', () => {
            const error = new TestError('message', {})

            expect(error.name).toBe('TestError')
            expect(error.code).toBeUndefined()
            expect(error.retryable).toBeUndefined()
        })

        test('should handle falsy values in options', () => {
            const error = new TestError('message', {
                name: '',
                code: 0,
                retryable: false,
            })

            expect(error.name).toBe('')
            expect(error.code).toBe(0)
            expect(error.retryable).toBe(false)
        })
    })

    describe('readonly properties', () => {
        test('should have timestamp property', () => {
            const error = new TestError()

            expect(error.timestamp).toBeInstanceOf(Date)
            expect(error.timestamp).toBeDefined()
        })

        test('should have code property when provided', () => {
            const error = new TestError('message', { code: 'ORIGINAL' })

            expect(error.code).toBe('ORIGINAL')
        })

        test('should have retryable property when provided', () => {
            const error = new TestError('message', { retryable: true })

            expect(error.retryable).toBe(true)
        })
    })
})
